/**
 * Shared formatting utilities used across popup (WebsiteTracker) and SERP pages.
 */

export function formatVisits(n: number): string {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

export function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
}

export function formatDurationMinSec(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatRank(n: number): string {
    if (n <= 0) return '—';
    if (n >= 1_000_000) return `#${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `#${(n / 1_000).toFixed(0)}K`;
    return `#${n}`;
}

export function formatNumber(n: number): string {
    return n.toLocaleString('en-US');
}

export function parseDomain(raw: string): string {
    const trimmed = raw.trim();
    try {
        const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
        return url.hostname.replace(/^www\./, '');
    } catch {
        return trimmed.replace(/^www\./, '').split('/')[0];
    }
}
