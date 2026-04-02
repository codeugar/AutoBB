import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DEFAULT_MODEL_ID } from '../models';

const store: Record<string, unknown> = {};
const chromeStorageMock = {
    get: vi.fn((key: string) => Promise.resolve({ [key]: store[key] })),
    set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(store, items);
        return Promise.resolve();
    }),
};

vi.stubGlobal('chrome', {
    storage: { local: chromeStorageMock },
});

import { storage } from './index';

describe('gemini model storage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        for (const key of Object.keys(store)) delete store[key];
    });

    it('returns DEFAULT_MODEL_ID when no model is stored', async () => {
        const model = await storage.getGeminiModel();
        expect(model).toBe(DEFAULT_MODEL_ID);
    });

    it('returns stored model ID after setGeminiModel', async () => {
        await storage.setGeminiModel('gemini-2.5-pro');
        const model = await storage.getGeminiModel();
        expect(model).toBe('gemini-2.5-pro');
    });

    it('persists model to chrome.storage.local', async () => {
        await storage.setGeminiModel('gemini-2.5-flash');
        expect(chromeStorageMock.set).toHaveBeenCalledWith({
            gemini_model: 'gemini-2.5-flash',
        });
    });
});
