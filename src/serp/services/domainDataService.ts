import type { DomainData } from '../types';
import { hashCode, seededRandom, randomInt, randomFloat, randomPick, randomPercentages } from '../utils/helpers';

const DESCRIPTIONS = [
    'A leading platform offering innovative solutions and services for users worldwide.',
    'Provides cutting-edge tools and resources for professionals and businesses.',
    'An established online destination for information, tools, and community engagement.',
    'Delivers comprehensive digital services with a focus on quality and reliability.',
    'A popular web platform known for its user-friendly interface and robust features.',
];

const KEYWORD_BASES = [
    'analytics', 'dashboard', 'platform', 'software', 'tools',
    'online', 'service', 'app', 'solution', 'management',
    'review', 'comparison', 'alternative', 'pricing', 'features',
    'tutorial', 'guide', 'best', 'free', 'top',
];

const REGIONS = [
    'United States', 'United Kingdom', 'Germany', 'France', 'Canada',
    'India', 'Brazil', 'Japan', 'Australia', 'Netherlands',
    'Spain', 'Italy', 'Mexico', 'South Korea', 'Sweden',
];

const MONTHS_BACK = 5;

function generateKeywords(rng: () => number, domain: string, searchQuery?: string): DomainData['topKeywords'] {
    const count = randomInt(rng, 5, 10);
    const keywords: DomainData['topKeywords'] = [];
    const domainBase = domain.split('.')[0];
    const queryWords = searchQuery ? searchQuery.toLowerCase().split(/\s+/) : [];

    for (let i = 0; i < count; i++) {
        let name: string;
        if (i < queryWords.length) {
            name = `${queryWords[i]} ${randomPick(rng, KEYWORD_BASES)}`;
        } else if (i < queryWords.length + 2) {
            name = `${domainBase} ${randomPick(rng, KEYWORD_BASES)}`;
        } else {
            name = `${randomPick(rng, KEYWORD_BASES)} ${randomPick(rng, KEYWORD_BASES)}`;
        }

        const traffic = randomInt(rng, 1_000, 20_000_000);
        const volume = traffic + randomInt(rng, 0, traffic);
        const cpc = randomFloat(rng, 0.05, 15.0, 2);
        keywords.push({ name, traffic, volume, cpc });
    }

    return keywords;
}

function generateVisitTrends(rng: () => number, monthlyVisits: number): DomainData['visitTrends'] {
    const now = new Date();
    const trends: DomainData['visitTrends'] = [];

    for (let i = MONTHS_BACK - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const variance = randomFloat(rng, 0.6, 1.4, 2);
        const traffic = Math.round(monthlyVisits * variance);
        trends.push({ month, traffic });
    }

    return trends;
}

function generateRegistrationDate(rng: () => number): string {
    const year = randomInt(rng, 1995, 2025);
    const month = randomInt(rng, 1, 12);
    const day = randomInt(rng, 1, 28);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export async function getDomainData(domain: string, searchQuery?: string): Promise<DomainData> {
    const seed = hashCode(domain);
    const rng = seededRandom(seed);

    const siteName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    const description = randomPick(rng, DESCRIPTIONS);
    const globalRank = randomInt(rng, 50, 3_000_000);
    const monthlyVisits = randomInt(rng, 1_000, 50_000_000);

    const totalSeconds = randomInt(rng, 72, 510);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    const timeOnSite = `${m}:${String(s).padStart(2, '0')}`;

    const pagesPerVisit = randomFloat(rng, 1.2, 8.5, 2);
    const bounceRate = randomFloat(rng, 20, 85, 2);

    const sourceNames: DomainData['trafficSources'][number]['source'][] = [
        'search', 'direct', 'referrals', 'social', 'paid_referrals', 'mail',
    ];
    const percentages = randomPercentages(rng, 6);
    const trafficSources = sourceNames.map((source, i) => ({
        source,
        share: percentages[i],
    }));

    const visitTrends = generateVisitTrends(rng, monthlyVisits);

    const regionPercentages = randomPercentages(rng, 5);
    const regionScale = 95 / regionPercentages.reduce((a, b) => a + b, 0);
    const shuffledRegions = [...REGIONS].sort(() => rng() - 0.5).slice(0, 5);
    const regionDistribution = shuffledRegions.map((region, i) => ({
        region,
        percentage: parseFloat((regionPercentages[i] * regionScale).toFixed(2)),
    }));
    const regionSum = regionDistribution.slice(0, -1).reduce((a, r) => a + r.percentage, 0);
    regionDistribution[regionDistribution.length - 1].percentage = parseFloat((95 - regionSum).toFixed(2));

    const registrationDate = generateRegistrationDate(rng);
    const topKeywords = generateKeywords(rng, domain, searchQuery);

    return {
        siteName,
        description,
        globalRank,
        monthlyVisits,
        timeOnSite,
        pagesPerVisit,
        bounceRate,
        topKeywords,
        trafficSources,
        visitTrends,
        regionDistribution,
        registrationDate,
    };
}
