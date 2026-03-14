import { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, CheckCircle, KeyRound } from 'lucide-react';
import { storage } from '../../storage';

interface ApiKeySettingsProps {
    onBack: () => void;
}

const ApiKeySection = ({
    title,
    description,
    placeholder,
    value,
    onChange,
    onSave,
    saved,
    guide,
}: {
    title: string;
    description: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    onSave: () => void;
    saved: boolean;
    guide: React.ReactNode;
}) => {
    const [revealed, setRevealed] = useState(false);
    return (
        <>
            <div className="glass-card p-5 flex flex-col gap-4">
                <div>
                    <p className="text-[13px] font-semibold text-heading mb-1">{title}</p>
                    <p className="text-[11px] text-muted leading-relaxed">{description}</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            type={revealed ? 'text' : 'password'}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
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
                        onClick={onSave}
                        disabled={!value.trim()}
                        className="px-4 py-2.5 rounded-xl accent-gradient text-white text-[12px] font-semibold shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        {saved ? <CheckCircle size={13} /> : <Save size={13} />}
                        {saved ? 'Saved' : 'Save'}
                    </button>
                </div>
                {saved && (
                    <div className="flex items-center gap-2 text-accent text-[12px] font-medium animate-fade-in">
                        <CheckCircle size={13} />
                        API key saved successfully
                    </div>
                )}
            </div>
            <div className="glass-card p-4 flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-heading uppercase tracking-widest">How to get an API key</p>
                {guide}
            </div>
        </>
    );
};

const ApiKeySettings = ({ onBack }: ApiKeySettingsProps) => {
    const [geminiKey, setGeminiKey] = useState('');
    const [geminiSaved, setGeminiSaved] = useState(false);
    const [similarwebKey, setSimilarwebKey] = useState('');
    const [similarwebSaved, setSimilarwebSaved] = useState(false);

    useEffect(() => {
        storage.getGeminiApiKey().then((key) => { if (key) setGeminiKey(key); });
        storage.getSimilarwebApiKey().then((key) => { if (key) setSimilarwebKey(key); });
    }, []);

    const handleSaveGemini = async () => {
        await storage.setGeminiApiKey(geminiKey.trim());
        setGeminiSaved(true);
        setTimeout(() => setGeminiSaved(false), 3000);
    };

    const handleSaveSimilarweb = async () => {
        await storage.setSimilarwebApiKey(similarwebKey.trim());
        setSimilarwebSaved(true);
        setTimeout(() => setSimilarwebSaved(false), 3000);
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
            <main className="flex-1 px-7 pb-6 flex flex-col gap-5">
                <ApiKeySection
                    title="Gemini API Key"
                    description={`Powers the AI text explainer. Select any text on a webpage and click the \u2736 icon to get an instant explanation.`}
                    placeholder="AIza..."
                    value={geminiKey}
                    onChange={setGeminiKey}
                    onSave={handleSaveGemini}
                    saved={geminiSaved}
                    guide={
                        <ol className="text-[11px] text-muted leading-relaxed list-decimal list-inside space-y-1">
                            <li>Visit Google AI Studio (aistudio.google.com)</li>
                            <li>Sign in with your Google account</li>
                            <li>Click "Get API key" → "Create API key"</li>
                            <li>Copy and paste it above</li>
                        </ol>
                    }
                />

                <ApiKeySection
                    title="SimilarWeb API Key"
                    description="Powers Website Tracker traffic data. Shows monthly visit trends for sites you track."
                    placeholder="Enter your SimilarWeb API key..."
                    value={similarwebKey}
                    onChange={setSimilarwebKey}
                    onSave={handleSaveSimilarweb}
                    saved={similarwebSaved}
                    guide={
                        <ol className="text-[11px] text-muted leading-relaxed list-decimal list-inside space-y-1">
                            <li>Visit developers.similarweb.com</li>
                            <li>Sign up for a free account</li>
                            <li>Navigate to API Keys in your dashboard</li>
                            <li>Copy and paste your key above</li>
                        </ol>
                    }
                />
            </main>
        </div>
    );
};

export default ApiKeySettings;
