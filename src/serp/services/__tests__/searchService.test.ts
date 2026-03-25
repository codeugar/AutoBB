import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock storage module
vi.mock('@/storage', () => ({
    storage: {
        getSerperApiKey: vi.fn(),
        getSerpMockMode: vi.fn(),
    },
}));

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import after mocks are set up
import { searchSerp, searchSerpAll } from '../searchService';
import { storage } from '@/storage';

const mockedStorage = vi.mocked(storage);

describe('searchService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedStorage.getSerpMockMode.mockResolvedValue(true);
        mockedStorage.getSerperApiKey.mockResolvedValue('test-api-key');
    });

    describe('mock mode', () => {
        describe('searchSerp', () => {
            it('returns requested number of results in mock mode', async () => {
                const result = await searchSerp('test query', 'US', 'en', 10);

                expect(result.data.results).toHaveLength(10);
                expect(result.success).toBe(true);
                expect(result.data.query).toBe('test query');
            });

            it('returns deterministic results for the same query', async () => {
                const result1 = await searchSerp('seo tools', 'US', 'en', 10);
                const result2 = await searchSerp('seo tools', 'US', 'en', 10);

                expect(result1).toEqual(result2);
            });

            it('returns different results for different queries', async () => {
                const result1 = await searchSerp('seo tools', 'US', 'en', 10);
                const result2 = await searchSerp('ai tools', 'US', 'en', 10);

                expect(result1.data.results[0].url).not.toBe(result2.data.results[0].url);
            });

            it('returns results with sequential positions starting from 1', async () => {
                const result = await searchSerp('test', 'US', 'en', 20);

                result.data.results.forEach((r, i) => {
                    expect(r.position).toBe(i + 1);
                });
            });

            it('returns suggestions in mock mode', async () => {
                const result = await searchSerp('test query', 'US', 'en', 10);

                expect(result.data.suggestions).toBeDefined();
                expect(result.data.suggestions.length).toBeGreaterThan(0);
            });

            it('generates results with valid urls', async () => {
                const result = await searchSerp('test', 'US', 'en', 10);

                result.data.results.forEach((r) => {
                    expect(r.url).toMatch(/^https:\/\//);
                });
            });

            it('generates results with non-empty titles and content', async () => {
                const result = await searchSerp('test', 'US', 'en', 10);

                result.data.results.forEach((r) => {
                    expect(r.title.length).toBeGreaterThan(0);
                    expect(r.content.length).toBeGreaterThan(0);
                });
            });

            it('supports up to 100 results in a single call', async () => {
                const result = await searchSerp('test', 'US', 'en', 100);
                expect(result.data.results).toHaveLength(100);
            });
        });

        describe('searchSerpAll', () => {
            it('returns perPage results for perPage <= 100', async () => {
                const result = await searchSerpAll('test', 'US', 'en', 50);
                expect(result.data.results).toHaveLength(50);
            });

            it('returns correct number of results', async () => {
                const result = await searchSerpAll('test', 'US', 'en', 100);
                expect(result.data.results).toHaveLength(100);
                expect(result.success).toBe(true);
            });

            it('renumbers positions sequentially from 1', async () => {
                const result = await searchSerpAll('test', 'US', 'en', 30);

                result.data.results.forEach((r, i) => {
                    expect(r.position).toBe(i + 1);
                });
            });

            it('handles empty query', async () => {
                const result = await searchSerpAll('', 'US', 'en', 10);

                expect(result.success).toBe(true);
                expect(result.data.results).toBeDefined();
            });
        });
    });

    describe('real API mode (Serper)', () => {
        beforeEach(() => {
            mockedStorage.getSerpMockMode.mockResolvedValue(false);
        });

        it('calls Serper endpoint with POST and correct headers/body', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        searchParameters: { q: 'test', gl: 'us', hl: 'en', num: 10 },
                        organic: [
                            { title: 'Result', link: 'https://example.com', snippet: 'desc', position: 1 },
                        ],
                        relatedSearches: [{ query: 'related' }],
                        credits: 1,
                    }),
            });

            await searchSerp('test', 'US', 'en', 10);

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toBe('https://google.serper.dev/search');
            expect(options.method).toBe('POST');
            expect(options.headers['X-API-KEY']).toBe('test-api-key');
            expect(options.headers['Content-Type']).toBe('application/json');
            const body = JSON.parse(options.body);
            expect(body.q).toBe('test');
            expect(body.gl).toBe('us');
            expect(body.hl).toBe('en');
            expect(body.page).toBe(1);
        });

        it('normalizes Serper response to internal format', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        searchParameters: { q: 'test', gl: 'us', hl: 'en', num: 10 },
                        organic: [
                            { title: 'Title 1', link: 'https://example.com', snippet: 'Snippet 1', position: 1 },
                            { title: 'Title 2', link: 'https://example.org', snippet: 'Snippet 2', position: 2 },
                        ],
                        relatedSearches: [{ query: 'related 1' }, { query: 'related 2' }],
                        credits: 1,
                    }),
            });

            const result = await searchSerp('test', 'US', 'en', 10);

            expect(result.success).toBe(true);
            expect(result.data.query).toBe('test');
            expect(result.data.results[0].url).toBe('https://example.com');
            expect(result.data.results[0].content).toBe('Snippet 1');
            expect(result.data.suggestions).toEqual(['related 1', 'related 2']);
        });

        it('handles 401 errors with descriptive message', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ message: 'Invalid API key' }),
            });

            await expect(searchSerp('test', 'US', 'en', 10)).rejects.toThrow(/API key/i);
        });

        it('throws when no API key configured', async () => {
            mockedStorage.getSerperApiKey.mockResolvedValue('');

            await expect(searchSerp('test', 'US', 'en', 10)).rejects.toThrow(/No Serper API key/i);
        });

        it('handles network errors', async () => {
            mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

            await expect(searchSerp('test', 'US', 'en', 10)).rejects.toThrow();
        });
    });
});
