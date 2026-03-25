export interface CountryOption {
    code: string;
    name: string;
    flag: string;
}

export interface LanguageOption {
    code: string;
    name: string;
}

export const COUNTRIES: CountryOption[] = [
    { code: 'US', name: 'United States', flag: '\u{1F1FA}\u{1F1F8}' },
    { code: 'GB', name: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}' },
    { code: 'CA', name: 'Canada', flag: '\u{1F1E8}\u{1F1E6}' },
    { code: 'AU', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}' },
    { code: 'DE', name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}' },
    { code: 'FR', name: 'France', flag: '\u{1F1EB}\u{1F1F7}' },
    { code: 'JP', name: 'Japan', flag: '\u{1F1EF}\u{1F1F5}' },
    { code: 'CN', name: 'China', flag: '\u{1F1E8}\u{1F1F3}' },
    { code: 'IN', name: 'India', flag: '\u{1F1EE}\u{1F1F3}' },
    { code: 'BR', name: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}' },
];

export const LANGUAGES: LanguageOption[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
];

export const PER_PAGE_OPTIONS = [10, 20, 50, 100] as const;

export const DEFAULT_COUNTRY = 'US';
export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_PER_PAGE = 100;

export const API_RESULTS_PER_PAGE = 10;
export const API_TIMEOUT_MS = 10_000;

export const TRAFFIC_SOURCE_COLORS: Record<string, string> = {
    search: '#10B981',
    direct: '#059669',
    referrals: '#34D399',
    social: '#6EE7B7',
    paid_referrals: '#A7F3D0',
    mail: '#D1FAE5',
};

export const REGION_COLORS = [
    '#10B981',
    '#059669',
    '#047857',
    '#34D399',
    '#6EE7B7',
];
