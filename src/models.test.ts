import { describe, expect, it } from 'vitest';
import {
    GEMINI_MODELS,
    OPENROUTER_MODELS,
    ALL_MODELS,
    DEFAULT_MODEL_ID,
    DEFAULT_OPENROUTER_MODEL_ID,
    getProviderForModel,
} from './models';

describe('models config', () => {
    it('exports non-empty Gemini model list', () => {
        expect(GEMINI_MODELS.length).toBeGreaterThan(0);
    });

    it('exports non-empty OpenRouter model list', () => {
        expect(OPENROUTER_MODELS.length).toBeGreaterThan(0);
    });

    it('ALL_MODELS combines both lists', () => {
        expect(ALL_MODELS.length).toBe(GEMINI_MODELS.length + OPENROUTER_MODELS.length);
    });

    it('every model has required fields including provider', () => {
        for (const m of ALL_MODELS) {
            expect(m.id).toBeTruthy();
            expect(m.label).toBeTruthy();
            expect(m.description).toBeTruthy();
            expect(['stable', 'preview']).toContain(m.status);
            expect(['gemini', 'openrouter']).toContain(m.provider);
        }
    });

    it('Gemini models all have provider=gemini', () => {
        for (const m of GEMINI_MODELS) {
            expect(m.provider).toBe('gemini');
        }
    });

    it('OpenRouter models all have provider=openrouter', () => {
        for (const m of OPENROUTER_MODELS) {
            expect(m.provider).toBe('openrouter');
        }
    });

    it('has no duplicate model IDs across all models', () => {
        const ids = ALL_MODELS.map((m) => m.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('DEFAULT_MODEL_ID exists in the Gemini model list', () => {
        const ids = GEMINI_MODELS.map((m) => m.id);
        expect(ids).toContain(DEFAULT_MODEL_ID);
    });

    it('DEFAULT_MODEL_ID is gemini-3.1-flash-lite-preview', () => {
        expect(DEFAULT_MODEL_ID).toBe('gemini-3.1-flash-lite-preview');
    });

    it('DEFAULT_OPENROUTER_MODEL_ID is perplexity/sonar', () => {
        expect(DEFAULT_OPENROUTER_MODEL_ID).toBe('perplexity/sonar');
    });

    it('includes perplexity/sonar in OpenRouter models', () => {
        const ids = OPENROUTER_MODELS.map((m) => m.id);
        expect(ids).toContain('perplexity/sonar');
    });
});

describe('getProviderForModel', () => {
    it('returns gemini for known Gemini model', () => {
        expect(getProviderForModel('gemini-2.5-flash')).toBe('gemini');
    });

    it('returns openrouter for known OpenRouter model', () => {
        expect(getProviderForModel('perplexity/sonar')).toBe('openrouter');
    });

    it('returns openrouter for unknown ID with slash', () => {
        expect(getProviderForModel('anthropic/claude-3-haiku')).toBe('openrouter');
    });

    it('returns gemini for unknown ID without slash', () => {
        expect(getProviderForModel('gemini-exp-custom')).toBe('gemini');
    });
});
