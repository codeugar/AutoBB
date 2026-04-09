export type Provider = 'gemini' | 'openrouter';

export interface AIModel {
    id: string;
    label: string;
    provider: Provider;
    status: 'stable' | 'preview';
    description: string;
}

/** @deprecated Use AIModel instead */
export type GeminiModel = AIModel;

export const GEMINI_MODELS: AIModel[] = [
    { id: 'gemini-3.1-flash-lite-preview', provider: 'gemini', status: 'preview', label: 'Gemini 3.1 Flash Lite', description: '极致成本优化' },
    { id: 'gemini-3-flash-preview',        provider: 'gemini', status: 'preview', label: 'Gemini 3 Flash',        description: '前沿性能，成本低' },
    { id: 'gemini-3.1-pro-preview',        provider: 'gemini', status: 'preview', label: 'Gemini 3.1 Pro',        description: '最新推理模型' },
    { id: 'gemini-2.5-flash',              provider: 'gemini', status: 'stable',  label: 'Gemini 2.5 Flash',      description: '高性价比，推理能力强' },
    { id: 'gemini-2.5-flash-lite',         provider: 'gemini', status: 'stable',  label: 'Gemini 2.5 Flash Lite', description: '最快最便宜' },
    { id: 'gemini-2.5-pro',                provider: 'gemini', status: 'stable',  label: 'Gemini 2.5 Pro',        description: '最强大，复杂任务' },
];

export const OPENROUTER_MODELS: AIModel[] = [
    { id: 'perplexity/sonar',               provider: 'openrouter', status: 'stable', label: 'Sonar',               description: '轻量快速，内置搜索' },
    { id: 'perplexity/sonar-pro',            provider: 'openrouter', status: 'stable', label: 'Sonar Pro',            description: '深度查询，双倍引用' },
    { id: 'perplexity/sonar-reasoning-pro',  provider: 'openrouter', status: 'stable', label: 'Sonar Reasoning Pro',  description: '推理链，多步分析' },
    { id: 'perplexity/sonar-deep-research',  provider: 'openrouter', status: 'stable', label: 'Sonar Deep Research',  description: '自主研究，综合报告' },
];

export const ALL_MODELS: AIModel[] = [...GEMINI_MODELS, ...OPENROUTER_MODELS];

export const DEFAULT_MODEL_ID = 'gemini-3.1-flash-lite-preview';
export const DEFAULT_OPENROUTER_MODEL_ID = 'perplexity/sonar';

export function getProviderForModel(modelId: string): Provider {
    const found = ALL_MODELS.find((m) => m.id === modelId);
    if (found) return found.provider;
    return modelId.includes('/') ? 'openrouter' : 'gemini';
}
