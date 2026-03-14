import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Plus, Trash2, ChevronDown, ChevronUp, Minus } from 'lucide-react';
import { storage } from '../../storage';
import type { TrackedSite, TrafficCache, MonthlyVisit } from '../../types';

interface WebsiteTrackerProps {
    onBack: () => void;
}

const CACHE_TTL = 86400000; // 24 hours

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

function getStartDate(): string {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentMonth(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Inline SVG sparkline — no external lib
const Sparkline = ({ data, positive }: { data: MonthlyVisit[]; positive: boolean }) => {
    if (data.length < 2) return null;
    const values = data.map((d) => d.visits);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const W = 72;
    const H = 28;
    const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * W;
        const y = H - ((v - min) / range) * H;
        return `${x},${y}`;
    });
    const color = positive ? '#10B981' : '#f43f5e';
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
            <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

// Full 6-month line chart with labeled X axis
const LineChart = ({ data }: { data: MonthlyVisit[] }) => {
    if (data.length === 0) return null;
    const values = data.map((d) => d.visits);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const W = 300;
    const H = 70;
    const PAD_B = 18;
    const plotH = H - PAD_B;
    const pts = values.map((v, i) => {
        const x = data.length > 1 ? (i / (data.length - 1)) * W : W / 2;
        const y = plotH - ((v - min) / range) * plotH;
        return `${x},${y}`;
    });
    return (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
            <polyline points={pts.join(' ')} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {data.map((d, i) => {
                const x = data.length > 1 ? (i / (data.length - 1)) * W : W / 2;
                const y = plotH - ((values[i] - min) / range) * plotH;
                return (
                    <g key={d.date}>
                        <circle cx={x} cy={y} r="3" fill="#10B981" />
                        <text x={x} y={H} textAnchor="middle" fontSize="8" fill="#6b7280">{d.date.slice(5)}</text>
                    </g>
                );
            })}
        </svg>
    );
};

const SiteCard = ({
    site,
    cache,
    expanded,
    loading,
    onToggle,
    onRemove,
}: {
    site: TrackedSite;
    cache: TrafficCache | undefined;
    expanded: boolean;
    loading: boolean;
    onToggle: () => void;
    onRemove: () => void;
}) => {
    const data = cache?.data ?? [];
    const thisMonth = data[data.length - 1]?.visits ?? 0;
    const lastMonth = data[data.length - 2]?.visits ?? 0;
    const delta = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
    const positive = delta >= 0;

    return (
        <div className="glass-card overflow-hidden animate-fade-in">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/30 transition-all text-left"
            >
                <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[13px] font-semibold text-heading truncate">{site.domain}</span>
                    {loading ? (
                        <span className="text-[11px] text-muted">Loading…</span>
                    ) : data.length > 0 ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium text-primary">{formatVisits(thisMonth)} visits</span>
                            <div className={`flex items-center gap-0.5 text-[11px] font-medium ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {positive ? <TrendingUp size={11} /> : delta === 0 ? <Minus size={11} /> : <TrendingDown size={11} />}
                                {delta !== 0 && <span>{positive ? '+' : ''}{delta.toFixed(1)}%</span>}
                                {delta === 0 && <span>–</span>}
                            </div>
                            <span className="text-[10px] text-muted">vs last mo</span>
                        </div>
                    ) : (
                        <span className="text-[11px] text-muted">No data</span>
                    )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    {data.length > 1 && <Sparkline data={data} positive={positive} />}
                    {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                </div>
            </button>

            {expanded && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/30 pt-3 animate-fade-in">
                    {data.length > 1 ? (
                        <LineChart data={data} />
                    ) : (
                        <p className="text-[11px] text-muted text-center py-2">No trend data available</p>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="self-end flex items-center gap-1.5 text-[11px] text-rose-500 hover:text-rose-600 transition-colors"
                    >
                        <Trash2 size={12} />
                        Remove
                    </button>
                </div>
            )}
        </div>
    );
};

const WebsiteTracker = ({ onBack }: WebsiteTrackerProps) => {
    const [sites, setSites] = useState<TrackedSite[]>([]);
    const [cache, setCache] = useState<TrafficCache[]>([]);
    const [input, setInput] = useState('');
    const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [apiKey, setApiKey] = useState('');

    const fetchTraffic = useCallback(async (domain: string, key: string, currentCache: TrafficCache[]): Promise<TrafficCache[]> => {
        const existing = currentCache.find((c) => c.domain === domain);
        if (existing && Date.now() - existing.fetchedAt < CACHE_TTL) return currentCache;

        try {
            const start = getStartDate();
            const end = getCurrentMonth();
            const url = `https://api.similarweb.com/v1/website/${domain}/total-traffic-and-engagement/visits?api_key=${key}&start_date=${start}&end_date=${end}&country=world&granularity=monthly&main_domain_only=false`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json() as { visits?: MonthlyVisit[] };
            const visits: MonthlyVisit[] = (json.visits ?? []).map((v: MonthlyVisit) => ({
                date: v.date,
                visits: v.visits,
            }));
            const updated = currentCache.filter((c) => c.domain !== domain);
            updated.push({ domain, data: visits, fetchedAt: Date.now() });
            return updated;
        } catch {
            return currentCache;
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [loadedSites, loadedCache, key] = await Promise.all([
                storage.getTrackedSites(),
                storage.getTrafficCache(),
                storage.getSimilarwebApiKey(),
            ]);
            if (cancelled) return;
            setSites(loadedSites);
            setCache(loadedCache);
            setApiKey(key);

            if (!key) return;

            let workingCache = [...loadedCache];
            for (const site of loadedSites) {
                const stale = !workingCache.find((c) => c.domain === site.domain && Date.now() - c.fetchedAt < CACHE_TTL);
                if (stale) {
                    setLoading((prev) => ({ ...prev, [site.domain]: true }));
                    workingCache = await fetchTraffic(site.domain, key, workingCache);
                    if (!cancelled) {
                        setCache([...workingCache]);
                        await storage.setTrafficCache(workingCache);
                    }
                    setLoading((prev) => ({ ...prev, [site.domain]: false }));
                }
            }
        })();
        return () => { cancelled = true; };
    }, [fetchTraffic]);

    const addSite = async (domain: string) => {
        if (!domain) return;
        const clean = parseDomain(domain);
        if (!clean) return;
        await storage.addTrackedSite(clean);
        const updated = await storage.getTrackedSites();
        setSites(updated);
        setInput('');

        if (apiKey) {
            setLoading((prev) => ({ ...prev, [clean]: true }));
            const updatedCache = await fetchTraffic(clean, apiKey, cache);
            setCache(updatedCache);
            await storage.setTrafficCache(updatedCache);
            setLoading((prev) => ({ ...prev, [clean]: false }));
        }
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
        const updatedSites = await storage.getTrackedSites();
        setSites(updatedSites);
        const updatedCache = cache.filter((c) => c.domain !== domain);
        setCache(updatedCache);
        await storage.setTrafficCache(updatedCache);
        if (expandedDomain === domain) setExpandedDomain(null);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
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
                        <p className="text-[11px] text-muted mt-1.5">Monthly traffic trends</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-7 pb-6 flex flex-col gap-4 overflow-y-auto">
                {/* No API key banner */}
                {!apiKey && (
                    <div className="glass-card p-4 flex flex-col gap-2 border border-amber-200/60 bg-amber-50/30 animate-fade-in">
                        <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
                            Add your SimilarWeb API key in Settings to see traffic data.
                        </p>
                        <button
                            onClick={onBack}
                            className="self-start text-[11px] text-accent font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
                        >
                            Go to Settings →
                        </button>
                    </div>
                )}

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

                {/* Site cards */}
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
                                cache={cache.find((c) => c.domain === site.domain)}
                                expanded={expandedDomain === site.domain}
                                loading={!!loading[site.domain]}
                                onToggle={() => setExpandedDomain(expandedDomain === site.domain ? null : site.domain)}
                                onRemove={() => removeSite(site.domain)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default WebsiteTracker;
