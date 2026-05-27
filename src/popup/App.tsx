import { useState, useEffect, useRef } from 'react';
import type { Profile } from '../types';
import { storage } from '../storage';
import ProfileList from './components/ProfileList';
import ProfileEditor from './components/ProfileEditor';
import ApiKeySettings from './components/ApiKeySettings';
import WebsiteTracker from './components/WebsiteTracker';
import SerpSearch from './components/SerpSearch';
import BatchGoogleSearch from './components/BatchGoogleSearch';
import { MonitorOff, Globe, Settings, TrendingUp, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            aria-hidden="true"
            tabIndex={-1}
            className={`terminal-toggle flex-shrink-0 ${enabled ? 'on' : ''}`}
        />
    );
};

const ControlCard = ({ icon: Icon, label, enabled, onToggle }: { icon: LucideIcon; label: string; enabled: boolean; onToggle: () => void }) => (
    <div
        role="button"
        tabIndex={0}
        aria-pressed={enabled}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        className="flex items-center justify-between min-h-9 px-3 py-2 border-b border-dashed border-[var(--ink-ghost)] last:border-b-0 hover:bg-[rgba(136,224,156,0.045)] transition-all cursor-pointer group"
    >
        <div className="flex items-center gap-2 min-w-0">
            <div className={`w-6 h-6 flex items-center justify-center border transition-all duration-150 ${enabled ? 'border-[var(--phosphor-dim)] text-[var(--phosphor)]' : 'border-[var(--ink-ghost)] text-muted'}`}>
                <Icon size={14} />
            </div>
            <div className="min-w-0">
                <span className={`block text-[10px] font-semibold uppercase tracking-[0.16em] truncate ${enabled ? 'text-heading' : 'text-muted'}`}>
                    {label}
                </span>
            </div>
        </div>
        <ToggleSwitch enabled={enabled} onToggle={onToggle} />
    </div>
);

