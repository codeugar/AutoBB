import { describe, expect, it, vi, beforeEach } from 'vitest';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import { explainText } from './openrouter';

describe('openrouter explainText', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('calls OpenRouter chat completions endpoint', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                choices: [{ message: { content: 'explanation' } }],
            }),
        });
        await explainText('test', 'sk-or-key', 'System prompt', 'perplexity/sonar');

        expect(fetchMock).toHaveBeenCalledWith(
            'https://openrouter.ai/api/v1/chat/completions',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer sk-or-key',
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://autobb.dev',
                    'X-Title': 'AutoBB',
                }),
            }),
        );
    });

    it('sends model and messages in OpenAI chat format', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                choices: [{ message: { content: 'result' } }],
            }),
        });
        await explainText('hello', 'key', 'You are helpful', 'perplexity/sonar-pro');

        const body = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(body.model).toBe('perplexity/sonar-pro');
        expect(body.messages).toEqual([
            { role: 'system', content: 'You are helpful' },
            { role: 'user', content: 'hello' },
        ]);
        expect(body.max_tokens).toBe(512);
        expect(body.temperature).toBe(0.3);
    });

    it('strips trailing quote from Gemini-style prompt', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                choices: [{ message: { content: 'ok' } }],
            }),
        });
        await explainText('word', 'key', 'Explain this: "', 'perplexity/sonar');

        const body = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(body.messages[0].content).toBe('Explain this:');
    });

    it('returns trimmed content from response', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
                choices: [{ message: { content: '  hello world  ' } }],
            }),
        });
        const result = await explainText('x', 'k', 'p', 'perplexity/sonar');
        expect(result).toBe('hello world');
    });

    it('throws on HTTP error with API error message', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: { message: 'Invalid API key' } }),
        });
        await expect(explainText('x', 'k', 'p', 'perplexity/sonar'))
            .rejects.toThrow('Invalid API key');
    });

    it('throws on HTTP error with fallback message', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: () => Promise.reject(new Error('bad json')),
        });
        await expect(explainText('x', 'k', 'p', 'perplexity/sonar'))
            .rejects.toThrow('Request failed with status 500');
    });

    it('throws when no content in response', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ choices: [] }),
        });
        await expect(explainText('x', 'k', 'p', 'perplexity/sonar'))
            .rejects.toThrow('No explanation returned from OpenRouter.');
    });
});
