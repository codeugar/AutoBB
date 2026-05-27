import React, { useRef, useState } from 'react';
import type { Profile, Screenshot } from '../../types';
import { ArrowLeft, Trash2, X, ChevronDown, Layout, Type, ListTree } from 'lucide-react';
import { parseUserCases } from '../utils/userCases';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface Props {
    profile: Profile | null;
    onSave: (profile: Profile) => void;
    onAutoSave?: (profile: Profile) => void;
    onCancel: () => void;
    onDelete: (id: string) => void;
}

const FieldGroup = ({ label, forId, children }: { label: string; forId?: string; children: React.ReactNode }) => (
    <div className="space-y-2.5">
        <label htmlFor={forId} className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted block px-1">{label}</label>
        {children}
    </div>
);

const DesignerInput = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className="w-full h-12 bg-white/[0.06] border border-[rgba(255,255,255,0.08)] rounded-none px-4 text-[13px] font-medium text-primary placeholder-[rgba(210,218,230,0.35)]
                 transition-all duration-300 outline-none hover:bg-white/[0.10] focus:border-[rgba(136,224,156,0.45)] focus:ring-4 focus:ring-[rgba(136,224,156,0.12)]"
    />
);

const DesignerTextArea = ({ rows = 4, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        rows={rows}
        {...props}
        className="w-full bg-white/[0.06] border border-[rgba(255,255,255,0.08)] rounded-none px-4 py-3 text-[13px] leading-5 font-medium text-primary placeholder-[rgba(210,218,230,0.35)]
                 transition-all duration-300 outline-none resize-none hover:bg-white/[0.10] focus:border-[rgba(136,224,156,0.45)] focus:ring-4 focus:ring-[rgba(136,224,156,0.12)]"
    />
);

const DesignerSelect = ({ options, ...props }: { options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative group">
        <select
            {...props}
            className="w-full h-12 bg-white/[0.06] border border-[rgba(255,255,255,0.08)] rounded-none px-4 text-[13px] font-medium text-primary appearance-none cursor-pointer
                     transition-all duration-300 outline-none hover:bg-white/[0.10] focus:border-[rgba(136,224,156,0.45)] focus:ring-4 focus:ring-[rgba(136,224,156,0.12)]"
        >
            {options.map(opt => <option key={opt.value} value={opt.value} className="bg-[#0F1411] text-primary">{opt.label}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none group-hover:text-muted-strong transition-colors" />
    </div>
);

const ProfileEditor: React.FC<Props> = ({ profile, onSave, onAutoSave, onCancel, onDelete }) => {
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
    const [logoError, setLogoError] = useState<string | null>(null);
    const [screenshotError, setScreenshotError] = useState<string | null>(null);
    const formDataRef = useRef(formData);

    const updateFormData = (updater: (prev: Profile) => Profile) => {
        const next = updater(formDataRef.current);
        formDataRef.current = next;
        setFormData(next);
        onAutoSave?.(next);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureChange = (index: number, value: string) => {
        updateFormData(prev => {
            const features = [...prev.features];
            features[index] = value;
            return { ...prev, features };
        });
    };

    const [userCasesText, setUserCasesText] = useState<string>(
        (profile?.userCases ?? []).join('\n')
    );

    const handleUserCasesChange = (value: string) => {
        const lines = value.split('\n');
        const limitedText = lines.slice(0, 5).join('\n');
        setUserCasesText(limitedText);
        const parsed = parseUserCases(limitedText);
        updateFormData(prev => ({ ...prev, userCases: parsed }));
    };

    const addFeature = () => updateFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    const removeFeature = (index: number) => updateFormData(prev => ({ ...prev, features: prev.features.length > 1 ? prev.features.filter((_, i) => i !== index) : [''] }));

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_LOGO_SIZE) {
            setLogoError(`Logo must be under ${Math.round(MAX_LOGO_SIZE / 1024)}KB`);
            return;
        }

        setLogoError(null);
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setLogoPreview(base64);
            updateFormData(prev => ({ ...prev, logoBase64: base64 }));
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
            setScreenshotError(`Maximum ${MAX_SCREENSHOTS} screenshots allowed`);
            return;
        }

        files.forEach(file => {
            if (file.size > MAX_SCREENSHOT_SIZE) {
                setScreenshotError(`${file.name} exceeds ${MAX_SCREENSHOT_SIZE / 1024 / 1024}MB limit`);
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                const newTotal = calculateTotalSize() + base64.length;
                if (newTotal > MAX_TOTAL_STORAGE) {
                    setScreenshotError('Total image storage limit exceeded (4MB max)');
                    return;
                }

                setScreenshotError(null);
                const newScreenshot: Screenshot = { base64 };
                setScreenshots(prev => [...prev, newScreenshot]);
                updateFormData(prev => ({
                    ...prev,
                    screenshots: [...(prev.screenshots || []), newScreenshot]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeScreenshot = (index: number) => {
        setScreenshots(prev => prev.filter((_, i) => i !== index));
        updateFormData(prev => ({
            ...prev,
            screenshots: (prev.screenshots || []).filter((_, i) => i !== index)
        }));
    };

    const userCasesCount = formData.userCases?.length ?? 0;

    return (
        <div className="flex flex-col w-full animate-fade-in text-primary">
            <div className="flex-shrink-0 px-6 py-5 flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-white/[0.06] backdrop-blur-xl z-20">
                <div className="flex items-center gap-3">
                    <button onClick={onCancel} aria-label="Go back" className="w-10 h-10 flex items-center justify-center bg-white/[0.06] border border-[rgba(255,255,255,0.08)] text-muted hover:text-heading rounded-none transition-all hover:scale-105 active:scale-95">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-[17px] font-semibold text-heading leading-tight">
                            {profile ? 'Modify' : 'Create'}
                        </h1>
                        <p className="text-[11px] text-muted font-medium mt-1">Project details</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {profile && (
                        <button onClick={() => onDelete(profile.id)} aria-label="Delete profile" className="w-10 h-10 flex items-center justify-center text-muted hover:text-[var(--color-error-text)] hover:bg-[var(--color-error-bg)] rounded-none transition-all">
                            <Trash2 size={17} />
                        </button>
                    )}
                    <button
                        onClick={() => onSave(formData)}
                        className="h-10 px-4 accent-gradient text-white font-semibold text-[12px] rounded-none shadow-[0_10px_24px_rgba(136,224,156,0.22)] hover:scale-105 active:scale-95 transition-all"
                    >
                        Save
                    </button>
                </div>
            </div>

            <div className="px-6 py-7 space-y-8 pb-24">

                <section className="space-y-5">
                    <div className="flex items-center gap-3 text-accent">
                        <Layout size={16} strokeWidth={2.5} />
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em]">Identity</h2>
                    </div>
                    <div className="space-y-4">
                        <FieldGroup label="Product Name" forId="field-name">
                            <DesignerInput id="field-name" name="name" value={formData.name} onChange={handleChange} placeholder="The name of your tool" required />
                        </FieldGroup>
                        <div className="grid grid-cols-1 gap-4">
                            <FieldGroup label="Category" forId="field-category">
                                <DesignerInput id="field-category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Artificial Intelligence" />
                            </FieldGroup>
                            <FieldGroup label="Pricing Model" forId="field-pricing">
                                <DesignerSelect id="field-pricing" name="pricing" value={formData.pricing} onChange={handleChange} options={[
                                    { value: '', label: 'Select status...' },
                                    { value: 'Free', label: 'Free to use' },
                                    { value: 'Freemium', label: 'Freemium model' },
                                    { value: 'Paid', label: 'Paid software' }
                                ]} />
                            </FieldGroup>
                        </div>
                        <FieldGroup label="Official Website" forId="field-domain">
                            <DesignerInput id="field-domain" type="url" name="domain" value={formData.domain} onChange={handleChange} placeholder="https://your-product.com" />
                        </FieldGroup>
                        <FieldGroup label="Contact Email" forId="field-email">
                            <DesignerInput id="field-email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="hello@your-product.com" />
                        </FieldGroup>
                    </div>
                </section>

                {/* Block: Pitch */}
                <section className="space-y-5">
                    <div className="flex items-center gap-3 text-accent">
                        <Type size={16} strokeWidth={2.5} />
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em]">Marketing</h2>
                    </div>
                    <div className="space-y-4">
                        <FieldGroup label="Short Tagline" forId="field-title">
                            <DesignerInput id="field-title" name="title" value={formData.title} onChange={handleChange} placeholder="Hook your audience" />
                        </FieldGroup>
                        <FieldGroup label="Elevator Pitch" forId="field-short-desc">
                            <DesignerTextArea id="field-short-desc" name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={2} placeholder="One sentence summary" />
                        </FieldGroup>
                        <FieldGroup label="Full Product Bio" forId="field-long-desc">
                            <DesignerTextArea id="field-long-desc" name="longDescription" value={formData.longDescription} onChange={handleChange} rows={6} placeholder="The full story of your product" />
                        </FieldGroup>
                    </div>
                </section>

                {/* Block: Key Features */}
                <section className="space-y-5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 text-accent">
                            <ListTree size={16} strokeWidth={2.5} />
                            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em]">Features</h2>
                        </div>
                        <button type="button" onClick={addFeature} className="accent-gradient text-white px-3 py-1.5 rounded-none text-[11px] font-semibold transition-all shadow-[0_10px_24px_rgba(136,224,156,0.20)]">
                            Add Key
                        </button>
                    </div>
                    <div className="space-y-3">
                        {formData.features.map((feature, idx) => (
                            <div key={idx} className="group flex gap-4 items-center animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="flex-1 relative">
                                    <DesignerInput
                                        id={`field-feature-${idx}`}
                                        type="text"
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                                        placeholder={`Core capability 0${idx + 1}`}
                                        aria-label={`Feature ${idx + 1}`}
                                    />
                                    {formData.features.length > 1 && (
                                        <button onClick={() => removeFeature(idx)} aria-label={`Remove feature ${idx + 1}`} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-muted hover:text-[var(--color-error-text)] transition-all">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Block: User Cases */}
                <section className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-accent">
                            <ListTree size={16} strokeWidth={2.5} />
                            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em]">User Cases</h2>
                        </div>
                        <span className="text-[11px] text-muted font-medium">
                            {userCasesCount}/5
                        </span>
                    </div>
                    <div className="space-y-4">
                        <FieldGroup label="User Cases (one per line, max 5)" forId="field-user-cases">
                            <DesignerTextArea
                                id="field-user-cases"
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
                <section className="space-y-5">
                    <div className="flex items-center gap-3 text-accent">
                        <Layout size={16} strokeWidth={2.5} />
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em]">Images</h2>
                    </div>
                    <div className="space-y-4">
                        <FieldGroup label="Logo" forId="field-logo-file">
                            <div className="flex items-center gap-4">
                                {logoPreview && (
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="w-16 h-16 rounded-none object-cover border border-white/30 shadow-sm"
                                    />
                                )}
                                <input
                                    id="field-logo-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="text-xs text-muted file:mr-2 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:bg-white/[0.08] file:text-primary hover:file:bg-white/[0.06]"
                                />
                            </div>
                            {logoError && (
                                <p role="alert" className="text-xs text-[var(--color-error-text)] px-2 mt-1">{logoError}</p>
                            )}
                            <DesignerInput
                                id="field-logo-url"
                                type="url"
                                name="logoUrl"
                                value={formData.logoUrl || ''}
                                onChange={handleChange}
                                placeholder="Or paste logo URL"
                            />
                        </FieldGroup>

                        <FieldGroup label={`Screenshots (max ${MAX_SCREENSHOTS})`} forId="field-screenshots">
                            <input
                                id="field-screenshots"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleScreenshotUpload}
                                className="text-xs text-muted file:mr-2 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:bg-white/[0.08] file:text-primary hover:file:bg-white/[0.06]"
                            />
                            {screenshotError && (
                                <p role="alert" className="text-xs text-[var(--color-error-text)] px-2 mt-1">{screenshotError}</p>
                            )}
                            {screenshots.length > 0 && (
                                <div className="flex flex-wrap gap-3">
                                    {screenshots.map((shot, i) => (
                                        <div key={i} className="relative group">
                                            {shot.base64 && (
                                                <img
                                                    src={shot.base64}
                                                    alt={`Screenshot ${i + 1}`}
                                                    className="w-20 h-20 rounded-none object-cover border border-white/30"
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeScreenshot(i)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-error)] rounded-none text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
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
