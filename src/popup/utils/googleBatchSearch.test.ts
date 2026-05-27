import { describe, expect, it, vi } from 'vitest';
import { openGoogleSearchTabs, parseGoogleKeywords } from './googleBatchSearch';

describe('googleBatchSearch', () => {
    it('parses keywords from lines and commas without duplicates', () => {
        expect(parseGoogleKeywords('  ai tools\nseo software, ai tools\n\nbest crm  ')).toEqual([
            'ai tools',
            'seo software',
            'best crm',
        ]);
    });

    it('opens one Google search tab for each keyword', async () => {
        const create = vi.fn().mockResolvedValue({});

        await openGoogleSearchTabs('ai tools\nbest crm', { create });

        expect(create).toHaveBeenCalledTimes(2);
        expect(create).toHaveBeenNthCalledWith(1, {
            url: 'https://www.google.com/search?q=ai%20tools',
            active: true,
        });
        expect(create).toHaveBeenNthCalledWith(2, {
            url: 'https://www.google.com/search?q=best%20crm',
            active: false,
        });
    });
});
