import { useMemo, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { openGoogleSearchTabs, parseGoogleKeywords } from '../utils/googleBatchSearch';

const pad = (value: number) => String(value).padStart(3, '0');

const BatchGoogleSearch = () => {
    const [keywords, setKeywords] = useState('');
    const [message, setMessage] = useState('');
    const keywordCount = useMemo(() => parseGoogleKeywords(keywords).length, [keywords]);

    const handleOpenTabs = async () => {
        if (keywordCount === 0) return;

        try {
            const opened = await openGoogleSearchTabs(keywords);
            setMessage(`Opened ${opened} Google tab${opened === 1 ? '' : 's'}`);
        } catch {
            setMessage('Could not open tabs');
        }
    };

    return (
        <section className="px-[18px] pb-4 animate-fade-in">
            <div className="terminal-label mb-1.5">GOOGLE BUFFER · newline or comma list</div>
            <div className="terminal-panel overflow-hidden text-[var(--ink)]">
                <div className="px-3 py-2.5 flex items-center justify-between gap-4 border-b border-[var(--ink-faint)]">
                    <h2 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-heading leading-tight">Open search tabs</h2>
                    <Search size={15} className="text-[var(--phosphor)] shrink-0" />
                </div>

                <div className="p-3 space-y-3">
                    <textarea
                        value={keywords}
                        onChange={(event) => {
                            setKeywords(event.target.value);
                            setMessage('');
                        }}
                        rows={3}
                        placeholder={'ai tools\nbest crm\nseo software'}
                        className="terminal-input px-3 py-2.5"
                    />

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] text-muted tracking-[0.06em]">
                            READY · {pad(keywordCount)} keyword{keywordCount === 1 ? '' : 's'} in buffer
                        </span>
                        <button
                            type="button"
                            onClick={handleOpenTabs}
                            disabled={keywordCount === 0}
                            className="terminal-button primary"
                        >
                            ▶ OPEN
                            <ArrowUpRight size={12} />
                        </button>
                    </div>

                    {message && (
                        <p role="status" className="text-[10px] text-[var(--phosphor)] tracking-[0.06em]">
                            ◉ {message}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default BatchGoogleSearch;
