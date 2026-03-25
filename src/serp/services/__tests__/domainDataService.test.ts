import { describe, expect, it, beforeEach } from 'vitest';
import { getDomainData } from '../domainDataService';
import type { DomainData } from '../../types';

describe('domainDataService', () => {
    describe('determinism', () => {
        it('returns identical data for the same domain', async () => {
            const data1 = await getDomainData('openai.com');
            const data2 = await getDomainData('openai.com');

            expect(data1).toEqual(data2);
        });

        it('returns different data for different domains', async () => {
            const data1 = await getDomainData('openai.com');
            const data2 = await getDomainData('google.com');

            expect(data1.globalRank).not.toBe(data2.globalRank);
        });
    });

    describe('siteName', () => {
        it('capitalizes the first segment of the domain', async () => {
            const data = await getDomainData('openai.com');
            expect(data.siteName).toBe('Openai');
        });

        it('handles subdomains by using first segment', async () => {
            const data = await getDomainData('blog.example.com');
            expect(data.siteName).toBe('Blog');
        });
    });

    describe('field ranges', () => {
        let data: DomainData;

        beforeEach(async () => {
            data = await getDomainData('testdomain.com');
        });

        it('globalRank is within [50, 3_000_000]', () => {
            expect(data.globalRank).toBeGreaterThanOrEqual(50);
            expect(data.globalRank).toBeLessThanOrEqual(3_000_000);
        });

        it('monthlyVisits is within [1_000, 50_000_000]', () => {
            expect(data.monthlyVisits).toBeGreaterThanOrEqual(1_000);
            expect(data.monthlyVisits).toBeLessThanOrEqual(50_000_000);
        });

        it('timeOnSite is in "m:ss" format', () => {
            expect(data.timeOnSite).toMatch(/^\d+:\d{2}$/);
        });

        it('pagesPerVisit is within [1.2, 8.5]', () => {
            expect(data.pagesPerVisit).toBeGreaterThanOrEqual(1.2);
            expect(data.pagesPerVisit).toBeLessThanOrEqual(8.5);
        });

        it('bounceRate is within [20, 85]', () => {
            expect(data.bounceRate).toBeGreaterThanOrEqual(20);
            expect(data.bounceRate).toBeLessThanOrEqual(85);
        });

        it('description is a non-empty string', () => {
            expect(data.description.length).toBeGreaterThan(0);
        });

        it('registrationDate is a valid YYYY-MM-DD between 1995-2025', () => {
            expect(data.registrationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            const year = parseInt(data.registrationDate.split('-')[0], 10);
            expect(year).toBeGreaterThanOrEqual(1995);
            expect(year).toBeLessThanOrEqual(2025);
        });
    });

    describe('topKeywords', () => {
        it('returns 5-10 keywords', async () => {
            const data = await getDomainData('example.com', 'seo tools');
            expect(data.topKeywords.length).toBeGreaterThanOrEqual(5);
            expect(data.topKeywords.length).toBeLessThanOrEqual(10);
        });

        it('each keyword has valid traffic, volume, and cpc', async () => {
            const data = await getDomainData('example.com', 'seo tools');

            data.topKeywords.forEach((kw) => {
                expect(kw.name.length).toBeGreaterThan(0);
                expect(kw.traffic).toBeGreaterThanOrEqual(1_000);
                expect(kw.traffic).toBeLessThanOrEqual(20_000_000);
                expect(kw.volume).toBeGreaterThanOrEqual(kw.traffic);
                expect(kw.cpc).toBeGreaterThanOrEqual(0.05);
                expect(kw.cpc).toBeLessThanOrEqual(15.0);
            });
        });

        it('generates keywords from the search query', async () => {
            const data = await getDomainData('example.com', 'seo tools');

            const hasRelated = data.topKeywords.some(
                (kw) => kw.name.includes('seo') || kw.name.includes('tools'),
            );
            expect(hasRelated).toBe(true);
        });
    });

    describe('trafficSources', () => {
        it('has 6 traffic sources', async () => {
            const data = await getDomainData('example.com');
            expect(data.trafficSources).toHaveLength(6);
        });

        it('includes all required source types', async () => {
            const data = await getDomainData('example.com');
            const sources = data.trafficSources.map((s) => s.source);
            expect(sources).toContain('search');
            expect(sources).toContain('direct');
            expect(sources).toContain('referrals');
            expect(sources).toContain('social');
            expect(sources).toContain('paid_referrals');
            expect(sources).toContain('mail');
        });

        it('shares sum to 100', async () => {
            const data = await getDomainData('example.com');
            const total = data.trafficSources.reduce((sum, s) => sum + s.share, 0);
            expect(total).toBeCloseTo(100, 1);
        });
    });

    describe('visitTrends', () => {
        it('returns 5 months of data', async () => {
            const data = await getDomainData('example.com');
            expect(data.visitTrends).toHaveLength(5);
        });

        it('each entry has a valid YYYY-MM format and positive traffic', async () => {
            const data = await getDomainData('example.com');

            data.visitTrends.forEach((vt) => {
                expect(vt.month).toMatch(/^\d{4}-\d{2}$/);
                expect(vt.traffic).toBeGreaterThan(0);
            });
        });
    });

    describe('regionDistribution', () => {
        it('returns 5 regions', async () => {
            const data = await getDomainData('example.com');
            expect(data.regionDistribution).toHaveLength(5);
        });

        it('percentages sum to approximately 95', async () => {
            const data = await getDomainData('example.com');
            const total = data.regionDistribution.reduce((sum, r) => sum + r.percentage, 0);
            expect(total).toBeCloseTo(95, 0);
        });

        it('each region has a name and positive percentage', async () => {
            const data = await getDomainData('example.com');

            data.regionDistribution.forEach((r) => {
                expect(r.region.length).toBeGreaterThan(0);
                expect(r.percentage).toBeGreaterThan(0);
            });
        });
    });

    describe('edge cases', () => {
        it('handles domain without TLD', async () => {
            const data = await getDomainData('localhost');
            expect(data.siteName).toBe('Localhost');
        });

        it('handles domain with searchQuery undefined', async () => {
            const data = await getDomainData('example.com');
            expect(data.topKeywords.length).toBeGreaterThanOrEqual(5);
        });
    });
});
