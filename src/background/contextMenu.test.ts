import { describe, expect, it, vi } from 'vitest';
import {
    buildSelectionContextMenu,
    ensureSelectionContextMenu,
    handleSelectionContextMenuClick,
    registerSelectionContextMenu,
} from './contextMenu';
import {
    EXPLAIN_SELECTION_CONTEXT_MENU_ID,
    EXPLAIN_SELECTION_MESSAGE_TYPE,
} from '../shared/explainSelection';

describe('selection context menu', () => {
    it('builds a selection-only menu item', () => {
        expect(buildSelectionContextMenu()).toEqual({
            id: EXPLAIN_SELECTION_CONTEXT_MENU_ID,
            title: 'Ask AI about "%s"',
            contexts: ['selection'],
        });
    });

    it('recreates the context menu after clearing existing items', () => {
        const removeAll = vi.fn((callback?: () => void) => callback?.());
        const create = vi.fn();

        ensureSelectionContextMenu({
            contextMenus: { removeAll, create },
        });

        expect(removeAll).toHaveBeenCalledTimes(1);
        expect(create).toHaveBeenCalledWith(buildSelectionContextMenu());
    });

    it('sends an explain-selection message for a valid click', () => {
        const sendMessage = vi.fn();

        const handled = handleSelectionContextMenuClick(
            { tabs: { sendMessage } },
            {
                menuItemId: EXPLAIN_SELECTION_CONTEXT_MENU_ID,
                selectionText: '  market wedge  ',
            } as chrome.contextMenus.OnClickData,
            { id: 12 } as chrome.tabs.Tab,
        );

        expect(handled).toBe(true);
        expect(sendMessage).toHaveBeenCalledWith(12, {
            type: EXPLAIN_SELECTION_MESSAGE_TYPE,
            text: 'market wedge',
        });
    });

    it('ignores unrelated menu clicks', () => {
        const sendMessage = vi.fn();

        const handled = handleSelectionContextMenuClick(
            { tabs: { sendMessage } },
            {
                menuItemId: 'other-menu',
                selectionText: 'market wedge',
            } as chrome.contextMenus.OnClickData,
            { id: 12 } as chrome.tabs.Tab,
        );

        expect(handled).toBe(false);
        expect(sendMessage).not.toHaveBeenCalled();
    });

    it('registers install, startup, and click listeners', () => {
        const addInstalledListener = vi.fn();
        const addStartupListener = vi.fn();
        const addClickedListener = vi.fn();

        registerSelectionContextMenu({
            contextMenus: {
                removeAll: vi.fn(),
                create: vi.fn(),
                onClicked: { addListener: addClickedListener },
            },
            runtime: {
                onInstalled: { addListener: addInstalledListener },
                onStartup: { addListener: addStartupListener },
            },
            tabs: { sendMessage: vi.fn() },
        });

        expect(addInstalledListener).toHaveBeenCalledTimes(1);
        expect(addStartupListener).toHaveBeenCalledTimes(1);
        expect(addClickedListener).toHaveBeenCalledTimes(1);
    });
});
