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
            <div className="px-[18px] pt-0 pb-2 flex justify-between items-end">
                <div className="flex-1 pr-3">
                    <div className="terminal-label">PROFILE BANK</div>
                    <p className="mt-1 text-[11px] text-muted uppercase tracking-[0.12em]">
                        {profiles.length ? `${profiles.length} records loaded` : 'No local profile records'}
                    </p>
                </div>
                <button
                    onClick={onCreate}
                    aria-label="Create new profile"
                    className="terminal-button primary h-8"
                >
                    <Plus size={13} strokeWidth={3} />
                    NEW
                </button>
            </div>

            <div className="px-[18px] pb-2">
                {profiles.length === 0 ? (
                    <button
                        type="button"
                        onClick={onCreate}
                        className="terminal-panel w-full flex items-center gap-3 px-3 py-3 animate-fade-in text-left hover:bg-[rgba(136,224,156,0.045)] transition-all"
                    >
                        <div className="w-8 h-8 flex items-center justify-center border border-[var(--phosphor-dim)] text-[var(--phosphor)]">
                            <Sparkles size={16} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-[12px] font-semibold text-heading uppercase tracking-[0.08em]">Create first profile</h3>
                            <p className="text-[10px] text-muted mt-0.5">Store product info for fast autofill.</p>
                        </div>
                    </button>
                ) : (
                    <div className="terminal-panel overflow-hidden">
                        {profiles.map((profile, index) => (
                            <button
                                key={profile.id}
                                className="group relative w-full px-3 py-2.5 transition-all duration-150 cursor-pointer animate-slide-up text-left
                                         flex items-center gap-3 hover:bg-[rgba(136,224,156,0.045)]
                                         border-b border-dashed border-[var(--ink-ghost)] last:border-b-0"
                                style={{ animationDelay: `${index * 60}ms` }}
                                onClick={() => onEdit(profile)}
                            >
                                <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 border border-[var(--ink-faint)] text-[12px] font-semibold text-heading transition-all group-hover:border-[var(--phosphor-dim)] group-hover:text-[var(--phosphor)]">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-heading truncate text-[11px] leading-tight uppercase tracking-[0.1em]">
                                        {profile.name}
                                    </h3>
                                    <p className="text-[10px] text-muted mt-0.5 truncate">
                                        {profile.domain || profile.category || 'Product profile'}
                                    </p>
                                </div>
                                <ChevronRight size={14} className="text-muted group-hover:text-[var(--phosphor)] transition-all" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileList;
