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
}

export interface FieldMapping {
    selector: string;
    fieldKey: keyof Profile | string;
}
