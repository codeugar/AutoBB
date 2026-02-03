import React, { useState } from 'react';
import type { Profile, Screenshot } from '../../types';
import { ArrowLeft, Trash2, X, ChevronDown, Layout, Type, ListTree } from 'lucide-react';
import { parseUserCases } from '../utils/userCases';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface Props {
    profile: Profile | null;
    onSave: (profile: Profile) => void;
    onCancel: () => void;
    onDelete: (id: string) => void;
}

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-4">
        <label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted block px-2">{label}</label>
        {children}
    </div>
);

const DesignerInput = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className="w-full h-16 glass-input rounded-[20px] px-6 text-[15px] font-black text-primary placeholder-[rgba(6,78,59,0.35)]
                 transition-all duration-300 outline-none hover:border-white/60 focus:border-[rgba(16,185,129,0.6)] focus:ring-8 focus:ring-[rgba(16,185,129,0.15)]"
    />
);

const DesignerTextArea = ({ rows = 4, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        rows={rows}
        {...props}
        className="w-full glass-input rounded-[24px] px-6 py-5 text-[15px] font-black text-primary placeholder-[rgba(6,78,59,0.35)]
                 transition-all duration-300 outline-none resize-none hover:border-white/60 focus:border-[rgba(16,185,129,0.6)] focus:ring-8 focus:ring-[rgba(16,185,129,0.15)]"
    />
);

const DesignerSelect = ({ options, ...props }: { options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative group">
        <select
            {...props}
            className="w-full h-16 glass-input rounded-[20px] px-6 text-[15px] font-black text-primary appearance-none cursor-pointer
                     transition-all duration-300 outline-none hover:border-white/60 focus:border-[rgba(16,185,129,0.6)] focus:ring-8 focus:ring-[rgba(16,185,129,0.15)]"
        >
            {options.map(opt => <option key={opt.value} value={opt.value} className="bg-white text-primary">{opt.label}</option>)}
        </select>
        <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none group-hover:text-muted-strong transition-colors" />
    </div>
);

const ProfileEditor: React.FC<Props> = ({ profile, onSave, onCancel, onDelete }) => {
    const MAX_LOGO_SIZE = 500 * 1024; // 500KB
    const MAX_SCREENSHOT_SIZE = 1024 * 1024; // 1MB
    const MAX_SCREENSHOTS = 5;
    const MAX_TOTAL_STORAGE = 4 * 1024 * 1024; // 4MB (leave headroom)
    const [formData, setFormData] = useState<Profile>(profile || {
        id: generateId(),
        name: '',
        domain: '',
        email: '',
        category: '',
        title: '',
        shortDescription: '',
        longDescription: '',
        features: [''],
        tags: [],
        pricing: '',
        customFields: {},
        userCases: []
    });
    const [logoPreview, setLogoPreview] = useState<string | undefined>(profile?.logoBase64);
    const [screenshots, setScreenshots] = useState<Screenshot[]>(profile?.screenshots || []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const [userCasesText, setUserCasesText] = useState<string>(
        (profile?.userCases ?? []).join('\n')
    );

    const handleUserCasesChange = (value: string) => {
        const lines = value.split('\n');
        const limitedText = lines.slice(0, 5).join('\n');
        setUserCasesText(limitedText);
        const parsed = parseUserCases(limitedText);
        setFormData(prev => ({ ...prev, userCases: parsed }));
    };

    const addFeature = () => setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    const removeFeature = (index: number) => setFormData(prev => ({ ...prev, features: formData.features.length > 1 ? formData.features.filter((_, i) => i !== index) : [''] }));

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_LOGO_SIZE) {
            alert(`Logo must be under ${Math.round(MAX_LOGO_SIZE / 1024)}KB`);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setLogoPreview(base64);
            setFormData(prev => ({ ...prev, logoBase64: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const calculateTotalSize = (): number => {
        let total = 0;
        if (formData.logoBase64) total += formData.logoBase64.length;
        screenshots.forEach(s => {
            if (s.base64) total += s.base64.length;
        });
        return total;
    };

    const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (screenshots.length + files.length > MAX_SCREENSHOTS) {
            alert(`Maximum ${MAX_SCREENSHOTS} screenshots allowed`);
            return;
        }

        files.forEach(file => {
            if (file.size > MAX_SCREENSHOT_SIZE) {
                alert(`${file.name} exceeds ${MAX_SCREENSHOT_SIZE / 1024 / 1024}MB limit`);
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                const newTotal = calculateTotalSize() + base64.length;
                if (newTotal > MAX_TOTAL_STORAGE) {
                    alert('Total image storage limit exceeded (4MB max)');
                    return;
                }

                const newScreenshot: Screenshot = { base64 };
                setScreenshots(prev => [...prev, newScreenshot]);
                setFormData(prev => ({
                    ...prev,
                    screenshots: [...(prev.screenshots || []), newScreenshot]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeScreenshot = (index: number) => {
        setScreenshots(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            screenshots: (prev.screenshots || []).filter((_, i) => i !== index)
        }));
    };

    const userCasesCount = formData.userCases?.length ?? 0;

    return (
        <div className="flex flex-col w-full animate-fade-in text-primary">
            {/* Elegant Fixed Header */}
            <div className="flex-shrink-0 px-8 py-8 flex items-center justify-between border-b border-white/50 bg-white/60 backdrop-blur-xl z-20 rounded-t-[32px]">
                <div className="flex items-center gap-5">
                    <button onClick={onCancel} className="w-12 h-12 flex items-center justify-center glass-card text-muted hover:text-heading rounded-2xl transition-all border border-white/50 hover:scale-105 active:scale-90">
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-heading leading-tight">
                            {profile ? 'Modify' : 'Create'}
                        </h1>
                        <p className="text-[10px] text-muted font-black uppercase mt-1 tracking-[0.2em]">Project details</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {profile && (
                        <button onClick={() => onDelete(profile.id)} className="w-12 h-12 flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button
                        onClick={() => onSave(formData)}
                        className="h-12 px-6 accent-gradient text-white font-black text-[13px] uppercase tracking-widest rounded-2xl shadow-[0_10px_24px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all"
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* Generous Vertical Form */}
            <div className="px-8 py-10 space-y-12 pb-32">

                {/* Block: Identity */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4 text-accent">
                        <Layout size={18} strokeWidth={3} />
                        <h2 className="text-[12px] font-black uppercase tracking-[0.4em]">Identity</h2>
                    </div>
                    <div className="space-y-6">
                        <FieldGroup label="Product Name">
                            <DesignerInput name="name" value={formData.name} onChange={handleChange} placeholder="The name of your tool" required />
                        </FieldGroup>
                        <div className="grid grid-cols-1 gap-6">
                            <FieldGroup label="Category">
                                <DesignerInput name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Artificial Intelligence" />
                            </FieldGroup>
                            <FieldGroup label="Pricing Model">
                                <DesignerSelect name="pricing" value={formData.pricing} onChange={handleChange} options={[
                                    { value: '', label: 'Select status...' },
                                    { value: 'Free', label: 'Free to use' },
                                    { value: 'Freemium', label: 'Freemium model' },
                                    { value: 'Paid', label: 'Paid software' }
                                ]} />
                            </FieldGroup>
                        </div>
                        <FieldGroup label="Official Website">
                            <DesignerInput type="url" name="domain" value={formData.domain} onChange={handleChange} placeholder="https://your-product.com" />
                        </FieldGroup>
                    </div>
                </section>

                {/* Block: Pitch */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4 text-accent">
                        <Type size={18} strokeWidth={3} />
                        <h2 className="text-[12px] font-black uppercase tracking-[0.4em]">Marketing</h2>
                    </div>
                    <div className="space-y-6">
                        <FieldGroup label="Short Tagline">
                            <DesignerInput name="title" value={formData.title} onChange={handleChange} placeholder="Hook your audience" />
                        </FieldGroup>
                        <FieldGroup label="Elevator Pitch">
                            <DesignerTextArea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={2} placeholder="One sentence summary" />
                        </FieldGroup>
                        <FieldGroup label="Full Product Bio">
                            <DesignerTextArea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={6} placeholder="The full story of your product" />
                        </FieldGroup>
                    </div>
                </section>

                {/* Block: Key Features */}
                <section className="space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-accent">
                            <ListTree size={18} strokeWidth={3} />
                            <h2 className="text-[12px] font-black uppercase tracking-[0.4em]">Features</h2>
                        </div>
                        <button type="button" onClick={addFeature} className="accent-gradient text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_24px_rgba(16,185,129,0.3)]">
                            Add Key
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.features.map((feature, idx) => (
                            <div key={idx} className="group flex gap-4 items-center animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="flex-1 relative">
                                    <DesignerInput
                                        type="text"
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                                        placeholder={`Core capability 0${idx + 1}`}
                                    />
                                    {formData.features.length > 1 && (
                                        <button onClick={() => removeFeature(idx)} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all">
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Block: User Cases */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-accent">
                            <ListTree size={18} strokeWidth={3} />
                            <h2 className="text-[12px] font-black uppercase tracking-[0.4em]">User Cases</h2>
                        </div>
                        <span className="text-[10px] text-muted font-black uppercase tracking-[0.3em]">
                            {userCasesCount}/5
                        </span>
                    </div>
                    <div className="space-y-6">
                        <FieldGroup label="User Cases (one per line, max 5)">
                            <DesignerTextArea
                                name="userCases"
                                rows={5}
                                value={userCasesText}
                                onChange={(e) => handleUserCasesChange(e.target.value)}
                                placeholder="Describe up to five user cases, each on a new line"
                            />
                        </FieldGroup>
                    </div>
                </section>

                {/* Block: Images */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4 text-accent">
                        <Layout size={18} strokeWidth={3} />
                        <h2 className="text-[12px] font-black uppercase tracking-[0.4em]">Images</h2>
                    </div>
                    <div className="space-y-6">
                        <FieldGroup label="Logo">
                            <div className="flex items-center gap-4">
                                {logoPreview && (
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="w-16 h-16 rounded-2xl object-cover border border-white/30 shadow-sm"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="text-xs text-muted file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:bg-white/20 file:text-primary hover:file:bg-white/30"
                                />
                            </div>
                            <DesignerInput
                                type="url"
                                name="logoUrl"
                                value={formData.logoUrl || ''}
                                onChange={handleChange}
                                placeholder="Or paste logo URL"
                            />
                        </FieldGroup>

                        <FieldGroup label={`Screenshots (max ${MAX_SCREENSHOTS})`}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleScreenshotUpload}
                                className="text-xs text-muted file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:bg-white/20 file:text-primary hover:file:bg-white/30"
                            />
                            {screenshots.length > 0 && (
                                <div className="flex flex-wrap gap-3">
                                    {screenshots.map((shot, i) => (
                                        <div key={i} className="relative group">
                                            {shot.base64 && (
                                                <img
                                                    src={shot.base64}
                                                    alt={`Screenshot ${i + 1}`}
                                                    className="w-20 h-20 rounded-2xl object-cover border border-white/30"
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeScreenshot(i)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                aria-label={`Remove screenshot ${i + 1}`}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </FieldGroup>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfileEditor;
