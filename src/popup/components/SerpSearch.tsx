import { useState } from 'react';
import { Search } from 'lucide-react';
import { COUNTRIES, LANGUAGES, PER_PAGE_OPTIONS, DEFAULT_COUNTRY, DEFAULT_LANGUAGE, DEFAULT_PER_PAGE } from '../../serp/utils/constants';

interface SerpSearchProps {
    onBack: () => void;
}

const SerpSearch = ({ onBack }: SerpSearchProps) => {
    const [keyword, setKeyword] = useState('');
    const [country, setCountry] = useState(DEFAULT_COUNTRY);
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
    const [perPage, setPerPage] = useState<number>(DEFAULT_PER_PAGE);

    const handleSearch = () => {
        if (!keyword.trim()) return;
        const params = new URLSearchParams({
            q: keyword.trim(),
            country,
            language,
            perPage: String(perPage),
        });
        chrome.tabs.create({
            url: chrome.runtime.getURL(`src/serp/results/index.html?${params.toString()}`),
        });
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
                        <span className="text-sm font-medium">&larr; Back</span>
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-3 accent-gradient rounded-[18px] shadow-[0_8px_20px_rgba(16,185,129,0.25)] ring-1 ring-white/40">
                        <Search size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-heading leading-none">SERP Search</h2>
                        <p className="text-[11px] text-muted mt-1.5">Analyze search rankings</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-7 pb-6 flex flex-col gap-4 overflow-y-auto">
                {/* Keyword input */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-heading uppercase tracking-widest">Keyword</label>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        placeholder="e.g. best project management tools"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/50 text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 focus:bg-white/70 transition-all"
                    />
                </div>

                {/* Country + Language row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-heading uppercase tracking-widest">Country</label>
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/50 text-[12px] text-primary focus:outline-none focus:border-accent/50 focus:bg-white/70 transition-all appearance-none cursor-pointer"
                        >
                            {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-heading uppercase tracking-widest">Language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/50 text-[12px] text-primary focus:outline-none focus:border-accent/50 focus:bg-white/70 transition-all appearance-none cursor-pointer"
                        >
                            {LANGUAGES.map((l) => (
                                <option key={l.code} value={l.code}>
                                    {l.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Per page */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-heading uppercase tracking-widest">Results per page</label>
                    <select
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/50 text-[12px] text-primary focus:outline-none focus:border-accent/50 focus:bg-white/70 transition-all appearance-none cursor-pointer"
                    >
                        {PER_PAGE_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                                {n} results
                            </option>
                        ))}
                    </select>
                </div>

                {/* Search button */}
                <button
                    onClick={handleSearch}
                    disabled={!keyword.trim()}
                    className="w-full py-3 rounded-xl accent-gradient text-white text-[13px] font-semibold shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Search size={15} />
                    Search
                </button>

                {/* Footer text */}
                <p className="text-[10px] text-muted/60 text-center mt-1">
                    Powered by Serper API
                </p>
            </main>
        </div>
    );
};

export default SerpSearch;
