import { describe, expect, it } from 'vitest';
import { GEMINI_MODELS, DEFAULT_MODEL_ID } from './models';

describe('models config', () => {
    it('exports a non-empty model list', () => {
        expect(GEMINI_MODELS.length).toBeGreaterThan(0);
    });

    it('every model has required fields', () => {
        for (const m of GEMINI_MODELS) {
            expect(m.id).toBeTruthy();
            expect(m.label).toBeTruthy();
            expect(m.description).toBeTruthy();
            expect(['stable', 'preview']).toContain(m.status);
        }
    });

    it('has no duplicate model IDs', () => {
        const ids = GEMINI_MODELS.map((m) => m.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('DEFAULT_MODEL_ID exists in the model list', () => {
        const ids = GEMINI_MODELS.map((m) => m.id);
        expect(ids).toContain(DEFAULT_MODEL_ID);
    });

    it('DEFAULT_MODEL_ID matches the previously hardcoded model', () => {
        expect(DEFAULT_MODEL_ID).toBe('gemini-3.1-flash-lite-preview');
    });
});
