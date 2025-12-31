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
        <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-10 pb-6 flex justify-between items-end">
                <div className="space-y-1.5">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-500">
                        Library
                    </h2>
                    <p className="text-xl font-black text-white tracking-tight">
                        Profiles
                    </p>
                </div>
                <button
                    onClick={onCreate}
                    className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-[20px] shadow-2xl hover:scale-110 active:scale-90 transition-all duration-300"
                >
                    <Plus size={22} strokeWidth={4} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-7 pb-10 space-y-4 custom-scrollbar">
                {profiles.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-16 animate-fade-in text-center">
                        <div className="w-20 h-20 mb-8 flex items-center justify-center bg-zinc-950 border border-white/5 rounded-[32px] shadow-inner relative group">
                            <div className="absolute inset-0 bg-violet-600/5 blur-xl group-hover:bg-violet-600/10 transition-all" />
                            <Sparkles size={32} className="text-zinc-800 relative z-10 animate-glow" />
                        </div>
                        <h3 className="text-base font-black text-zinc-400 mb-2">No active projects</h3>
                        <p className="text-[12px] text-zinc-600 font-bold leading-relaxed px-8">
                            Click the plus button to configure your first automated profile.
                        </p>
                    </div>
                ) : (
                    profiles.map((profile, index) => (
                        <div
                            key={profile.id}
                            className="group relative p-6 transition-all duration-500 cursor-pointer animate-slide-up
                                     bg-zinc-950/60 border border-white/5 rounded-[32px] hover:bg-zinc-900 hover:border-violet-500/30
                                     flex flex-col gap-5 shadow-xl hover:shadow-violet-600/5"
                            style={{ animationDelay: `${index * 100}ms` }}
                            onClick={() => onEdit(profile)}
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 bg-zinc-900 border border-white/5 rounded-2xl text-2xl font-black text-zinc-600 group-hover:text-violet-400 group-hover:scale-105 transition-all">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-zinc-200 group-hover:text-white truncate text-lg leading-tight tracking-tight">
                                        {profile.name}
                                    </h3>
                                    <p className="text-[11px] font-mono font-black text-zinc-700 group-hover:text-zinc-500 mt-1 truncate tracking-tighter">
                                        {profile.domain || 'no-link.attached'}
                                    </p>
                                </div>
                                <ChevronRight size={18} className="text-zinc-800 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                            </div>

                            <div className="flex gap-2.5">
                                <div className="px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    {profile.category || 'Product'}
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500/50">
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
