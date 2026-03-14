const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent';

const PROMPT_TEMPLATE = `You are a concise assistant for indie hackers and product makers doing product research.
When given a term or phrase, explain what it means in 2-3 sentences.
Focus on practical meaning for building, marketing, or positioning a product.
Be direct. No preamble.

Explain this: "`;

export async function explainText(text: string, apiKey: string): Promise<string> {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: PROMPT_TEMPLATE + text + '"' }] }],
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
