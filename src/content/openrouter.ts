const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function cleanPrompt(prompt: string): string {
    return prompt.replace(/["'\s]+$/, '').trim();
}

export async function explainText(
    text: string,
    apiKey: string,
    prompt: string,
    modelId: string,
): Promise<string> {
    const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://autobb.dev',
            'X-Title': 'AutoBB',
        },
        body: JSON.stringify({
            model: modelId,
            messages: [
                { role: 'system', content: cleanPrompt(prompt) },
                { role: 'user', content: text },
            ],
            max_tokens: 512,
            temperature: 0.3,
        }),
    });

    if (!response.ok) {
        const json = await response.json().catch(() => ({})) as { error?: { message?: string } };
        const message = json.error?.message || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    const data = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No explanation returned from OpenRouter.');
    return content.trim();
}
