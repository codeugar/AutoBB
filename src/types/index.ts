export interface Screenshot {
    base64?: string;
    url?: string;
}

export interface Profile {
    id: string;
    name: string;
    domain: string;
    email: string; // [NEW] Added email field
    category: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    features: string[];
    tags: string[];
    pricing: string;
    customFields: Record<string, string>;
    logoBase64?: string;
    logoUrl?: string;
    screenshots?: Screenshot[];
    userCases?: string[];
}

export interface FieldMapping {
    selector: string;
    fieldKey: keyof Profile | string;
}

export interface TrackedSite {
    domain: string;
    addedAt: number;
}

export interface TrafficSnapshot {
    domain: string;
    globalRank: number;
    visits: number;        // monthly estimate
    bounceRate: number;    // 0–1
    pagesPerVisit: number;
    avgDuration: number;   // seconds
    fetchedAt: number;
}
