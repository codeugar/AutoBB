import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../storage', () => ({
    storage: {
        getGeminiApiKey: vi.fn(),
        getGeminiPrompt: vi.fn(),
        getOpenRouterApiKey: vi.fn(),
        getSelectedModel: vi.fn(),
    },
}));

vi.mock('./gemini', () => ({
    explainText: vi.fn(),
}));

vi.mock('./openrouter', () => ({
    explainText: vi.fn(),
}));

vi.mock('../models', () => ({
    getProviderForModel: vi.fn(),
}));

import { explainSelection } from './explain';
import { storage } from '../storage';
import { explainText as geminiExplain } from './gemini';
import { explainText as openrouterExplain } from './openrouter';
import { getProviderForModel } from '../models';

describe('explainSelection dispatcher', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(storage.getGeminiPrompt).mockResolvedValue('Prompt: "');
    });

    it('routes to Gemini when provider is gemini', async () => {
        vi.mocked(getProviderForModel).mockReturnValue('gemini');
        vi.mocked(storage.getGeminiApiKey).mockResolvedValue('gkey');
        vi.mocked(geminiExplain).mockResolvedValue('gemini result');

        const result = await explainSelection('test', 'gemini-2.5-flash');
        expect(geminiExplain).toHaveBeenCalledWith('test', 'gkey', 'Prompt: "', 'gemini-2.5-flash');
        expect(result).toBe('gemini result');
    });

    it('routes to OpenRouter when provider is openrouter', async () => {
        vi.mocked(getProviderForModel).mockReturnValue('openrouter');
        vi.mocked(storage.getOpenRouterApiKey).mockResolvedValue('orkey');
        vi.mocked(openrouterExplain).mockResolvedValue('openrouter result');

        const result = await explainSelection('test', 'perplexity/sonar');
        expect(openrouterExplain).toHaveBeenCalledWith('test', 'orkey', 'Prompt: "', 'perplexity/sonar');
        expect(result).toBe('openrouter result');
    });

    it('throws when Gemini API key is missing', async () => {
        vi.mocked(getProviderForModel).mockReturnValue('gemini');
        vi.mocked(storage.getGeminiApiKey).mockResolvedValue('');

        await expect(explainSelection('test', 'gemini-2.5-flash'))
            .rejects.toThrow('Please configure your Gemini API key in Settings.');
    });

    it('throws when OpenRouter API key is missing', async () => {
        vi.mocked(getProviderForModel).mockReturnValue('openrouter');
        vi.mocked(storage.getOpenRouterApiKey).mockResolvedValue('');

        await expect(explainSelection('test', 'perplexity/sonar'))
            .rejects.toThrow('Please configure your OpenRouter API key in Settings.');
    });

    it('propagates errors from Gemini API module', async () => {
        vi.mocked(getProviderForModel).mockReturnValue('gemini');
        vi.mocked(storage.getGeminiApiKey).mockResolvedValue('gkey');
        vi.mocked(geminiExplain).mockRejectedValue(new Error('Rate limit exceeded'));

        await expect(explainSelection('test', 'gemini-2.5-flash'))
            .rejects.toThrow('Rate limit exceeded');
    });

    it('propagates errors from OpenRouter API module', async () => {
        vi.mocked(getProviderForModel).mockReturnValue('openrouter');
        vi.mocked(storage.getOpenRouterApiKey).mockResolvedValue('orkey');
        vi.mocked(openrouterExplain).mockRejectedValue(new Error('Invalid API key'));

        await expect(explainSelection('test', 'perplexity/sonar'))
            .rejects.toThrow('Invalid API key');
    });

    it('accepts optional prompt override', async () => {
        vi.mocked(getProviderForModel).mockReturnValue('gemini');
        vi.mocked(storage.getGeminiApiKey).mockResolvedValue('gkey');
        vi.mocked(geminiExplain).mockResolvedValue('ok');

        await explainSelection('test', 'gemini-2.5-flash', 'Custom prompt');
        expect(geminiExplain).toHaveBeenCalledWith('test', 'gkey', 'Custom prompt', 'gemini-2.5-flash');
        expect(storage.getGeminiPrompt).not.toHaveBeenCalled();
    });
});
