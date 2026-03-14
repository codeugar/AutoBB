const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent';

const PROMPT_TEMPLATE = `你是一个专为独立开发者和产品创始人服务的简洁助手。
请先通过谷歌搜索了解这个词语的最新含义和用法，然后用2-3句话解释其含义。
聚焦于对产品构建、营销或定位的实际意义。
直接回答，不要有任何开场白。
必须用简体中文回答。

解释这个词："`;

export async function explainText(text: string, apiKey: string): Promise<string> {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: PROMPT_TEMPLATE + text + '"' }] }],
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
