import { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, CheckCircle, KeyRound, RotateCcw } from 'lucide-react';
import { storage, DEFAULT_GEMINI_PROMPT } from '../../storage';

const MiniToggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
        onClick={onToggle}
        className={`
            relative w-11 h-6 rounded-full transition-all duration-500 flex-shrink-0 border border-white/40
            ${enabled ? 'accent-gradient shadow-[0_0_18px_rgba(16,185,129,0.35)]' : 'bg-white/40'}
        `}
    >
        <div className={`
            absolute top-1 w-4 h-4 rounded-full bg-white shadow-[0_2px_8px_rgba(6,78,59,0.25)]
            transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
            ${enabled ? 'translate-x-[20px]' : 'translate-x-1'}
        `} />
    </button>
);

interface ApiKeySettingsProps {
    onBack: () => void;
}

const ApiKeySettings = ({ onBack }: ApiKeySettingsProps) => {
    const [apiKey, setApiKey] = useState('');
    const [revealed, setRevealed] = useState(false);
    const [keySaved, setKeySaved] = useState(false);

    const [prompt, setPrompt] = useState('');
    const [promptSaved, setPromptSaved] = useState(false);

    const [serperKey, setSerperKey] = useState('');
    const [serperRevealed, setSerperRevealed] = useState(false);
    const [serperKeySaved, setSerperKeySaved] = useState(false);
    const [mockMode, setMockMode] = useState(true);

    useEffect(() => {
        Promise.all([
            storage.getGeminiApiKey(),
            storage.getGeminiPrompt(),
            storage.getSerperApiKey(),
            storage.getSerpMockMode(),
        ]).then(([key, p, sKey, mock]) => {
            if (key) setApiKey(key);
            setPrompt(p);
            if (sKey) setSerperKey(sKey);
            setMockMode(mock);
        });
    }, []);

    const handleSaveKey = async () => {
        await storage.setGeminiApiKey(apiKey.trim());
        setKeySaved(true);
        setTimeout(() => setKeySaved(false), 3000);
    };

    const handleSavePrompt = async () => {
        await storage.setGeminiPrompt(prompt);
        setPromptSaved(true);
        setTimeout(() => setPromptSaved(false), 3000);
    };

    const handleResetPrompt = () => {
        setPrompt(DEFAULT_GEMINI_PROMPT);
    };

    const handleSaveSerperKey = async () => {
        await storage.setSerperApiKey(serperKey.trim());
        setSerperKeySaved(true);
        setTimeout(() => setSerperKeySaved(false), 3000);
    };

    const handleToggleMock = async () => {
        const next = !mockMode;
        setMockMode(next);
        await storage.setSerpMockMode(next);
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
                        <KeyRound size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-heading leading-none">Settings</h2>
                        <p className="text-[11px] text-muted mt-1.5">Configure AI features</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-7 pb-6 flex flex-col gap-5 overflow-y-auto">
                {/* API Key */}
                <div className="glass-card p-5 flex flex-col gap-4">
                    <div>
                        <p className="text-[13px] font-semibold text-heading mb-1">Gemini API Key</p>
                        <p className="text-[11px] text-muted leading-relaxed">
                            Powers the AI text explainer. Select any text on a webpage and click the{' '}
                            <span className="text-accent font-semibold">✦</span> icon to get an instant explanation.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type={revealed ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIza..."
                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white/50 border border-white/50 text-[12px] font-mono text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 focus:bg-white/70 transition-all"
                            />
                            <button
                                onClick={() => setRevealed((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                                tabIndex={-1}
                                aria-label={revealed ? 'Hide key' : 'Show key'}
                            >
                                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        <button
                            onClick={handleSaveKey}
                            disabled={!apiKey.trim()}
                            className="px-4 py-2.5 rounded-xl accent-gradient text-white text-[12px] font-semibold shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                            {keySaved ? <CheckCircle size={13} /> : <Save size={13} />}
                            {keySaved ? 'Saved' : 'Save'}
                        </button>
                    </div>

                    {keySaved && (
                        <div className="flex items-center gap-2 text-accent text-[12px] font-medium animate-fade-in">
                            <CheckCircle size={13} />
                            API key saved successfully
                        </div>
                    )}
                </div>

                {/* Prompt */}
                <div className="glass-card p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-[13px] font-semibold text-heading mb-1">AI Prompt</p>
                            <p className="text-[11px] text-muted leading-relaxed">
                                自定义 AI 解释时使用的提示词。用 <code className="text-accent bg-white/40 px-1 rounded">{"\"}"}</code> 结尾，词语会自动附加在后面。
                            </p>
                        </div>
                        <button
                            onClick={handleResetPrompt}
                            title="Reset to default"
                            className="flex-shrink-0 flex items-center gap-1.5 text-[11px] text-muted hover:text-accent transition-colors mt-0.5"
                        >
                            <RotateCcw size={12} />
                            Reset
                        </button>
                    </div>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={7}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/50 text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 focus:bg-white/70 transition-all resize-none leading-relaxed"
                    />

                    <div className="flex items-center justify-between">
                        {promptSaved ? (
                            <div className="flex items-center gap-2 text-accent text-[12px] font-medium animate-fade-in">
                                <CheckCircle size={13} />
                                Prompt saved
                            </div>
                        ) : <div />}
                        <button
                            onClick={handleSavePrompt}
                            disabled={!prompt.trim()}
                            className="px-4 py-2.5 rounded-xl accent-gradient text-white text-[12px] font-semibold shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                            {promptSaved ? <CheckCircle size={13} /> : <Save size={13} />}
                            {promptSaved ? 'Saved' : 'Save Prompt'}
                        </button>
                    </div>
                </div>

                {/* How to get key */}
                <div className="glass-card p-4 flex flex-col gap-2">
                    <p className="text-[11px] font-semibold text-heading uppercase tracking-widest">How to get an API key</p>
                    <ol className="text-[11px] text-muted leading-relaxed list-decimal list-inside space-y-1">
                        <li>Visit Google AI Studio (aistudio.google.com)</li>
                        <li>Sign in with your Google account</li>
                        <li>Click "Get API key" → "Create API key"</li>
                        <li>Copy and paste it above</li>
                    </ol>
                </div>

                {/* Serper API Key */}
                <div className="glass-card p-5 flex flex-col gap-4">
                    <div>
                        <p className="text-[13px] font-semibold text-heading mb-1">Serper API Key</p>
                        <p className="text-[11px] text-muted leading-relaxed">
                            Powers SERP analysis. Get a free key at{' '}
                            <span className="text-accent font-semibold">serper.dev</span>
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type={serperRevealed ? 'text' : 'password'}
                                value={serperKey}
                                onChange={(e) => setSerperKey(e.target.value)}
                                placeholder="Your Serper API key..."
                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white/50 border border-white/50 text-[12px] font-mono text-primary placeholder:text-muted focus:outline-none focus:border-accent/50 focus:bg-white/70 transition-all"
                            />
                            <button
                                onClick={() => setSerperRevealed((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                                tabIndex={-1}
                                aria-label={serperRevealed ? 'Hide key' : 'Show key'}
                            >
                                {serperRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        <button
                            onClick={handleSaveSerperKey}
                            disabled={!serperKey.trim()}
                            className="px-4 py-2.5 rounded-xl accent-gradient text-white text-[12px] font-semibold shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                            {serperKeySaved ? <CheckCircle size={13} /> : <Save size={13} />}
                            {serperKeySaved ? 'Saved' : 'Save'}
                        </button>
                    </div>

                    {serperKeySaved && (
                        <div className="flex items-center gap-2 text-accent text-[12px] font-medium animate-fade-in">
                            <CheckCircle size={13} />
                            API key saved successfully
                        </div>
                    )}

                    <p className="text-[10px] text-muted/60">
                        Free 2,500 queries/month — no credit card required
                    </p>
                </div>

                {/* SERP Mock Mode */}
                <div className="glass-card p-5 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                        <p className="text-[13px] font-semibold text-heading">SERP Mock Mode</p>
                        <p className="text-[11px] text-muted leading-relaxed">
                            Use simulated data for testing — no API key needed
                        </p>
                    </div>
                    <MiniToggle enabled={mockMode} onToggle={handleToggleMock} />
                </div>
            </main>
        </div>
    );
};

export default ApiKeySettings;
