// @vitest-environment jsdom
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SelectionAssistant from './SelectionAssistant';
import { EXPLAIN_SELECTION_MESSAGE_TYPE } from '../shared/explainSelection';
import { storage } from '../storage';
import { explainText } from './gemini';

vi.mock('../storage', () => ({
    storage: {
        getGeminiApiKey: vi.fn(),
        getGeminiPrompt: vi.fn(),
    },
}));

vi.mock('./gemini', () => ({
    explainText: vi.fn(),
}));

describe('SelectionAssistant context-menu trigger', () => {
    const messageListeners: Array<(message: unknown) => void> = [];

    beforeEach(() => {
        messageListeners.length = 0;
        vi.mocked(storage.getGeminiApiKey).mockResolvedValue('demo-key');
        vi.mocked(storage.getGeminiPrompt).mockResolvedValue('Prompt: ');

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
            },
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('opens the explainer panel and asks Gemini when triggered from the context menu', async () => {
        let resolveExplain = (_value: string) => {};
        vi.mocked(explainText).mockImplementation(
            () =>
                new Promise<string>((resolve) => {
                    resolveExplain = resolve;
                }),
        );

        render(<SelectionAssistant />);

        expect(messageListeners).toHaveLength(1);

        await act(async () => {
            messageListeners[0]({
                type: EXPLAIN_SELECTION_MESSAGE_TYPE,
                text: 'market wedge',
            });
        });

        expect(await screen.findByText('"market wedge"')).toBeTruthy();
        expect(await screen.findByText('Asking Gemini...')).toBeTruthy();

        await waitFor(() => {
            expect(explainText).toHaveBeenCalledWith('market wedge', 'demo-key', 'Prompt: ');
        });

        await act(async () => {
            resolveExplain('Explained result');
        });

        expect(await screen.findByText('Explained result')).toBeTruthy();
    });
});
