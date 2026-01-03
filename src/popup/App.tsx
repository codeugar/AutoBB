import { useState, useEffect, useRef } from 'react';
import type { Profile } from '../types';
import { storage } from '../storage';
import ProfileList from './components/ProfileList';
import ProfileEditor from './components/ProfileEditor';
import { Zap, MonitorOff, Globe, Settings, LifeBuoy } from 'lucide-react';

// Design-driven Toggle Switch
const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`
                relative w-11 h-6 rounded-full transition-all duration-500 flex-shrink-0 border border-white/40
                ${enabled ? 'accent-gradient shadow-[0_0_18px_rgba(16,185,129,0.35)]' : 'bg-white/40'}
            `}
        >
            <div className={`
                absolute top-1 w-4 h-4 rounded-full bg-white shadow-[0_2px_8px_rgba(6,78,59,0.25)]
                transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                ${enabled ? 'translate-x-[20px]' : 'translate-x-1'}
            `} />
        </button>
    );
};

const ControlCard = ({ icon: Icon, label, enabled, onToggle }: { icon: any; label: string; enabled: boolean; onToggle: () => void }) => (
    <div
        onClick={onToggle}
        className="flex items-center justify-between p-4 glass-card hover:bg-white/55 hover:border-white/60 transition-all cursor-pointer group"
    >
        <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl transition-all duration-300 glass-card ${enabled ? 'text-accent scale-110' : 'text-muted'}`}>
                <Icon size={18} />
            </div>
            <div className="flex flex-col">
                <span className={`text-[13px] font-black tracking-tight ${enabled ? 'text-heading' : 'text-muted'}`}>
                    {label}
                </span>
                <span className="text-[10px] text-muted font-bold uppercase tracking-[0.1em] mt-0.5">
                    {enabled ? 'Active' : 'Disabled'}
                </span>
            </div>
        </div>
        <ToggleSwitch enabled={enabled} onToggle={onToggle} />
    </div>
);

const App = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentView, setCurrentView] = useState<'list' | 'editor'>('list');
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

    const [isGlobalEnabled, setIsGlobalEnabled] = useState(true);
    const [isCurrentSiteEnabled, setIsCurrentSiteEnabled] = useState(true);
    const [currentDomain, setCurrentDomain] = useState('');
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current !== null) {
                window.clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    const loadData = async () => {
        const [profilesData, globalDisabled] = await Promise.all([
            storage.getProfiles(),
            storage.getGlobalDisabled()
        ]);

        setProfiles(profilesData);
        setIsGlobalEnabled(!globalDisabled);

        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.url) {
            try {
                const domain = new URL(tabs[0].url).hostname;
                setCurrentDomain(domain);
                const siteDisabled = await storage.getSiteDisabled(domain);
                setIsCurrentSiteEnabled(!siteDisabled);
            } catch (e) { }
        }
    };

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
            onScroll={handleScroll}
            className={`w-[400px] max-w-[400px] h-[600px] font-sans text-primary overflow-y-auto overflow-x-hidden relative select-none box-border custom-scrollbar glass-panel ${isScrolling ? 'is-scrolling' : ''}`}
        >
            <div className="min-h-full flex flex-col relative z-10">
                {/* Header Section - Dashboard Only */}
                {currentView === 'list' && (
                    <header className="flex-shrink-0 px-7 pt-10 pb-6 flex flex-col gap-8 relative z-20 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-5">
                                <div className="p-3.5 accent-gradient rounded-[22px] shadow-[0_10px_24px_rgba(16,185,129,0.3)] ring-1 ring-white/40">
                                    <Zap size={22} className="text-white fill-white/30" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black tracking-tight text-heading leading-none">
                                        AutoBB
                                    </h1>
                                    <div className="flex items-center gap-3 mt-2.5">
                                        <span className="glass-card text-accent text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.1em]">Version 1.2.4 PRO</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Controls - Vertical Stack for 400px Width */}
                        <div className="flex flex-col gap-3.5">
                            <ControlCard
                                icon={MonitorOff}
                                label="Overlay Interaction"
                                enabled={isGlobalEnabled}
                                onToggle={toggleGlobal}
                            />
                            <ControlCard
                                icon={Globe}
                                label="Active Domain Restriction"
                                enabled={isCurrentSiteEnabled}
                                onToggle={toggleSite}
                            />
                        </div>
                    </header>
                )}

                {/* Dynamic Content Frame */}
                <main className={`flex-1 relative z-10 flex flex-col ${currentView === 'list' ? 'pb-6' : 'p-0'}`}>
                    {currentView === 'list' ? (
                        <ProfileList
                            profiles={profiles}
                            onEdit={(p) => { setEditingProfile(p); setCurrentView('editor'); }}
                            onCreate={() => { setEditingProfile(null); setCurrentView('editor'); }}
                        />
                    ) : (
                        <div className="glass-card flex flex-col relative rounded-[32px]">
                            <ProfileEditor
                                profile={editingProfile}
                                onSave={async (p) => {
                                    await storage.saveProfile(p);
                                    const updated = await storage.getProfiles();
                                    setProfiles(updated);
                                    setCurrentView('list');
                                }}
                                onCancel={() => setCurrentView('list')}
                                onDelete={async (id) => {
                                    await storage.deleteProfile(id);
                                    const updated = await storage.getProfiles();
                                    setProfiles(updated);
                                    setCurrentView('list');
                                }}
                            />
                        </div>
                    )}
                </main>

                {/* Premium Footer */}
                <footer className="px-10 py-5 flex items-center justify-between bg-white/45 border-t border-white/50 relative z-20">
                    <div className="flex gap-8">
                        <button className="text-muted hover:text-heading flex items-center gap-2.5 transition-all group">
                            <Settings size={18} className="group-hover:rotate-45 transition-transform" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-muted group-hover:text-heading">Settings</span>
                        </button>
                        <button className="text-muted hover:text-heading flex items-center gap-2.5 transition-all group">
                            <LifeBuoy size={18} />
                            <span className="text-[11px] font-black uppercase tracking-widest text-muted group-hover:text-heading">Support</span>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default App;
