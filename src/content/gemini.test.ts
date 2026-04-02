import { describe, expect, it, vi, beforeEach } from 'vitest';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import { explainText } from './gemini';

describe('explainText', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('constructs URL with the given model ID', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'explanation' }] } }] }),
        });
        await explainText('test', 'key123', 'prompt: "', 'gemini-2.5-flash');
        expect(fetchMock).toHaveBeenCalledWith(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=key123',
            expect.any(Object),
        );
    });

    it('uses a different model when specified', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'result' }] } }] }),
        });
        await explainText('word', 'key', 'prompt: "', 'gemini-3.1-pro-preview');
        const calledUrl = fetchMock.mock.calls[0][0] as string;
        expect(calledUrl).toContain('/models/gemini-3.1-pro-preview:generateContent');
    });

    it('returns trimmed explanation text', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: '  hello world  ' }] } }] }),
        });
        const result = await explainText('x', 'k', 'p"', 'gemini-2.5-flash');
        expect(result).toBe('hello world');
    });

    it('throws on HTTP error with API error message', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false, status: 429,
            json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } }),
        });
        await expect(explainText('x', 'k', 'p"', 'gemini-2.5-flash')).rejects.toThrow('Rate limit exceeded');
    });

    it('throws on HTTP error with fallback message', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false, status: 500,
            json: () => Promise.reject(new Error('bad json')),
        });
        await expect(explainText('x', 'k', 'p"', 'gemini-2.5-flash')).rejects.toThrow('Request failed with status 500');
    });

    it('throws when no explanation is returned', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ candidates: [] }),
        });
        await expect(explainText('x', 'k', 'p"', 'gemini-2.5-flash')).rejects.toThrow('No explanation returned from Gemini.');
    });

    it('produces invalid URL for empty modelId (caller responsibility)', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false, status: 404,
            json: () => Promise.resolve({ error: { message: 'Model not found' } }),
        });
        await expect(explainText('x', 'k', 'p"', '')).rejects.toThrow('Model not found');
    });
});