const App = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentView, setCurrentView] = useState<'list' | 'editor' | 'settings' | 'tracker' | 'serp'>('list');
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

    const [isGlobalEnabled, setIsGlobalEnabled] = useState(true);
    const [isCurrentSiteEnabled, setIsCurrentSiteEnabled] = useState(true);
    const [currentDomain, setCurrentDomain] = useState('');
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (typeof chrome === 'undefined' || !chrome.storage?.local) {
            return;
        }

        void Promise.all([
            storage.getProfiles(),
            storage.getGlobalDisabled()
        ]).then(async ([profilesData, globalDisabled]) => {
            setProfiles(profilesData);
            setIsGlobalEnabled(!globalDisabled);

            const tabs = chrome.tabs?.query
                ? await chrome.tabs.query({ active: true, currentWindow: true })
                : [];
            if (tabs[0]?.url) {
                try {
                    const domain = new URL(tabs[0].url).hostname;
                    setCurrentDomain(domain);
                    const siteDisabled = await storage.getSiteDisabled(domain);
                    setIsCurrentSiteEnabled(!siteDisabled);
                } catch {
                    setCurrentDomain('');
                }
            }
        });
    }, []);

    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current !== null) {
                window.clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    const toggleGlobal = async () => {
        const newState = !isGlobalEnabled;
        setIsGlobalEnabled(newState);
        await storage.setGlobalDisabled(!newState);
    };

    const toggleSite = async () => {
        if (!currentDomain) return;
        const newState = !isCurrentSiteEnabled;
        setIsCurrentSiteEnabled(newState);
        await storage.setSiteDisabled(currentDomain, !newState);
    };

    const handleScroll = () => {
        setIsScrolling(true);
        if (scrollTimeoutRef.current !== null) {
            window.clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = window.setTimeout(() => {
            setIsScrolling(false);
        }, 800);
    };

    return (
        <div
            className="terminal-frame w-[460px] max-w-[460px] h-[600px] overflow-hidden select-none box-border"
        >
            <div className="h-full flex flex-col relative z-[2]">
                {currentView === 'list' && (
                    <header className="flex-shrink-0 px-[18px] pt-[18px] pb-3 relative z-20 animate-fade-in">
                        <div className="flex items-end justify-between gap-3 pb-3 border-b border-[var(--ink-faint)] relative after:content-[''] after:absolute after:-bottom-px after:left-0 after:w-6 after:h-px after:bg-[var(--phosphor)]">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-muted">
                                    <span className="terminal-dot" />
                                    AUTOBB · MV3 NODE
                                </div>
                                <h1 className="terminal-display mt-1 text-[30px] leading-none">
                                    AUTOBB
                                </h1>
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="text-[9px] uppercase tracking-[0.12em] text-muted text-right leading-[1.45]">
                                    v1.4<br />
                                    SEARCH · AUTOFILL
                                </div>
                                <button
                                    onClick={() => setCurrentView('settings')}
                                    className="terminal-button h-8 w-8 px-0"
                                    aria-label="Settings"
                                >
                                    <Settings size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="terminal-label mt-3 mb-1.5">SYSTEM FLAGS</div>
                        <div className="terminal-panel text-[var(--ink)]">
                            <ControlCard
                                icon={MonitorOff}
                                label="Overlay layer"
                                enabled={isGlobalEnabled}
                                onToggle={toggleGlobal}
                            />
                            <ControlCard
                                icon={Globe}
                                label={currentDomain || 'Current site'}
                                enabled={isCurrentSiteEnabled}
                                onToggle={toggleSite}
                            />
                        </div>
                    </header>
                )}

                {/* Dynamic Content Frame */}
                <main
                    onScroll={handleScroll}
                    className={`flex-1 min-h-0 relative z-10 flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar ${isScrolling ? 'is-scrolling' : ''} ${currentView === 'list' ? 'pb-4' : 'p-0 pb-4'}`}
                >
                    {currentView === 'settings' ? (
                        <ApiKeySettings onBack={() => setCurrentView('list')} />
                    ) : currentView === 'tracker' ? (
                        <WebsiteTracker onBack={() => setCurrentView('list')} />
                    ) : currentView === 'serp' ? (
                        <SerpSearch onBack={() => setCurrentView('list')} />
                    ) : currentView === 'list' ? (
                        <>
                            <BatchGoogleSearch />
                            <ProfileList
                                profiles={profiles}
                                onEdit={(p) => { setEditingProfile(p); setCurrentView('editor'); }}
                                onCreate={() => { setEditingProfile(null); setCurrentView('editor'); }}
                            />
                        </>
                    ) : (
                        <ProfileEditor
                            profile={editingProfile}
                            onSave={async (p) => {
                                await storage.saveProfile(p);
                                const updated = await storage.getProfiles();
                                setProfiles(updated);
                                setCurrentView('list');
                            }}
                            onAutoSave={async (p) => {
                                await storage.saveProfile(p);
                                const updated = await storage.getProfiles();
                                setProfiles(updated);
                            }}
                            onCancel={() => setCurrentView('list')}
                            onDelete={async (id) => {
                                await storage.deleteProfile(id);
                                const updated = await storage.getProfiles();
                                setProfiles(updated);
                                setCurrentView('list');
                            }}
                        />
                    )}
                </main>

                <footer className="flex-shrink-0 px-[18px] py-3 flex items-center justify-center bg-[var(--bg)] border-t border-[var(--ink-faint)] relative z-20">
                    <div className="w-full grid grid-cols-3 gap-1.5">
                        <button
                            onClick={() => setCurrentView('settings')}
                            className={`terminal-button ${currentView === 'settings' ? 'primary' : ''}`}
                        >
                            <Settings size={13} />
                            SET
                        </button>
                        <button
                            onClick={() => setCurrentView('tracker')}
                            className={`terminal-button ${currentView === 'tracker' ? 'primary' : ''}`}
                        >
                            <TrendingUp size={13} />
                            RANK
                        </button>
                        <button
                            onClick={() => setCurrentView('serp')}
                            className={`terminal-button ${currentView === 'serp' ? 'primary' : ''}`}
                        >
                            <Search size={13} />
                            SERP
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default App;
