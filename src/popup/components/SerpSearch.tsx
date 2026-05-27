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
        <div className="flex flex-col h-full text-primary">
            <header className="flex-shrink-0 px-6 pt-6 pb-5 flex flex-col gap-5 relative z-20 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="h-9 px-3 rounded-none bg-white/[0.06] border border-[rgba(255,255,255,0.08)] hover:bg-white/[0.10] transition-all text-muted hover:text-heading"
                        aria-label="Back"
                    >
                        <span className="text-[12px] font-semibold">&larr; Back</span>
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 accent-gradient rounded-none shadow-[0_12px_26px_rgba(136,224,156,0.22)] ring-1 ring-white/50 flex items-center justify-center">
                        <Search size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-[20px] font-semibold tracking-tight text-heading leading-none">SERP Search</h2>
                        <p className="text-[11px] text-muted mt-1.5 font-medium">Analyze search rankings</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-6 pb-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-[0.22em]">Keyword</label>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        placeholder="e.g. best project management tools"
                        className="w-full h-12 px-4 rounded-none bg-white/[0.06] border border-[rgba(255,255,255,0.08)] text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-[rgba(136,224,156,0.45)] focus:ring-4 focus:ring-[rgba(136,224,156,0.12)] transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-semibold text-muted uppercase tracking-[0.22em]">Country</label>
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full h-12 px-3 rounded-none bg-white/[0.06] border border-[rgba(255,255,255,0.08)] text-[12px] text-primary focus:outline-none focus:border-[rgba(136,224,156,0.45)] transition-all appearance-none cursor-pointer"
                        >
                            {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-semibold text-muted uppercase tracking-[0.22em]">Language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full h-12 px-3 rounded-none bg-white/[0.06] border border-[rgba(255,255,255,0.08)] text-[12px] text-primary focus:outline-none focus:border-[rgba(136,224,156,0.45)] transition-all appearance-none cursor-pointer"
                        >
                            {LANGUAGES.map((l) => (
                                <option key={l.code} value={l.code}>
                                    {l.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-semibold text-muted uppercase tracking-[0.22em]">Results per page</label>
                    <select
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                        className="w-full h-12 px-4 rounded-none bg-white/[0.06] border border-[rgba(255,255,255,0.08)] text-[13px] text-primary focus:outline-none focus:border-[rgba(136,224,156,0.45)] transition-all appearance-none cursor-pointer"
                    >
                        {PER_PAGE_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                                {n} results
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSearch}
                    disabled={!keyword.trim()}
                    className="w-full h-12 rounded-none accent-gradient text-white text-[13px] font-semibold shadow-[0_10px_24px_rgba(136,224,156,0.24)] hover:translate-y-[-1px] active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Search size={15} />
                    Search
                </button>

                <p className="text-[10px] text-muted text-center mt-1">
                    Powered by Serper API
                </p>
            </main>
        </div>
    );
};

export default SerpSearch;
