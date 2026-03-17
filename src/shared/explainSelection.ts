export const EXPLAIN_SELECTION_CONTEXT_MENU_ID = 'autobb-explain-selection';
export const EXPLAIN_SELECTION_MESSAGE_TYPE = 'AUTOBB_EXPLAIN_SELECTION';

export type ExplainSelectionMessage = {
    type: typeof EXPLAIN_SELECTION_MESSAGE_TYPE;
    text: string;
};

export function normalizeSelectionText(text: string | null | undefined): string | null {
    const trimmed = text?.trim() ?? '';
    return trimmed.length >= 2 ? trimmed : null;
}

export function createExplainSelectionMessage(text: string): ExplainSelectionMessage {
    return {
        type: EXPLAIN_SELECTION_MESSAGE_TYPE,
        text,
    };
}
