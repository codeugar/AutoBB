import type { SerpApiResponse, SerperApiResponse } from '../types';
import { hashCode, seededRandom, randomInt, randomPick } from '../utils/helpers';
import { API_TIMEOUT_MS } from '../utils/constants';
import { storage } from '@/storage';

const SERPER_ENDPOINT = 'https://google.serper.dev/search';

const MOCK_DOMAINS = [
    'example.com', 'techcrunch.com', 'github.com', 'medium.com',
    'dev.to', 'stackoverflow.com', 'producthunt.com', 'ycombinator.com',
    'hackernoon.com', 'theverge.com', 'arstechnica.com', 'wired.com',
    'mashable.com', 'venturebeat.com', 'zdnet.com', 'cnet.com',
    'engadget.com', 'gizmodo.com', 'lifehacker.com', 'readwrite.com',
];

const MOCK_TITLE_TEMPLATES = [
    'Best {query} Tools 2026',
    'Top {query} Alternatives',
    '{query} - Complete Guide',
    '{query} Review: Pros and Cons',
    'How to Use {query} Effectively',
    'The Ultimate {query} Comparison',
    '{query} vs Competitors: Which Is Better?',
    'Getting Started with {query}',
    '{query}: Tips, Tricks, and Best Practices',
    'Why {query} Is Trending in 2026',
    'A Deep Dive into {query}',
    '{query} for Beginners: Everything You Need to Know',
    'Is {query} Worth It? An Honest Review',
    '{query} Pricing and Features Breakdown',
    'Top 10 {query} Resources',
];

const MOCK_CONTENT_TEMPLATES = [
    'Comprehensive overview of {query} with detailed analysis and expert recommendations.',
    'Explore the best {query} options available today. Compare features, pricing, and reviews.',
    'Learn everything about {query} with our in-depth guide. Updated for 2026.',
    'Discover why professionals choose {query}. Read real user experiences and insights.',
    'Find the perfect {query} solution for your needs. Side-by-side comparison included.',
];

const MOCK_SUGGESTION_TEMPLATES = [
    '{query} alternatives',
    '{query} pricing',
    '{query} review',
    'best {query}',
    '{query} free',
    '{query} vs',
    '{query} tutorial',
    '{query} comparison',
];

function generateMockResults(query: string, num: number): SerpApiResponse {
    const seed = hashCode(`${query}-serper`);
    const rng = seededRandom(seed);

    const results: SerpApiResponse['data']['results'] = Array.from(
        { length: num },
        (_, i) => {
            const domain = MOCK_DOMAINS[randomInt(rng, 0, MOCK_DOMAINS.length - 1)];
            const titleTemplate = randomPick(rng, MOCK_TITLE_TEMPLATES);
            const contentTemplate = randomPick(rng, MOCK_CONTENT_TEMPLATES);
            const path = `/article-${randomInt(rng, 1000, 9999)}`;

            return {
                title: titleTemplate.replace('{query}', query),
                url: `https://${domain}${path}`,
                content: contentTemplate.replace('{query}', query),
                position: i + 1,
            };
        },
    );

    const suggestionSeed = hashCode(`${query}-suggestions`);
    const suggestionRng = seededRandom(suggestionSeed);
    const suggestionCount = randomInt(suggestionRng, 3, 5);
    const suggestions = Array.from({ length: suggestionCount }, () => {
        const template = randomPick(suggestionRng, MOCK_SUGGESTION_TEMPLATES);
        return template.replace('{query}', query);
    });

    return {
        success: true,
        data: { query, results, suggestions },
    };
}

/**
 * Normalize Serper API response to our internal format.
 */
function normalizeSerperResponse(query: string, serper: SerperApiResponse): SerpApiResponse {
    return {
        success: true,
        data: {
            query,
            results: serper.organic.map((item) => ({
                title: item.title,
                url: item.link,
                content: item.snippet || '',
                position: item.position,
            })),
            suggestions: serper.relatedSearches?.map((s) => s.query) ?? [],
        },
    };
}

const RESULTS_PER_PAGE = 10; // Serper returns ~10 organic results per page

/**
 * Single-page Serper API call.
 */
async function fetchSerperPage(
    apiKey: string,
    query: string,
    country: string,
    language: string,
    page: number,
): Promise<SerperApiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
        const response = await fetch(SERPER_ENDPOINT, {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: query,
                gl: country.toLowerCase(),
                hl: language.toLowerCase(),
                page,
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your Serper API key in Settings.');
            }
            const body = await response.json().catch(() => ({})) as { message?: string };
            throw new Error(body.message || `API request failed with status ${response.status}`);
        }

        return await response.json() as SerperApiResponse;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Search using Serper API. Returns normalized results for a single page.
 */
export async function searchSerp(
    query: string,
    country: string,
    language: string,
    num: number = 10,
): Promise<SerpApiResponse> {
    const isMock = await storage.getSerpMockMode();

    if (isMock) {
        return generateMockResults(query, num);
    }

    const apiKey = await storage.getSerperApiKey();
    if (!apiKey) {
        throw new Error('No Serper API key configured. Please add your key in Settings, or enable Mock Mode.');
    }

    const serperData = await fetchSerperPage(apiKey, query, country, language, 1);
    return normalizeSerperResponse(query, serperData);
}

/**
 * Search with multi-page pagination.
 * Serper returns ~10 results per page. For perPage > 10, we fetch multiple pages concurrently.
 */
export async function searchSerpAll(
    query: string,
    country: string,
    language: string,
    perPage: number,
): Promise<SerpApiResponse> {
    const isMock = await storage.getSerpMockMode();

    if (isMock) {
        return generateMockResults(query, perPage);
    }

    const apiKey = await storage.getSerperApiKey();
    if (!apiKey) {
        throw new Error('No Serper API key configured. Please add your key in Settings, or enable Mock Mode.');
    }

    const totalPages = Math.ceil(perPage / RESULTS_PER_PAGE);

    // Fetch all pages concurrently
    const pages = await Promise.all(
        Array.from({ length: totalPages }, (_, i) =>
            fetchSerperPage(apiKey, query, country, language, i + 1),
        ),
    );

    // Merge and dedup across pages
    const allResults: SerpApiResponse['data']['results'] = [];
    const seenUrls = new Set<string>();

    for (const page of pages) {
        for (const item of page.organic) {
            if (!seenUrls.has(item.link)) {
                seenUrls.add(item.link);
                allResults.push({
                    title: item.title,
                    url: item.link,
                    content: item.snippet || '',
                    position: allResults.length + 1,
                });
            }
        }
    }

    const suggestions = pages[0]?.relatedSearches?.map((s) => s.query) ?? [];

    return {
        success: true,
        data: { query, results: allResults, suggestions },
    };
}
