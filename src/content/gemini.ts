const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function explainText(text: string, apiKey: string, prompt: string, modelId: string): Promise<string> {
    const url = `${GEMINI_BASE}/${modelId}:generateContent`;
    const response = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt + text + '"' }] }],
            tools: [{ google_search: {} }],
            generationConfig: {
                maxOutputTokens: 256,
                temperature: 0.3,
            },
        }),
    });

    if (!response.ok) {
        const json = await response.json().catch(() => ({})) as { error?: { message?: string } };
        const message = json.error?.message || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    const data = await response.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!explanation) throw new Error('No explanation returned from Gemini.');
    return explanation.trim();
}
