import React, { useState } from 'react';
import type { Profile } from '../../types';
import { ArrowLeft, Trash2, X, ChevronDown, Layout, Type, ListTree } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface Props {
    profile: Profile | null;
    onSave: (profile: Profile) => void;
    onCancel: () => void;
    onDelete: (id: string) => void;
}

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-4">
        <label className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 block px-2">{label}</label>
        {children}
    </div>
);

const DesignerInput = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className="w-full h-16 bg-zinc-950 border border-white/10 rounded-[20px] px-6 text-[15px] font-black text-zinc-100 placeholder-zinc-800 
                 transition-all duration-300 outline-none hover:border-white/20 focus:border-violet-500/50 focus:ring-8 focus:ring-violet-500/5"
    />
);

const DesignerTextArea = ({ rows = 4, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        rows={rows}
        {...props}
        className="w-full bg-zinc-950 border border-white/10 rounded-[24px] px-6 py-5 text-[15px] font-black text-zinc-100 placeholder-zinc-800 
                 transition-all duration-300 outline-none resize-none hover:border-white/20 focus:border-violet-500/50 focus:ring-8 focus:ring-violet-500/5"
    />
);

const DesignerSelect = ({ options, ...props }: { options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative group">
        <select
            {...props}
            className="w-full h-16 bg-zinc-950 border border-white/10 rounded-[20px] px-6 text-[15px] font-black text-zinc-100 appearance-none cursor-pointer
                     transition-all duration-300 outline-none hover:border-white/20 focus:border-violet-500/50 focus:ring-8 focus:ring-violet-500/5"
        >
            {options.map(opt => <option key={opt.value} value={opt.value} className="bg-zinc-900">{opt.label}</option>)}
        </select>
        <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none group-hover:text-zinc-500 transition-colors" />
    </div>
);

const ProfileEditor: React.FC<Props> = ({ profile, onSave, onCancel, onDelete }) => {
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
        customFields: {}
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeature = () => setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    const removeFeature = (index: number) => setFormData(prev => ({ ...prev, features: formData.features.length > 1 ? formData.features.filter((_, i) => i !== index) : [''] }));

    return (
        <div className="flex flex-col h-full w-full overflow-hidden animate-fade-in bg-zinc-900/40">
            {/* Elegant Fixed Header */}
            <div className="flex-shrink-0 px-8 py-8 flex items-center justify-between border-b border-white/5 bg-zinc-950/90 backdrop-blur-2xl z-20">
                <div className="flex items-center gap-5">
                    <button onClick={onCancel} className="w-12 h-12 flex items-center justify-center bg-zinc-900 text-zinc-400 hover:text-white rounded-2xl transition-all border border-white/5 hover:scale-105 active:scale-90">
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-white leading-tight">
                            {profile ? 'Modify' : 'Create'}
                        </h1>
                        <p className="text-[10px] text-zinc-600 font-black uppercase mt-1 tracking-[0.2em]">Project details</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {profile && (
                        <button onClick={() => onDelete(profile.id)} className="w-12 h-12 flex items-center justify-center text-zinc-700 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all">
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button
                        onClick={() => onSave(formData)}
                        className="h-12 px-6 bg-white text-black font-black text-[13px] uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* Generous Vertical Form */}
            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 custom-scrollbar pb-32">

                {/* Block: Identity */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4 text-violet-500">
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
                    <div className="flex items-center gap-4 text-violet-500">
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
                        <div className="flex items-center gap-4 text-violet-500">
                            <ListTree size={18} strokeWidth={3} />
                            <h2 className="text-[12px] font-black uppercase tracking-[0.4em]">Features</h2>
                        </div>
                        <button type="button" onClick={addFeature} className="bg-zinc-950 border border-white/10 text-zinc-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl">
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
                                        <button onClick={() => removeFeature(idx)} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all">
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfileEditor;
