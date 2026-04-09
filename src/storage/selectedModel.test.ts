import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DEFAULT_MODEL_ID } from '../models';

const store: Record<string, unknown> = {};
const chromeStorageMock = {
    get: vi.fn((keys: string | string[]) => {
        if (typeof keys === 'string') {
            return Promise.resolve({ [keys]: store[keys] });
        }
        const result: Record<string, unknown> = {};
        for (const k of keys) result[k] = store[k];
        return Promise.resolve(result);
    }),
    set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(store, items);
        return Promise.resolve();
    }),
};

vi.stubGlobal('chrome', {
    storage: { local: chromeStorageMock },
});

import { storage } from './index';

describe('selected model storage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        for (const key of Object.keys(store)) delete store[key];
    });

    it('returns DEFAULT_MODEL_ID when no model is stored', async () => {
        const model = await storage.getSelectedModel();
        expect(model).toBe(DEFAULT_MODEL_ID);
    });

    it('returns stored model ID after setSelectedModel', async () => {
        await storage.setSelectedModel('perplexity/sonar');
        const model = await storage.getSelectedModel();
        expect(model).toBe('perplexity/sonar');
    });

    it('persists model to chrome.storage.local with selected_model key', async () => {
        await storage.setSelectedModel('gemini-2.5-flash');
        expect(chromeStorageMock.set).toHaveBeenCalledWith({
            selected_model: 'gemini-2.5-flash',
        });
    });

    it('falls back to legacy gemini_model key for migration', async () => {
        store['gemini_model'] = 'gemini-2.5-pro';
        const model = await storage.getSelectedModel();
        expect(model).toBe('gemini-2.5-pro');
    });

    it('writes back to selected_model key on migration', async () => {
        store['gemini_model'] = 'gemini-2.5-pro';
        await storage.getSelectedModel();
        expect(chromeStorageMock.set).toHaveBeenCalledWith({
            selected_model: 'gemini-2.5-pro',
        });
    });
});

describe('OpenRouter API key storage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        for (const key of Object.keys(store)) delete store[key];
    });

    it('returns empty string when no key stored', async () => {
        const key = await storage.getOpenRouterApiKey();
        expect(key).toBe('');
    });

    it('returns stored key after setOpenRouterApiKey', async () => {
        await storage.setOpenRouterApiKey('sk-or-v1-abc123');
        const key = await storage.getOpenRouterApiKey();
        expect(key).toBe('sk-or-v1-abc123');
    });

    it('persists key to chrome.storage.local', async () => {
        await storage.setOpenRouterApiKey('sk-or-v1-test');
        expect(chromeStorageMock.set).toHaveBeenCalledWith({
            openrouter_api_key: 'sk-or-v1-test',
        });
    });
});
