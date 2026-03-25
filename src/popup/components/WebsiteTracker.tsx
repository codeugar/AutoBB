import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Plus, Trash2, ChevronDown, ChevronUp, RefreshCw, Minus } from 'lucide-react';
import { storage } from '../../storage';
import { formatVisits, formatDuration, formatRank, parseDomain } from '../../shared/formatters';
import type { TrackedSite, TrafficSnapshot } from '../../types';

interface WebsiteTrackerProps {
    onBack: () => void;
}

const CACHE_TTL = 86400000; // 24h

// Fetch from SimilarWeb's free undocumented extension endpoint
async function fetchSnapshot(domain: string): Promise<TrafficSnapshot | null> {
    try {
        const res = await fetch(`https://data.similarweb.com/api/v1/data?domain=${domain}`);
        if (!res.ok) return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const json = await res.json() as Record<string, any>;

        // Note: API has a typo — "Engagments" (missing 'e'), all values are strings
        const eng = json['Engagments'] ?? {};
        const globalRank: number = json['GlobalRank']?.['Rank'] ?? 0;

        // EstimatedMonthlyVisits: { "2025-12-01": 6887149903, ... } — last 3 months
        const monthlyRaw = json['EstimatedMonthlyVisits'] as Record<string, number> | undefined;
        const monthlyTrend = monthlyRaw
            ? Object.entries(monthlyRaw)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, visits]) => ({ date: date.slice(0, 7), visits }))
            : [];

        return {
            domain,
            globalRank,
            visits: parseFloat(eng['Visits'] ?? '0') || 0,
            bounceRate: parseFloat(eng['BounceRate'] ?? '0') || 0,
            pagesPerVisit: parseFloat(eng['PagePerVisit'] ?? '0') || 0,
            avgDuration: parseFloat(eng['TimeOnSite'] ?? '0') || 0,
            monthlyTrend,
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

// 3-month sparkline from EstimatedMonthlyVisits
const Sparkline = ({ data }: { data: { date: string; visits: number }[] }) => {
    if (data.length < 2) return null;
    const values = data.map((d) => d.visits);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const W = 56;
    const H = 24;
    const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * W;
        const y = H - ((v - min) / range) * H;
        return `${x},${y}`;
    });
    const positive = values[values.length - 1] >= values[0];
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible flex-shrink-0">
            <polyline points={pts.join(' ')} fill="none" stroke={positive ? '#10B981' : '#f43f5e'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

// Smooth Catmull-Rom bezier line chart with hover tooltip
const LineChart = ({ data }: { data: { date: string; visits: number }[] }) => {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    if (data.length < 2) return null;

    const PAD_L = 38, PAD_R = 10, PAD_T = 16, PAD_B = 22;
    const W = 286, H = 118;
    const chartW = W - PAD_L - PAD_R;
    const chartH = H - PAD_T - PAD_B;

    const maxV = Math.max(...data.map(d => d.visits)) || 1;
    const toX = (i: number) => PAD_L + (i / (data.length - 1)) * chartW;
    const toY = (v: number) => PAD_T + chartH - (v / maxV) * chartH;
    const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.visits), date: d.date, visits: d.visits }));

    // Catmull-Rom → cubic bezier
    const n = pts.length;
    let linePath = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(n - 1, i + 2)];
        const cp1x = (p1.x + (p2.x - p0.x) / 6).toFixed(1);
        const cp1y = (p1.y + (p2.y - p0.y) / 6).toFixed(1);
        const cp2x = (p2.x - (p3.x - p1.x) / 6).toFixed(1);
        const cp2y = (p2.y - (p3.y - p1.y) / 6).toFixed(1);
        linePath += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    const areaPath = `${linePath} L ${pts[n-1].x},${PAD_T + chartH} L ${pts[0].x},${PAD_T + chartH} Z`;
    const gradId = `lg-${data[0]?.date ?? 'x'}`;

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const svgX = ((e.clientX - rect.left) / rect.width) * W;
        let nearest = 0, minDist = Infinity;
        pts.forEach((p, i) => { const d = Math.abs(p.x - svgX); if (d < minDist) { minDist = d; nearest = i; } });
        setHoveredIdx(nearest);
    };

    const hovered = hoveredIdx !== null ? pts[hoveredIdx] : null;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="overflow-visible" onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredIdx(null)}>
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.01" />
                </linearGradient>
            </defs>

            {/* Horizontal grid lines + Y labels */}
            {[0, 0.5, 1].map((p, i) => {
                const v = maxV * p;
                const y = toY(v);
                return (
                    <g key={i}>
                        <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="3,3" />
                        <text x={PAD_L - 5} y={y + 3.5} textAnchor="end" fontSize="9" fill="#9ca3af">{formatVisits(v)}</text>
                    </g>
                );
            })}

            {/* Area fill */}
            <path d={areaPath} fill={`url(#${gradId})`} />

            {/* Smooth line */}
            <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Dots */}
            {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={hoveredIdx === i ? 5 : 3.5} fill="#10B981" stroke="white" strokeWidth="1.5" style={{ transition: 'r 0.1s' }} />
            ))}

            {/* X labels */}
            {pts.map((p, i) => (
                <text key={i} x={p.x} y={H - 2} textAnchor="middle" fontSize="9" fill="#9ca3af">{p.date.replace('-', '/')}</text>
            ))}

            {/* Hover: vertical line + tooltip */}
            {hovered && (() => {
                const TW = 76, TH = 36;
                const tx = hovered.x > W / 2 ? hovered.x - TW - 6 : hovered.x + 8;
                const ty = Math.max(PAD_T, hovered.y - TH / 2);
                return (
                    <g>
                        <line x1={hovered.x} y1={PAD_T} x2={hovered.x} y2={PAD_T + chartH} stroke="#10B981" strokeWidth="1" strokeDasharray="3,2" opacity="0.45" />
                        <g transform={`translate(${tx},${ty})`}>
                            <rect width={TW} height={TH} rx="6" fill="white" stroke="#e5e7eb" strokeWidth="0.75" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }} />
                            <text x="8" y="14" fontSize="9" fill="#6b7280" fontWeight="500">{hovered.date.replace('-', '/')}</text>
                            <text x="8" y="27" fontSize="11" fill="#10B981" fontWeight="700">{formatVisits(hovered.visits)}</text>
                        </g>
                    </g>
                );
            })()}
        </svg>
    );
};


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
}) => {
    const trend = snap?.monthlyTrend ?? [];
    const last = trend[trend.length - 1]?.visits ?? 0;
    const prev = trend[trend.length - 2]?.visits ?? 0;
    const delta = prev > 0 ? ((last - prev) / prev) * 100 : 0;
    const positive = delta > 0;

    return (
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
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[12px] font-medium text-primary">{formatVisits(snap.visits)}/mo</span>
                            <span className="text-[11px] text-muted">·</span>
                            <span className="text-[11px] text-muted">{formatRank(snap.globalRank)} global</span>
                            {delta !== 0 && (
                                <div className={`flex items-center gap-0.5 text-[11px] font-medium ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                    <span>{positive ? '+' : ''}{delta.toFixed(1)}%</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-[11px] text-muted/70">No data — tap refresh</span>
                    )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    {snap && trend.length >= 2 && <Sparkline data={trend} />}
                    {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                </div>
            </button>

            {expanded && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/30 pt-3 animate-fade-in">
                    {snap ? (
                        <>
                            {trend.length >= 2 && <LineChart data={trend} />}
                            <div className="grid grid-cols-3 gap-2">
                                <StatPill label="Bounce" value={snap.bounceRate > 0 ? `${(snap.bounceRate * 100).toFixed(0)}%` : '—'} />
                                <StatPill label="Pages/visit" value={snap.pagesPerVisit > 0 ? snap.pagesPerVisit.toFixed(1) : '—'} />
                                <StatPill label="Avg duration" value={snap.avgDuration > 0 ? formatDuration(snap.avgDuration) : '—'} />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted/60">
                                <Minus size={10} />
                                <span>Updated {new Date(snap.fetchedAt).toLocaleDateString()}</span>
                            </div>
                        </>
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
};

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
