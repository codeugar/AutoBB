import { useState } from 'react';
import { GEMINI_MODELS } from '../../models';
import { storage } from '../../storage';

interface ModelSelectorProps {
    value: string;
    onChange: (modelId: string) => void;
    compact?: boolean;
}

const ModelSelector = ({ value, onChange, compact }: ModelSelectorProps) => {
    const [customModel, setCustomModel] = useState('');

    if (compact) {
        return null;
    }

    const handleSelect = (modelId: string) => {
        storage.setGeminiModel(modelId);
        onChange(modelId);
    };

    const handleUseCustom = () => {
        const trimmed = customModel.trim();
        if (!trimmed) return;
        storage.setGeminiModel(trimmed);
        onChange(trimmed);
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
            <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="AI Model">
                {GEMINI_MODELS.map((model) => (
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
                            name="gemini-model"
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

            {/* Custom model input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
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
