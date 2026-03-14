import type { Profile, TrackedSite, TrafficCache } from '../types';

const KEYS = {
    PROFILES: 'profiles',
    ACTIVE_PROFILE: 'activeProfileId',
    MAPPINGS: 'field_mappings',
    GLOBAL_DISABLED: 'global_disabled',
    DISABLED_SITES: 'disabled_sites',
    GEMINI_API_KEY: 'gemini_api_key',
    SIMILARWEB_API_KEY: 'similarweb_api_key',
    TRACKED_SITES: 'tracked_sites',
    TRAFFIC_CACHE: 'traffic_cache',
};

export const storage = {
    async getProfiles(): Promise<Profile[]> {
        const result = await chrome.storage.local.get(KEYS.PROFILES);
        return (result[KEYS.PROFILES] as Profile[]) || [];
    },

    async saveProfile(profile: Profile): Promise<void> {
        const profiles = await this.getProfiles();
        const index = profiles.findIndex((p) => p.id === profile.id);
        if (index >= 0) {
            profiles[index] = profile;
        } else {
            profiles.push(profile);
        }
        await chrome.storage.local.set({ [KEYS.PROFILES]: profiles });
    },

    async deleteProfile(id: string): Promise<void> {
        const profiles = await this.getProfiles();
        const newProfiles = profiles.filter((p) => p.id !== id);
        await chrome.storage.local.set({ [KEYS.PROFILES]: newProfiles });
    },

    async getActiveProfileId(): Promise<string | null> {
        const result = await chrome.storage.local.get(KEYS.ACTIVE_PROFILE);
        return (result[KEYS.ACTIVE_PROFILE] as string) || null;
    },

    async setActiveProfileId(id: string): Promise<void> {
        await chrome.storage.local.set({ [KEYS.ACTIVE_PROFILE]: id });
    },

    async getMappings(domain: string): Promise<Record<string, string>> {
        const result = await chrome.storage.local.get(KEYS.MAPPINGS);
        const allMappings = (result[KEYS.MAPPINGS] as Record<string, Record<string, string>>) || {};
        return allMappings[domain] || {};
    },

    async saveMapping(domain: string, selector: string, fieldKey: string): Promise<void> {
        const result = await chrome.storage.local.get(KEYS.MAPPINGS);
        const allMappings = (result[KEYS.MAPPINGS] as Record<string, Record<string, string>>) || {};
        if (!allMappings[domain]) {
            allMappings[domain] = {};
        }
        allMappings[domain][selector] = fieldKey;
        await chrome.storage.local.set({ [KEYS.MAPPINGS]: allMappings });
    },

    // Disable Logic
    async getGlobalDisabled(): Promise<boolean> {
        const result = await chrome.storage.local.get(KEYS.GLOBAL_DISABLED);
        return !!result[KEYS.GLOBAL_DISABLED];
    },

    async setGlobalDisabled(disabled: boolean): Promise<void> {
        await chrome.storage.local.set({ [KEYS.GLOBAL_DISABLED]: disabled });
    },

    async getSiteDisabled(domain: string): Promise<boolean> {
        const result = await chrome.storage.local.get(KEYS.DISABLED_SITES);
        const sites = (result[KEYS.DISABLED_SITES] as string[]) || [];
        return sites.includes(domain);
    },

    async setSiteDisabled(domain: string, disabled: boolean): Promise<void> {
        const result = await chrome.storage.local.get(KEYS.DISABLED_SITES);
        let sites = (result[KEYS.DISABLED_SITES] as string[]) || [];
        if (disabled) {
            if (!sites.includes(domain)) sites.push(domain);
        } else {
            sites = sites.filter(d => d !== domain);
        }
        await chrome.storage.local.set({ [KEYS.DISABLED_SITES]: sites });
    },

    async getGeminiApiKey(): Promise<string> {
        const result = await chrome.storage.local.get(KEYS.GEMINI_API_KEY);
        return (result[KEYS.GEMINI_API_KEY] as string) || '';
    },

    async setGeminiApiKey(key: string): Promise<void> {
        await chrome.storage.local.set({ [KEYS.GEMINI_API_KEY]: key });
    },

    async getSimilarwebApiKey(): Promise<string> {
        const result = await chrome.storage.local.get(KEYS.SIMILARWEB_API_KEY);
        return (result[KEYS.SIMILARWEB_API_KEY] as string) || '';
    },

    async setSimilarwebApiKey(key: string): Promise<void> {
        await chrome.storage.local.set({ [KEYS.SIMILARWEB_API_KEY]: key });
    },

    async getTrackedSites(): Promise<TrackedSite[]> {
        const result = await chrome.storage.local.get(KEYS.TRACKED_SITES);
        return (result[KEYS.TRACKED_SITES] as TrackedSite[]) || [];
    },

    async addTrackedSite(domain: string): Promise<void> {
        const sites = await this.getTrackedSites();
        if (!sites.find((s) => s.domain === domain)) {
            sites.push({ domain, addedAt: Date.now() });
            await chrome.storage.local.set({ [KEYS.TRACKED_SITES]: sites });
        }
    },

    async removeTrackedSite(domain: string): Promise<void> {
        const sites = await this.getTrackedSites();
        await chrome.storage.local.set({ [KEYS.TRACKED_SITES]: sites.filter((s) => s.domain !== domain) });
    },

    async getTrafficCache(): Promise<TrafficCache[]> {
        const result = await chrome.storage.local.get(KEYS.TRAFFIC_CACHE);
        return (result[KEYS.TRAFFIC_CACHE] as TrafficCache[]) || [];
    },

    async setTrafficCache(cache: TrafficCache[]): Promise<void> {
        await chrome.storage.local.set({ [KEYS.TRAFFIC_CACHE]: cache });
    }
};
