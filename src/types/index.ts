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
}

export interface FieldMapping {
    selector: string;
    fieldKey: keyof Profile | string;
}
