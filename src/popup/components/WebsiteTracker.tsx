import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Plus, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { storage } from '../../storage';
import type { TrackedSite, TrafficSnapshot } from '../../types';

interface WebsiteTrackerProps {
    onBack: () => void;
}

const CACHE_TTL = 86400000; // 24h

function parseDomain(raw: string): string {
    const trimmed = raw.trim();
    try {
        const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
        return url.hostname.replace(/^www\./, '');
    } catch {
        return trimmed.replace(/^www\./, '').split('/')[0];
    }
}

function formatVisits(n: number): string {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
}

function formatRank(n: number): string {
    if (n <= 0) return '—';
    if (n >= 1_000_000) return `#${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `#${(n / 1_000).toFixed(0)}K`;
    return `#${n}`;
}

// Fetch from SimilarWeb's free undocumented extension endpoint
async function fetchSnapshot(domain: string): Promise<TrafficSnapshot | null> {
    try {
        const res = await fetch(`https://data.similarweb.com/api/v1/data?domain=${domain}`);
        if (!res.ok) return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const json = await res.json() as Record<string, any>;

        const eng = json['Engagements'] ?? {};
        const globalRank: number = json['GlobalRank']?.['Rank'] ?? 0;

        return {
            domain,
            globalRank,
            visits: eng['Visits'] ?? 0,
            bounceRate: eng['BounceRate'] ?? eng['Bounce'] ?? 0,
            pagesPerVisit: eng['PagePerVisit'] ?? eng['PagesPerVisit'] ?? 0,
            avgDuration: eng['VisitDuration'] ?? eng['AvgVisitDuration'] ?? 0,
            fetchedAt: Date.now(),
        };
    } catch {
        return null;
    }
}

const StatPill = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2 glass-card">
        <span className="text-[11px] text-muted">{label}</span>
        <span className="text-[12px] font-semibold text-heading">{value}</span>
    </div>
);

