import React, { useState, useEffect } from 'react';
import type { Profile } from '../types';
import { storage } from '../storage';
import { matcher } from './matcher';
import type { DetectedField } from './matcher';
import { domUtils } from './dom';
import { Play, X, Zap, CheckCircle, AlertCircle, ChevronDown, MonitorOff } from 'lucide-react';

const Overlay: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
    const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartY, setDragStartY] = useState(0);
    const [initialBottom, setInitialBottom] = useState(24);

    useEffect(() => {
        loadData();
        checkVisibility();

        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes['profiles'] || changes['activeProfileId']) {
                loadData();
            }
            if (changes['global_disabled'] || changes['disabled_sites']) {
                checkVisibility();
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }, []);

    const checkVisibility = async () => {
        const gDisabled = await storage.getGlobalDisabled();
        if (gDisabled) {
            setIsVisible(false);
            return;
        }
        const domain = window.location.hostname;
        const sDisabled = await storage.getSiteDisabled(domain);
        if (sDisabled) {
            setIsVisible(false);
            return;
        }
        setIsVisible(true);
    };

    const loadData = async () => {
        const profs = await storage.getProfiles();
        setProfiles(profs);
        const active = await storage.getActiveProfileId();
        if (active) setActiveProfileId(active);
        else if (profs.length > 0) setActiveProfileId(profs[0].id);
    };

    const scanPage = () => {
        const fields = matcher.detectFields(document);
        setDetectedFields(fields);
        return fields;
    };

    const handleOpen = () => {
        if (isDragging) return;
        setIsOpen(true);
        scanPage();
    };

    const handleDisableSite = async () => {
        const domain = window.location.hostname;
        await storage.setSiteDisabled(domain, true);
        setIsVisible(false);
    };

    const handleAutoFill = async () => {
        if (!activeProfileId) {
            setStatus({ msg: 'No profile selected', type: 'error' });
            return;
        }
        const profile = profiles.find(p => p.id === activeProfileId);
        if (!profile) return;

        const fields = scanPage();
        let count = 0;

        fields.forEach(field => {
            const key = field.fieldKey;
            let value = '';

            if (key.startsWith('features.')) {
                const idx = parseInt(key.split('.')[1]);
                value = profile.features[idx] || '';
            } else if (key in profile) {
                // @ts-ignore
                value = (profile[key] as string) || '';
            }

            if (value) {
                try {
                    domUtils.setNativeValue(field.element as HTMLInputElement, value);
                    // Add a subtle flash effect to filled elements
                    const originalTransition = field.element.style.transition;
                    const originalBg = field.element.style.backgroundColor;

                    field.element.style.transition = 'background-color 0.5s ease';
                    field.element.style.backgroundColor = 'rgba(139, 92, 246, 0.2)'; // Violet tint

                    setTimeout(() => {
                        field.element.style.backgroundColor = originalBg;
                        setTimeout(() => {
                            field.element.style.transition = originalTransition;
                        }, 500);
                    }, 500);

                    count++;
                } catch (e) {
                    console.error('Failed to fill', field, e);
                }
            }
        });

        setStatus({ msg: `Filled ${count} fields`, type: 'success' });
        setTimeout(() => setStatus(null), 3000);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(false);
        setDragStartY(e.clientY);

        const moveHandler = (moveEvent: MouseEvent) => {
            const deltaY = dragStartY - moveEvent.clientY;
            if (Math.abs(deltaY) > 5) {
                setIsDragging(true);
                setInitialBottom(prev => Math.max(10, prev + (dragStartY - moveEvent.clientY)));
                setDragStartY(moveEvent.clientY);
            }
        };

        const upHandler = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    };

    if (!isVisible) return null;

    const activeProfile = profiles.find(p => p.id === activeProfileId);

    // Collapsed FAB State
    if (!isOpen) {
        return (
            <div
                className="fixed right-6 z-[2147483647] font-sans"
                style={{ bottom: `${initialBottom}px` }}
                onMouseDown={handleMouseDown}
            >
                <button
                    onClick={handleOpen}

                    title="Open AutoLink (Drag to move)"
                    className={`
                        group relative flex items-center justify-center w-12 h-12 rounded-full cursor-grab active:cursor-grabbing
                        bg-zinc-900 border border-white/10 shadow-lg transition-all duration-300
                        hover:scale-110 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]
                    `}
                >
                    {/* Inner glow effect */}
                    <div className="absolute inset-0 rounded-full bg-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <Zap
                        size={20}
                        className="text-violet-400 transition-transform duration-300 group-hover:scale-110 group-hover:text-violet-300 group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                    />

                    {/* Pulse indicator for detected fields */}
                    {detectedFields.length > 0 && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900 animate-pulse-glow" />
                    )}
                </button>
            </div>
        );
    }

    // Expanded Panel State
    return (
        <div
            className="fixed right-6 z-[2147483647] w-80 font-sans animate-slide-up bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl"
            style={{ bottom: `${initialBottom}px` }}
        >
            {/* Header */}
            <div
                className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between cursor-move select-none"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center">
                        <Zap size={14} className="text-violet-400" />
                    </div>
                    <span className="font-semibold text-sm bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                        AutoLink
                    </span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-4">
                {/* Profile Selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        Active Profile
                    </label>
                    <div className="relative group">
                        <select
                            value={activeProfileId || ''}
                            onChange={(e) => {
                                setActiveProfileId(e.target.value);
                                storage.setActiveProfileId(e.target.value);
                            }}
                            className="w-full appearance-none pr-8 cursor-pointer bg-zinc-900/50 group-hover:bg-zinc-900/80 bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 transition-all duration-200 outline-none hover:bg-black/40 hover:border-white/10 focus:bg-black/40 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                        >
                            {profiles.length === 0 && <option value="">No profiles</option>}
                            {profiles.map(p => (
                                <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>
                            ))}
                        </select>
                        <ChevronDown
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-zinc-300 transition-colors"
                        />
                    </div>
                </div>

                {/* Stats Card */}
                <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400 font-medium">Detected Fields</span>
                        <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-xs font-mono font-medium rounded-md border border-violet-500/10">
                            {detectedFields.length}
                        </span>
                    </div>

                    {detectedFields.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1.5">
                            {detectedFields.slice(0, 3).map((f, i) => (
                                <div key={i} className="flex items-center justify-between text-[11px] group">
                                    <span className="text-zinc-500 font-mono max-w-[140px] truncate group-hover:text-zinc-300 transition-colors">
                                        {f.element.name || f.element.id || 'input'}
                                    </span>
                                    <span className="text-violet-400/80 group-hover:text-violet-400 transition-colors">
                                        {f.fieldKey}
                                    </span>
                                </div>
                            ))}
                            {detectedFields.length > 3 && (
                                <p className="text-center text-[10px] text-zinc-600 mt-1">
                                    +{detectedFields.length - 3} more fields
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Auto Fill Button */}
                <button
                    onClick={handleAutoFill}
                    disabled={!activeProfile || detectedFields.length === 0}
                    className={`
                        w-full py-3 rounded-xl flex items-center justify-center gap-2
                        relative overflow-hidden bg-gradient-to-b from-violet-500 to-violet-600 
                        border border-violet-400/20 shadow-[0_0_20px_-5px_rgba(139,92,246,0.4)]
                        text-white font-medium transition-all duration-300
                        hover:scale-[1.02] hover:shadow-[0_0_25px_-5px_rgba(139,92,246,0.6)]
                        active:scale-[0.98] active:brightness-90
                        after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/20 after:to-transparent after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale
                    `}
                >
                    <Play size={16} className="fill-current z-10" />
                    <span className="font-semibold tracking-wide text-sm z-10">Auto Fill</span>
                </button>

                {/* Status Message */}
                {status && (
                    <div className={`
                        px-3 py-2.5 rounded-lg flex items-center gap-2 text-xs font-medium animate-fade-in
                        ${status.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            : 'bg-red-500/10 text-red-400 border border-red-500/10'}
                    `}>
                        {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        {status.msg}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/5 bg-white/[0.02]">
                <button
                    onClick={handleDisableSite}
                    className="w-full py-1 text-[11px] text-zinc-600 hover:text-red-400 flex items-center justify-center gap-1.5 transition-colors group"
                >
                    <MonitorOff size={12} className="group-hover:stroke-red-400 transition-colors" />
                    Disable on this site
                </button>
            </div>
        </div>
    );
};

export default Overlay;
