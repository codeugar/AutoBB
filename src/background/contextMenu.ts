import {
    EXPLAIN_SELECTION_CONTEXT_MENU_ID,
    createExplainSelectionMessage,
    normalizeSelectionText,
} from '../shared/explainSelection';

type ChromeContextMenuApi = {
    contextMenus: {
        create: (createProperties: chrome.contextMenus.CreateProperties) => void;
        removeAll: (callback?: () => void) => void;
        onClicked?: {
            addListener: (
                callback: (
                    info: chrome.contextMenus.OnClickData,
                    tab?: chrome.tabs.Tab,
                ) => void,
            ) => void;
        };
    };
    runtime?: {
        onInstalled?: { addListener: (callback: () => void) => void };
        onStartup?: { addListener: (callback: () => void) => void };
    };
    tabs: {
        sendMessage: (tabId: number, message: unknown) => void;
    };
};

export function buildSelectionContextMenu(): chrome.contextMenus.CreateProperties {
    return {
        id: EXPLAIN_SELECTION_CONTEXT_MENU_ID,
        title: 'Ask AI about "%s"',
        contexts: ['selection'],
    };
}

export function ensureSelectionContextMenu(
    chromeApi: Pick<ChromeContextMenuApi, 'contextMenus'>,
): void {
    chromeApi.contextMenus.removeAll(() => {
        chromeApi.contextMenus.create(buildSelectionContextMenu());
    });
}

export function handleSelectionContextMenuClick(
    chromeApi: Pick<ChromeContextMenuApi, 'tabs'>,
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab,
): boolean {
    if (info.menuItemId !== EXPLAIN_SELECTION_CONTEXT_MENU_ID) return false;

    const text = normalizeSelectionText(info.selectionText);
    if (!text || typeof tab?.id !== 'number') return false;

    chromeApi.tabs.sendMessage(tab.id, createExplainSelectionMessage(text));
    return true;
}

export function registerSelectionContextMenu(chromeApi: ChromeContextMenuApi): void {
    chromeApi.runtime?.onInstalled?.addListener(() => {
        ensureSelectionContextMenu(chromeApi);
    });

    chromeApi.runtime?.onStartup?.addListener(() => {
        ensureSelectionContextMenu(chromeApi);
    });

    chromeApi.contextMenus.onClicked?.addListener((info, tab) => {
        handleSelectionContextMenuClick(chromeApi, info, tab);
    });
}
