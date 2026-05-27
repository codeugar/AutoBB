type TabCreator = {
    create: (properties: chrome.tabs.CreateProperties) => Promise<chrome.tabs.Tab> | void;
};

export const parseGoogleKeywords = (value: string): string[] => {
    const seen = new Set<string>();

    return value
        .split(/[\n,]+/)
        .map((keyword) => keyword.trim())
        .filter((keyword) => {
            if (!keyword || seen.has(keyword)) return false;
            seen.add(keyword);
            return true;
        });
};

export const buildGoogleSearchUrl = (keyword: string): string =>
    `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;

export const openGoogleSearchTabs = async (
    value: string,
    tabs: TabCreator = chrome.tabs,
): Promise<number> => {
    const keywords = parseGoogleKeywords(value);

    for (const [index, keyword] of keywords.entries()) {
        await tabs.create({
            url: buildGoogleSearchUrl(keyword),
            active: index === 0,
        });
    }

    return keywords.length;
};
