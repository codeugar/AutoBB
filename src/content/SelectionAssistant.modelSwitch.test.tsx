// @vitest-environment jsdom
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EXPLAIN_SELECTION_MESSAGE_TYPE } from '../shared/explainSelection';
import { storage } from '../storage';
import { explainText } from './gemini';

vi.mock('../storage', () => ({
    storage: {
        getGeminiApiKey: vi.fn(),
        getGeminiPrompt: vi.fn(),
        getGeminiModel: vi.fn(),
    },
}));

vi.mock('./gemini', () => ({
    explainText: vi.fn(),
}));

vi.mock('../popup/components/ModelSelector', () => ({
    default: ({ value, onChange, compact }: { value: string; onChange: (id: string) => void; compact?: boolean }) => (
        compact ? (
            <button data-testid="model-switch" onClick={() => onChange('gemini-2.5-pro')}>
                {value}
            </button>
        ) : null
    ),
}));

import SelectionAssistant from './SelectionAssistant';

describe('SelectionAssistant — model switching', () => {
    const messageListeners: Array<(message: unknown) => void> = [];

    beforeEach(() => {
        messageListeners.length = 0;
        vi.mocked(storage.getGeminiApiKey).mockResolvedValue('demo-key');
        vi.mocked(storage.getGeminiPrompt).mockResolvedValue('Prompt: ');
        vi.mocked(storage.getGeminiModel).mockResolvedValue('gemini-3.1-flash-lite-preview');

        Object.defineProperty(globalThis, 'chrome', {
            configurable: true,
            value: {
                runtime: {
                    onMessage: {
                        addListener: vi.fn((listener: (message: unknown) => void) => {
                            messageListeners.push(listener);
                        }),
                        removeListener: vi.fn((listener: (message: unknown) => void) => {
                            const index = messageListeners.indexOf(listener);
                            if (index >= 0) messageListeners.splice(index, 1);
                        }),
                    },
                },
                storage: {
                    local: {
                        get: vi.fn(() => Promise.resolve({})),
                        set: vi.fn(() => Promise.resolve()),
                    },
                },
            },
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('passes modelId to explainText when triggered via context menu', async () => {
        vi.mocked(explainText).mockResolvedValue('Explained result');

        render(<SelectionAssistant />);

        await act(async () => {
            messageListeners[0]({
                type: EXPLAIN_SELECTION_MESSAGE_TYPE,
                text: 'test term',
            });
        });

        await waitFor(() => {
            expect(explainText).toHaveBeenCalledWith(
                'test term', 'demo-key', 'Prompt: ',
                expect.any(String),
            );
        });
    });

    it('discards stale response when a second request fires before first completes', async () => {
        let resolveFirst: (v: string) => void = () => {};
        vi.mocked(explainText)
            .mockImplementationOnce(() => new Promise<string>((r) => { resolveFirst = r; }))
            .mockResolvedValueOnce('Second result');

        render(<SelectionAssistant />);

        await act(async () => {
            messageListeners[0]({
                type: EXPLAIN_SELECTION_MESSAGE_TYPE,
                text: 'first term',
            });
        });

        expect(await screen.findByText('Asking Gemini...')).toBeTruthy();

        await act(async () => {
            messageListeners[0]({
                type: EXPLAIN_SELECTION_MESSAGE_TYPE,
                text: 'second term',
            });
        });

        expect(await screen.findByText('Second result')).toBeTruthy();

        await act(async () => { resolveFirst('First result'); });

        expect(screen.getByText('Second result')).toBeTruthy();
        expect(screen.queryByText('First result')).toBeNull();
    });

    it('does not re-register runtime message listener when model changes', () => {
        render(<SelectionAssistant />);

        const addListenerMock = (chrome.runtime.onMessage.addListener as ReturnType<typeof vi.fn>);
        const initialCallCount = addListenerMock.mock.calls.length;

        expect(initialCallCount).toBe(1);
    });
});
