import { useState, useEffect } from 'react';
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
                relative w-11 h-6 rounded-full transition-all duration-500 flex-shrink-0
                ${enabled ? 'bg-violet-600 shadow-[0_0_15px_-3px_rgba(124,58,237,0.5)]' : 'bg-zinc-800'}
            `}
        >
            <div className={`
                absolute top-1 w-4 h-4 rounded-full bg-white shadow-md
                transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                ${enabled ? 'translate-x-[20px]' : 'translate-x-1'}
            `} />
        </button>
    );
};

const ControlCard = ({ icon: Icon, label, enabled, onToggle }: { icon: any; label: string; enabled: boolean; onToggle: () => void }) => (
    <div
        onClick={onToggle}
        className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-zinc-800/80 hover:border-white/10 transition-all cursor-pointer group"
    >
        <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${enabled ? 'bg-violet-500/10 text-violet-400 scale-110 shadow-lg shadow-violet-500/5' : 'bg-zinc-950 text-zinc-600'}`}>
                <Icon size={18} />
            </div>
            <div className="flex flex-col">
                <span className={`text-[13px] font-black tracking-tight ${enabled ? 'text-zinc-100' : 'text-zinc-500'}`}>
                    {label}
                </span>
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.1em] mt-0.5">
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

    useEffect(() => {
        loadData();
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

    return (
        <div className="w-[400px] max-w-[400px] h-[600px] flex flex-col bg-zinc-950 text-zinc-100 font-sans overflow-hidden relative border border-white/5 select-none box-border">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-[-50px] w-64 h-64 bg-violet-600/10 blur-[100px] pointer-events-none -z-10 animate-glow" />
            <div className="absolute bottom-[-50px] left-[-20px] w-64 h-64 bg-fuchsia-600/5 blur-[100px] pointer-events-none -z-10 animate-glow" style={{ animationDelay: '-2s' }} />

            {/* Header Section - Dashboard Only */}
            {currentView === 'list' && (
                <header className="flex-shrink-0 px-7 pt-10 pb-6 flex flex-col gap-8 relative z-20 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-5">
                            <div className="p-3.5 bg-gradient-to-br from-violet-500 to-violet-600 rounded-[22px] shadow-2xl shadow-violet-600/30 ring-1 ring-white/10">
                                <Zap size={22} className="text-white fill-white/20" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-white leading-none">
                                    AutoLink
                                </h1>
                                <div className="flex items-center gap-3 mt-2.5">
                                    <span className="bg-violet-600/10 text-violet-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-violet-500/20 uppercase tracking-[0.1em]">Version 1.2.4 PRO</span>
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
            <main className={`flex-1 overflow-hidden relative z-10 flex flex-col ${currentView === 'list' ? 'px-7 pb-6' : 'p-0'}`}>
                <div className={`flex-1 bg-zinc-900/60 flex flex-col relative ${currentView === 'list' ? 'border border-white/5 rounded-[40px] shadow-2xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]' : ''}`}>
                    {currentView === 'list' ? (
                        <ProfileList
                            profiles={profiles}
                            onEdit={(p) => { setEditingProfile(p); setCurrentView('editor'); }}
                            onCreate={() => { setEditingProfile(null); setCurrentView('editor'); }}
                        />
                    ) : (
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
                    )}
                </div>
            </main>

            {/* Premium Footer */}
            <footer className="px-10 py-5 flex items-center justify-between bg-zinc-950/40 backdrop-blur-xl border-t border-white/5 relative z-20">
                <div className="flex gap-8">
                    <button className="text-zinc-600 hover:text-white flex items-center gap-2.5 transition-all group">
                        <Settings size={18} className="group-hover:rotate-45 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-700 group-hover:text-zinc-400">Settings</span>
                    </button>
                    <button className="text-zinc-600 hover:text-white flex items-center gap-2.5 transition-all group">
                        <LifeBuoy size={18} />
                        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-700 group-hover:text-zinc-400">Support</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default App;