const SiteCard = ({
    site,
    snap,
    expanded,
    loading,
    onToggle,
    onRemove,
    onRefresh,
}: {
    site: TrackedSite;
    snap: TrafficSnapshot | undefined;
    expanded: boolean;
    loading: boolean;
    onToggle: () => void;
    onRemove: () => void;
    onRefresh: () => void;
}) => (
    <div className="glass-card overflow-hidden animate-fade-in">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/30 transition-all text-left"
        >
            <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[13px] font-semibold text-heading truncate">{site.domain}</span>
                {loading ? (
                    <span className="text-[11px] text-muted">Fetching…</span>
                ) : snap ? (
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-primary">{formatVisits(snap.visits)}/mo</span>
                        <span className="text-[11px] text-muted">·</span>
                        <span className="text-[11px] text-muted">{formatRank(snap.globalRank)} global</span>
                    </div>
                ) : (
                    <span className="text-[11px] text-muted/70">No data — tap refresh</span>
                )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
            </div>
        </button>

        {expanded && (
            <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/30 pt-3 animate-fade-in">
                {snap ? (
                    <div className="grid grid-cols-3 gap-2">
                        <StatPill label="Visits/mo" value={formatVisits(snap.visits)} />
                        <StatPill label="Bounce" value={snap.bounceRate > 0 ? `${(snap.bounceRate * 100).toFixed(0)}%` : '—'} />
                        <StatPill label="Pages/visit" value={snap.pagesPerVisit > 0 ? snap.pagesPerVisit.toFixed(1) : '—'} />
                        <StatPill label="Avg duration" value={snap.avgDuration > 0 ? formatDuration(snap.avgDuration) : '—'} />
                        <StatPill label="Global rank" value={formatRank(snap.globalRank)} />
                        <StatPill label="Updated" value={new Date(snap.fetchedAt).toLocaleDateString()} />
                    </div>
                ) : (
                    <p className="text-[11px] text-muted text-center py-1">No traffic data available</p>
                )}
                <div className="flex items-center justify-between">
                    <button
                        onClick={(e) => { e.stopPropagation(); onRefresh(); }}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-[11px] text-accent hover:opacity-80 transition-opacity disabled:opacity-40"
                    >
                        <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="flex items-center gap-1.5 text-[11px] text-rose-500 hover:text-rose-600 transition-colors"
                    >
                        <Trash2 size={11} />
                        Remove
                    </button>
                </div>
            </div>
        )}
    </div>
);

const WebsiteTracker = ({ onBack }: WebsiteTrackerProps) => {
    const [sites, setSites] = useState<TrackedSite[]>([]);
    const [cache, setCache] = useState<TrafficSnapshot[]>([]);
    const [input, setInput] = useState('');
    const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const saveAndSetCache = useCallback(async (updated: TrafficSnapshot[]) => {
        setCache(updated);
        await storage.setTrafficCache(updated);
    }, []);

    const fetchAndCache = useCallback(async (domain: string, current: TrafficSnapshot[]) => {
        setLoading((p) => ({ ...p, [domain]: true }));
        const snap = await fetchSnapshot(domain);
        const next = current.filter((c) => c.domain !== domain);
        if (snap) next.push(snap);
        await saveAndSetCache(next);
        setLoading((p) => ({ ...p, [domain]: false }));
        return next;
    }, [saveAndSetCache]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [loadedSites, loadedCache] = await Promise.all([
                storage.getTrackedSites(),
                storage.getTrafficCache(),
            ]);
            if (cancelled) return;
            setSites(loadedSites);
            setCache(loadedCache);

            // Refresh stale entries in background
            let working = [...loadedCache];
            for (const site of loadedSites) {
                const entry = working.find((c) => c.domain === site.domain);
                if (!entry || Date.now() - entry.fetchedAt > CACHE_TTL) {
                    working = await fetchAndCache(site.domain, working);
                    if (cancelled) return;
                }
            }
        })();
        return () => { cancelled = true; };
    }, [fetchAndCache]);

    const addSite = async (domain: string) => {
        const clean = parseDomain(domain);
        if (!clean) return;
        await storage.addTrackedSite(clean);
        const updated = await storage.getTrackedSites();
        setSites(updated);
        setInput('');
        await fetchAndCache(clean, cache);
    };

    const addCurrentTab = async () => {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]?.url) {
                const hostname = new URL(tabs[0].url).hostname.replace(/^www\./, '');
                await addSite(hostname);
            }
        } catch { /* no permission */ }
    };

    const removeSite = async (domain: string) => {
        await storage.removeTrackedSite(domain);
        setSites(await storage.getTrackedSites());
        const next = cache.filter((c) => c.domain !== domain);
        await saveAndSetCache(next);
        if (expandedDomain === domain) setExpandedDomain(null);
    };

    return (
        <div className="flex flex-col h-full">
            <header className="flex-shrink-0 px-7 pt-10 pb-6 flex flex-col gap-5 relative z-20 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 glass-card hover:bg-white/55 transition-all rounded-xl text-muted hover:text-primary"
                        aria-label="Back"
                    >
                        <span className="text-sm font-medium">← Back</span>
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-3 accent-gradient rounded-[18px] shadow-[0_8px_20px_rgba(16,185,129,0.25)] ring-1 ring-white/40">
                        <TrendingUp size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-heading leading-none">Website Tracker</h2>
                        <p className="text-[11px] text-muted mt-1.5">Traffic snapshots · updated daily</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-7 pb-6 flex flex-col gap-4 overflow-y-auto">
                {/* Add bar */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') addSite(input); }}
                        placeholder="domain.com"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/50 text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 focus:bg-white/70 transition-all"
                    />
                    <button
                        onClick={addCurrentTab}
                        title="Add current tab"
                        className="px-3 py-2.5 rounded-xl glass-card hover:bg-white/55 text-[11px] font-semibold text-accent transition-all whitespace-nowrap"
                    >
                        + Tab
                    </button>
                    <button
                        onClick={() => addSite(input)}
                        disabled={!input.trim()}
                        className="px-3.5 py-2.5 rounded-xl accent-gradient text-white text-[12px] font-semibold shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        <Plus size={14} />
                        Add
                    </button>
                </div>

                {/* Site list */}
                {sites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-center animate-fade-in">
                        <TrendingUp size={28} className="text-muted/50" />
                        <p className="text-[12px] text-muted">No sites tracked yet.</p>
                        <p className="text-[11px] text-muted/70">Add a domain above or click "+ Tab".</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {sites.map((site) => (
                            <SiteCard
                                key={site.domain}
                                site={site}
                                snap={cache.find((c) => c.domain === site.domain)}
                                expanded={expandedDomain === site.domain}
                                loading={!!loading[site.domain]}
                                onToggle={() => setExpandedDomain(expandedDomain === site.domain ? null : site.domain)}
                                onRemove={() => removeSite(site.domain)}
                                onRefresh={() => fetchAndCache(site.domain, cache)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default WebsiteTracker;
