export interface GeminiModel {
    id: string;
    label: string;
    status: 'stable' | 'preview';
    description: string;
}

export const GEMINI_MODELS: GeminiModel[] = [
    { id: 'gemini-3.1-flash-lite-preview', status: 'preview', label: 'Gemini 3.1 Flash Lite', description: '极致成本优化' },
    { id: 'gemini-3-flash-preview',        status: 'preview', label: 'Gemini 3 Flash',        description: '前沿性能，成本低' },
    { id: 'gemini-3.1-pro-preview',        status: 'preview', label: 'Gemini 3.1 Pro',        description: '最新推理模型' },
    { id: 'gemini-2.5-flash',              status: 'stable',  label: 'Gemini 2.5 Flash',      description: '高性价比，推理能力强' },
    { id: 'gemini-2.5-flash-lite',         status: 'stable',  label: 'Gemini 2.5 Flash Lite', description: '最快最便宜' },
    { id: 'gemini-2.5-pro',               status: 'stable',  label: 'Gemini 2.5 Pro',        description: '最强大，复杂任务' },
];

export const DEFAULT_MODEL_ID = 'gemini-3.1-flash-lite-preview';
