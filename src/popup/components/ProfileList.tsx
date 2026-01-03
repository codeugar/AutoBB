import React from 'react';
import type { Profile } from '../../types';
import { Plus, Sparkles, ChevronRight } from 'lucide-react';

interface Props {
    profiles: Profile[];
    onEdit: (profile: Profile) => void;
    onCreate: () => void;
}

const ProfileList: React.FC<Props> = ({ profiles, onEdit, onCreate }) => {
    return (
        <div className="flex flex-col w-full text-primary">
            {/* Header */}
            <div className="px-7 pt-10 pb-6 flex justify-between items-end">
                <div className="space-y-1.5">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-accent">
                        Library
                    </h2>
                    <p className="text-xl font-black text-heading tracking-tight">
                        Profiles
                    </p>
                </div>
                <button
                    onClick={onCreate}
                    className="w-12 h-12 flex items-center justify-center accent-gradient text-white rounded-[20px] shadow-[0_10px_24px_rgba(16,185,129,0.3)] hover:scale-110 active:scale-90 transition-all duration-300"
                >
                    <Plus size={22} strokeWidth={4} />
                </button>
            </div>

            {/* List */}
            <div className="px-0 pb-10 space-y-4">
                {profiles.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-16 animate-fade-in text-center">
                        <div className="w-20 h-20 mb-8 flex items-center justify-center glass-card rounded-[32px] shadow-[inset_0_0_18px_rgba(255,255,255,0.4)] relative group">
                            <div className="absolute inset-0 bg-white/40 blur-xl opacity-0 group-hover:opacity-100 transition-all" />
                            <Sparkles size={32} className="text-accent relative z-10 animate-glow" />
                        </div>
                        <h3 className="text-base font-black text-muted-strong mb-2">No active projects</h3>
                        <p className="text-[12px] text-muted font-bold leading-relaxed px-8">
                            Click the plus button to configure your first automated profile.
                        </p>
                    </div>
                ) : (
                    profiles.map((profile, index) => (
                        <div
                            key={profile.id}
                            className="group relative w-full px-7 py-5 transition-all duration-300 cursor-pointer animate-slide-up
                                     flex flex-col gap-5 rounded-3xl glass-card hover:bg-white/50 hover:border-white/60
                                     after:content-[''] after:absolute after:left-7 after:right-7 after:bottom-0 after:h-px
                                     after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent
                                     after:opacity-50 after:transition-opacity after:duration-300 hover:after:opacity-80 last:after:opacity-0"
                            style={{ animationDelay: `${index * 100}ms` }}
                            onClick={() => onEdit(profile)}
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 glass-card rounded-2xl text-2xl font-black text-muted group-hover:text-accent group-hover:scale-105 transition-all">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-heading group-hover:text-heading truncate text-lg leading-tight tracking-tight">
                                        {profile.name}
                                    </h3>
                                    <p className="text-[11px] font-mono font-black text-muted mt-1 truncate tracking-tighter">
                                        {profile.domain || 'no-link.attached'}
                                    </p>
                                </div>
                                <ChevronRight size={18} className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                            </div>

                            <div className="flex gap-2.5">
                                <div className="px-3 py-1 rounded-full glass-card text-[10px] font-black uppercase tracking-widest text-muted-strong">
                                    {profile.category || 'Product'}
                                </div>
                                <div className="px-3 py-1 rounded-full glass-card text-[10px] font-black uppercase tracking-widest text-accent">
                                    {profile.pricing || 'Free'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProfileList;
