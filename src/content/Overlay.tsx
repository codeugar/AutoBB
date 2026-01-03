import React, { useState, useEffect, useRef } from 'react';
import type { Profile } from '../types';
import { storage } from '../storage';
import { matcher } from './matcher';
import type { DetectedField } from './matcher';
import { domUtils } from './dom';
import { Play, X, Zap, CheckCircle, AlertCircle, ChevronDown, MonitorOff } from 'lucide-react';
import { clampPosition, defaultPosition, snapPositionToEdge, type Point, type Size } from './overlayPosition';

const EDGE_PADDING = 12;
const POSITION_STORAGE_KEY = 'overlay_position';

const Overlay: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
    const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const dragOriginRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
    const positionRef = useRef<Point>(position);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const hasPositionRef = useRef(false);

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

    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    const getViewportSize = (): Size => ({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const getElementSize = (): Size => {
        const rect = containerRef.current?.getBoundingClientRect();
        return {
            width: rect?.width ?? 48,
            height: rect?.height ?? 48,
        };
    };

    const clampToViewport = (next: Point) =>
        clampPosition(next, getViewportSize(), getElementSize(), EDGE_PADDING);

    const ensurePosition = () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        if (!hasPositionRef.current) {
            const next = defaultPosition(getViewportSize(), getElementSize(), EDGE_PADDING);
            hasPositionRef.current = true;
            setPosition(next);
            return;
        }
        setPosition((prev) =>
            snapPositionToEdge(prev, getViewportSize(), getElementSize(), EDGE_PADDING)
        );
    };

    useEffect(() => {
        const raf = window.requestAnimationFrame(ensurePosition);
        return () => window.cancelAnimationFrame(raf);
    }, [isOpen]);

    useEffect(() => {
        const handleResize = () => {
            setPosition((prev) =>
                snapPositionToEdge(prev, getViewportSize(), getElementSize(), EDGE_PADDING)
            );
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const loadPosition = async () => {
            try {
                const result = await chrome.storage.local.get(POSITION_STORAGE_KEY);
                const stored = result[POSITION_STORAGE_KEY] as Point | undefined;
                if (stored && typeof stored.x === 'number' && typeof stored.y === 'number') {
                    hasPositionRef.current = true;
                    setPosition({ x: stored.x, y: stored.y });
                    window.requestAnimationFrame(ensurePosition);
                }
            } catch (e) {
                console.warn('Failed to load overlay position', e);
            }
        };
        loadPosition();
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
        if (isDragging || isDraggingRef.current) return;
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
                    field.element.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'; // Mint tint

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

    const savePosition = async (next: Point) => {
        try {
            await chrome.storage.local.set({ [POSITION_STORAGE_KEY]: next });
        } catch (e) {
            console.warn('Failed to save overlay position', e);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(false);
        isDraggingRef.current = false;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        dragOriginRef.current = positionRef.current;

        const moveHandler = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault();
            const deltaX = moveEvent.clientX - dragStartRef.current.x;
            const deltaY = moveEvent.clientY - dragStartRef.current.y;
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                isDraggingRef.current = true;
                setIsDragging(true);
                const nextX = dragOriginRef.current.x + deltaX;
                const nextY = dragOriginRef.current.y + deltaY;
                const next = clampToViewport({ x: nextX, y: nextY });
                positionRef.current = next;
                setPosition(next);
            }
        };

        const upHandler = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
            if (isDraggingRef.current) {
                const snapped = snapPositionToEdge(
                    positionRef.current,
                    getViewportSize(),
                    getElementSize(),
                    EDGE_PADDING,
                );
                positionRef.current = snapped;
                setPosition(snapped);
                void savePosition(snapped);
                setTimeout(() => {
                    isDraggingRef.current = false;
                    setIsDragging(false);
                }, 0);
            }
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
                ref={containerRef}
                className="fixed z-[2147483647] font-sans"
                style={{ left: `${position.x}px`, top: `${position.y}px` }}
                onMouseDown={handleMouseDown}
            >
                <button
                    onClick={handleOpen}

                    title="Open AutoBB (Drag to move)"
                    className={`
                        group relative flex items-center justify-center w-12 h-12 rounded-full cursor-grab active:cursor-grabbing
                        accent-gradient border border-white/50 shadow-[0_10px_24px_rgba(16,185,129,0.3)] transition-all duration-300
                        hover:scale-110 hover:border-white/70 hover:shadow-[0_14px_28px_rgba(16,185,129,0.35)]
                    `}
                >
                    {/* Inner glow effect */}
                    <div className="absolute inset-0 rounded-full bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <Zap
                        size={20}
                        className="text-white transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                    />

                    {/* Pulse indicator for detected fields */}
                    {detectedFields.length > 0 && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white/80 animate-pulse-glow" />
                    )}
                </button>
            </div>
        );
    }

    // Expanded Panel State
    return (
        <div
            ref={containerRef}
            className="fixed z-[2147483647] w-80 font-sans animate-slide-up overlay-panel text-primary rounded-2xl"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
            {/* Header */}
            <div
                className="overlay-header px-4 py-3 border-b border-white/35 accent-gradient flex items-center justify-between cursor-move select-none rounded-t-2xl"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-white/20 border border-white/40 flex items-center justify-center text-white/90">
                        <Zap size={14} />
                    </div>
                    <span className="font-semibold text-sm text-white">AutoBB</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-4">
                {/* Profile Selector */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider">
                        Active Profile
                    </label>
                    <div className="relative group">
                        <select
                            value={activeProfileId || ''}
                            onChange={(e) => {
                                setActiveProfileId(e.target.value);
                                storage.setActiveProfileId(e.target.value);
                            }}
                            className="w-full appearance-none pr-8 cursor-pointer glass-input rounded-lg px-3 py-2 text-sm text-primary transition-all duration-200 outline-none hover:border-white/60 focus:border-[rgba(16,185,129,0.6)] focus:ring-2 focus:ring-[rgba(16,185,129,0.15)]"
                        >
                            {profiles.length === 0 && <option value="">No profiles</option>}
                            {profiles.map(p => (
                                <option key={p.id} value={p.id} className="bg-white text-primary">{p.name}</option>
                            ))}
                        </select>
                        <ChevronDown
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none group-hover:text-muted-strong transition-colors"
                        />
                    </div>
                </div>

                {/* Stats Card */}
                <div className="p-3 glass-card rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted font-medium">Detected Fields</span>
                        <span className="px-2 py-0.5 glass-card text-accent text-xs font-mono font-medium rounded-md">
                            {detectedFields.length}
                        </span>
                    </div>

                    {detectedFields.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1.5">
                            {detectedFields.slice(0, 3).map((f, i) => (
                                <div key={i} className="flex items-center justify-between text-[11px] group">
                                    <span className="text-muted font-mono max-w-[140px] truncate group-hover:text-muted-strong transition-colors">
                                        {f.element.name || f.element.id || 'input'}
                                    </span>
                                    <span className="text-accent group-hover:text-accent transition-colors">
                                        {f.fieldKey}
                                    </span>
                                </div>
                            ))}
                            {detectedFields.length > 3 && (
                                <p className="text-center text-[10px] text-muted mt-1">
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
                        relative overflow-hidden accent-gradient
                        border border-white/40 shadow-[0_10px_24px_rgba(16,185,129,0.3)]
                        text-white font-medium transition-all duration-300
                        hover:scale-[1.02] hover:shadow-[0_12px_26px_rgba(16,185,129,0.35)]
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
                            ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/10'}
                    `}>
                        {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        {status.msg}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/50 bg-white/45 rounded-b-2xl">
                <button
                    onClick={handleDisableSite}
                    className="w-full py-1 text-[11px] text-muted hover:text-red-500 flex items-center justify-center gap-1.5 transition-colors group"
                >
                    <MonitorOff size={12} className="group-hover:stroke-red-400 transition-colors" />
                    Disable on this site
                </button>
            </div>
        </div>
    );
};

export default Overlay;
