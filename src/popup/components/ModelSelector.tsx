import { useState } from 'react';
import { GEMINI_MODELS, OPENROUTER_MODELS, ALL_MODELS, type AIModel } from '../../models';
import { storage } from '../../storage';

interface ModelSelectorProps {
    value: string;
    onChange: (modelId: string) => void;
    compact?: boolean;
}

const ModelSelector = ({ value, onChange, compact }: ModelSelectorProps) => {
    const [customModel, setCustomModel] = useState('');
    const [popoverOpen, setPopoverOpen] = useState(false);

    const handleSelect = (modelId: string) => {
        storage.setSelectedModel(modelId);
        onChange(modelId);
    };

    const shortLabel = (model: AIModel | undefined, rawId: string) => {
        if (!model) return rawId;
        if (model.provider === 'gemini') return model.label.replace(/^Gemini\s+/, '');
        return model.label;
    };

    /* ── Compact mode (inline styles only — Shadow DOM has no Tailwind) ── */
    if (compact) {
        const currentModel = ALL_MODELS.find((m) => m.id === value);
        const displayName = shortLabel(currentModel, value);

        const handleCompactSelect = (modelId: string) => {
            handleSelect(modelId);
            setPopoverOpen(false);
        };

        const handleCompactCustom = () => {
            const trimmed = customModel.trim();
            if (!trimmed) return;
            handleSelect(trimmed);
            setCustomModel('');
            setPopoverOpen(false);
        };

        return (
            <div style={{ position: 'relative', display: 'inline-block' }}>
                {/* Trigger text */}
                <span
                    onClick={() => setPopoverOpen((o) => !o)}
                    style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        userSelect: 'none',
                    }}
                >
                    {displayName} ▾
                </span>

                {/* Popover */}
                {popoverOpen && (
                    <>
                        {/* Click-outside overlay scoped to component */}
                        <div
                            onClick={() => setPopoverOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'transparent',
                                zIndex: 999,
                            }}
                        />

                        <div
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                marginTop: 6,
                                width: 280,
                                maxHeight: 280,
                                overflowY: 'auto',
                                background: 'rgba(255,255,255,0.85)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.5)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
                                zIndex: 1000,
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                padding: 6,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {[
                                { label: 'Gemini', models: GEMINI_MODELS },
                                { label: 'OpenRouter — Perplexity', models: OPENROUTER_MODELS },
                            ].map((group) => (
                                <div key={group.label}>
                                    <div style={{
                                        fontSize: 9,
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        color: '#9ca3af',
                                        padding: '6px 10px 2px',
                                    }}>
                                        {group.label}
                                    </div>
                                    {group.models.map((model) => (
                                        <div
                                            key={model.id}
                                            onClick={() => handleCompactSelect(model.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '8px 10px',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                                background: value === model.id
                                                    ? 'rgba(16,185,129,0.1)'
                                                    : 'transparent',
                                            }}
                                        >
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>
                                                {model.label}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: 9,
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    padding: '2px 6px',
                                                    borderRadius: 99,
                                                    background: model.status === 'stable' ? '#d1fae5' : '#fef3c7',
                                                    color: model.status === 'stable' ? '#047857' : '#b45309',
                                                }}
                                            >
                                                {model.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {/* Divider */}
                            <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '4px 0' }} />

                            {/* Custom model input */}
                            <div style={{ display: 'flex', gap: 6, padding: '4px 4px 2px' }}>
                                <input
                                    type="text"
                                    value={customModel}
                                    onChange={(e) => setCustomModel(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleCompactCustom(); }}
                                    placeholder="Custom model ID"
                                    style={{
                                        flex: 1,
                                        padding: '6px 8px',
                                        borderRadius: 8,
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        background: 'rgba(255,255,255,0.6)',
                                        fontSize: 11,
                                        fontFamily: 'monospace',
                                        outline: 'none',
                                        color: '#1f2937',
                                    }}
                                />
                                <button
                                    onClick={handleCompactCustom}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #059669, #10b981)',
                                        color: 'white',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Use
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    /* ── Full mode (Tailwind classes — popup context) ── */

    const handleUseCustom = () => {
        const trimmed = customModel.trim();
        if (!trimmed) return;
        handleSelect(trimmed);
        setCustomModel('');
    };

    return (
        <div className="glass-card p-5 flex flex-col gap-4">
            <div>
                <p className="text-[13px] font-semibold text-heading mb-1">AI Model</p>
                <p className="text-[11px] text-muted leading-relaxed">
                    选择用于文本解释的模型
                </p>
            </div>

            {/* Model list */}
            <div className="flex flex-col gap-3" role="radiogroup" aria-label="AI Model">
                {[
                    { label: 'Gemini', models: GEMINI_MODELS },
                    { label: 'OpenRouter — Perplexity', models: OPENROUTER_MODELS },
                ].map((group) => (
                    <div key={group.label} className="flex flex-col gap-1.5">
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">
                            {group.label}
                        </p>
                        {group.models.map((model) => (
                            <div
                                key={model.id}
                                onClick={() => handleSelect(model.id)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                                    value === model.id
                                        ? 'bg-accent/10 border border-accent/30'
                                        : 'bg-white/30 border border-white/40 hover:bg-white/50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="ai-model"
                                    checked={value === model.id}
                                    onChange={() => handleSelect(model.id)}
                                    aria-label={model.label}
                                    className="accent-emerald-600 w-3.5 h-3.5 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[12px] font-semibold text-heading truncate">
                                            {model.label}
                                        </span>
                                        <span
                                            className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                                model.status === 'stable'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-amber-100 text-amber-700'
                                            }`}
                                        >
                                            {model.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted mt-0.5 truncate">
                                        {model.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Custom model input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleUseCustom(); }}
                    placeholder="Custom model ID"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/50 text-[12px] font-mono text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 focus:bg-white/70 transition-all"
                />
                <button
                    onClick={handleUseCustom}
                    className="px-4 py-2.5 rounded-xl accent-gradient text-white text-[12px] font-semibold shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.4)] transition-all"
                >
                    Use
                </button>
            </div>
        </div>
    );
};

export default ModelSelector;
