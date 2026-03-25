/**
 * Deterministic string hash for generating consistent mock data.
 */
export function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash);
}

/**
 * Seeded pseudo-random number generator.
 * Returns a function that produces deterministic values in [0, 1) for the same seed.
 */
export function seededRandom(seed: number): () => number {
    let s = seed || 1;
    return function () {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

/**
 * Extract hostname from a URL string.
 */
export function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

/**
 * Check if a URL points to a site's home page (root path).
 */
export function isHomePage(url: string): boolean {
    try {
        const pathname = new URL(url).pathname;
        return pathname === '/' || pathname === '';
    } catch {
        return false;
    }
}

/**
 * Check if a domain name contains the search keyword.
 */
export function domainContainsKeyword(domain: string, keyword: string): boolean {
    const normalizedDomain = domain.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, '');
    return normalizedDomain.includes(normalizedKeyword);
}

/**
 * Generate a seeded random integer in [min, max] range.
 */
export function randomInt(rng: () => number, min: number, max: number): number {
    return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Generate a seeded random float in [min, max] range with specified decimals.
 */
export function randomFloat(rng: () => number, min: number, max: number, decimals: number = 2): number {
    const value = rng() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
}

/**
 * Pick a random element from an array using seeded RNG.
 */
export function randomPick<T>(rng: () => number, arr: T[]): T {
    return arr[Math.floor(rng() * arr.length)];
}

/**
 * Generate random percentages that sum to approximately 100.
 */
export function randomPercentages(rng: () => number, count: number): number[] {
    const raw = Array.from({ length: count }, () => rng());
    const total = raw.reduce((a, b) => a + b, 0);
    const percentages = raw.map(v => parseFloat(((v / total) * 100).toFixed(2)));
    // Adjust last element to ensure exact sum of 100
    const sum = percentages.slice(0, -1).reduce((a, b) => a + b, 0);
    percentages[percentages.length - 1] = parseFloat((100 - sum).toFixed(2));
    return percentages;
}
