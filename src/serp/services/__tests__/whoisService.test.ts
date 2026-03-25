import { describe, expect, it } from 'vitest';
import { getRegistrationDate } from '../whoisService';

describe('whoisService', () => {
    describe('mock mode', () => {
        it('returns a valid YYYY-MM-DD date string', async () => {
            const date = await getRegistrationDate('example.com');
            expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('returns deterministic result for the same domain', async () => {
            const date1 = await getRegistrationDate('example.com');
            const date2 = await getRegistrationDate('example.com');
            expect(date1).toBe(date2);
        });

        it('returns different dates for different domains', async () => {
            const date1 = await getRegistrationDate('example.com');
            const date2 = await getRegistrationDate('google.com');
            expect(date1).not.toBe(date2);
        });

        it('year is between 1995 and 2025', async () => {
            const date = await getRegistrationDate('example.com');
            const year = parseInt(date.split('-')[0], 10);
            expect(year).toBeGreaterThanOrEqual(1995);
            expect(year).toBeLessThanOrEqual(2025);
        });

        it('month is between 01 and 12', async () => {
            const date = await getRegistrationDate('example.com');
            const month = parseInt(date.split('-')[1], 10);
            expect(month).toBeGreaterThanOrEqual(1);
            expect(month).toBeLessThanOrEqual(12);
        });

        it('day is between 01 and 28', async () => {
            const date = await getRegistrationDate('example.com');
            const day = parseInt(date.split('-')[2], 10);
            expect(day).toBeGreaterThanOrEqual(1);
            expect(day).toBeLessThanOrEqual(28);
        });
    });

    describe('edge cases', () => {
        it('handles domain without TLD', async () => {
            const date = await getRegistrationDate('localhost');
            expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('handles subdomain', async () => {
            const date = await getRegistrationDate('blog.example.com');
            expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });
});
