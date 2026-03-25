export interface SerpResult {
    position: number;
    title: string;
    url: string;
    content: string;
    domain: string;
}

export interface DomainData {
    siteName: string;
    description: string;
    globalRank: number;
    monthlyVisits: number;
    timeOnSite: string;
    pagesPerVisit: number;
    bounceRate: number;
    topKeywords: KeywordData[];
    trafficSources: TrafficSource[];
    visitTrends: VisitTrend[];
    regionDistribution: RegionData[];
    registrationDate: string;
}

export interface KeywordData {
    name: string;
    traffic: number;
    volume: number;
    cpc: number;
}

export interface TrafficSource {
    source: 'search' | 'direct' | 'referrals' | 'social' | 'paid_referrals' | 'mail';
    share: number;
}

export interface VisitTrend {
    month: string;
    traffic: number;
}

export interface RegionData {
    region: string;
    percentage: number;
}

export interface SerpSearchParams {
    query: string;
    country: string;
    language: string;
    perPage: number;
}

// Serper API response types
export interface SerperApiResponse {
    searchParameters: {
        q: string;
        gl: string;
        hl: string;
        num: number;
        type: string;
    };
    organic: SerperOrganicResult[];
    relatedSearches?: { query: string }[];
    knowledgeGraph?: {
        title: string;
        type: string;
        description: string;
    };
    peopleAlsoAsk?: { question: string; snippet: string }[];
    credits: number;
}

export interface SerperOrganicResult {
    title: string;
    link: string;
    snippet: string;
    position: number;
    date?: string;
    sitelinks?: { title: string; link: string }[];
}

// Normalized response used internally (decoupled from API provider)
export interface SerpApiResponse {
    success: boolean;
    data: {
        query: string;
        results: {
            title: string;
            url: string;
            content: string;
            position: number;
        }[];
        suggestions: string[];
    };
}

export type PageTypeFilter = 'all' | 'inner' | 'home' | 'keyword';
export type DateRangeFilter = 'week' | 'month' | 'year' | '3years' | null;
