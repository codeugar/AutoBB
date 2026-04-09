// @vitest-environment jsdom
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SelectionAssistant from './SelectionAssistant';
import { EXPLAIN_SELECTION_MESSAGE_TYPE } from '../shared/explainSelection';
import { storage } from '../storage';
import { explainSelection } from './explain';

vi.mock('../storage', () => ({
    storage: {
        getSelectedModel: vi.fn(),
    },
}));

vi.mock('./explain', () => ({
    explainSelection: vi.fn(),
}));

describe('SelectionAssistant context-menu trigger', () => {
    const messageListeners: Array<(message: unknown) => void> = [];

    beforeEach(() => {
        messageListeners.length = 0;
        vi.mocked(storage.getSelectedModel).mockResolvedValue('gemini-3.1-flash-lite-preview');

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
        vi.mocked(explainSelection).mockImplementation(
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
        expect(await screen.findByText('Asking AI...')).toBeTruthy();

        await waitFor(() => {
            expect(explainSelection).toHaveBeenCalledWith('market wedge', 'gemini-3.1-flash-lite-preview');
        });

        await act(async () => {
            resolveExplain('Explained result');
        });

        expect(await screen.findByText('Explained result')).toBeTruthy();
    });
});
