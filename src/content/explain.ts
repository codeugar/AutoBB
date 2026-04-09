import { getProviderForModel } from '../models';
import { storage } from '../storage';
import { explainText as geminiExplain } from './gemini';
import { explainText as openrouterExplain } from './openrouter';

export async function explainSelection(
    text: string,
    modelId: string,
    promptOverride?: string,
): Promise<string> {
    const provider = getProviderForModel(modelId);
    const prompt = promptOverride ?? await storage.getGeminiPrompt();

    if (provider === 'openrouter') {
        const apiKey = await storage.getOpenRouterApiKey();
        if (!apiKey) throw new Error('Please configure your OpenRouter API key in Settings.');
        return openrouterExplain(text, apiKey, prompt, modelId);
    }

    const apiKey = await storage.getGeminiApiKey();
    if (!apiKey) throw new Error('Please configure your Gemini API key in Settings.');
    return geminiExplain(text, apiKey, prompt, modelId);
}
