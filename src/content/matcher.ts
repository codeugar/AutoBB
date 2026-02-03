import type { Profile } from '../types';

export interface DetectedField {
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    fieldKey: keyof Profile | string; // 'title', 'domain', 'features.0', etc.
    confidence: number;
    reason: string;
}

const KEYWORDS: Record<string, string[]> = {
    name: ['name', 'product_name', 'project_name', 'app_name', 'title', 'subject'],
    domain: ['website', 'url', 'link', 'homepage', 'domain', 'address'],
    category: ['category', 'type', 'industry', 'niche', 'topic'],
    shortDescription: ['short_description', 'tagline', 'summary', 'pitch', 'one_liner', 'brief'],
    longDescription: ['description', 'detail', 'about', 'story', 'readme', 'full_description', 'bio'],
    pricing: ['pricing', 'price', 'cost', 'model', 'plan'],
    features: ['feature', 'highlight', 'capability', 'function'],
    userCases: ['user case', 'use case', 'usecase', 'scenario', 'workflow'],
    tags: ['tag', 'keyword', 'label'],
    email: ['email', 'mail', 'contact'],
};

// Helper to normalize strings for comparison
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export const matcher = {
    detectFields(root: Document | HTMLElement = document): DetectedField[] {
        const inputs = Array.from(root.querySelectorAll('input, textarea, select')) as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[];
        const detected: DetectedField[] = [];
        const usedElements = new Set<HTMLElement>();

        // Helper to add detection
        const addDetection = (el: any, key: string, score: number, reason: string) => {
            if (usedElements.has(el)) return;
            // If we already have a detection for this element with higher score, skip
            // Actually, for now, just greedy first match win or keep all and sort?
            detected.push({ element: el, fieldKey: key, confidence: score, reason });
            usedElements.add(el);
        };

        inputs.forEach(el => {
            if (this.isHidden(el)) return;

            const attrs = [
                el.name,
                el.id,
                el.getAttribute('placeholder'),
                el.getAttribute('aria-label'),
                this.getLabelText(el)
            ].map(s => s ? normalize(s) : '');

            // Check each profile key against heuristics
            for (const [key, words] of Object.entries(KEYWORDS)) {
                for (const word of words) {
                    const nWord = normalize(word);
                    // Perfect match on name/id/label has high confidence
                    if (attrs.some(a => a === nWord)) {
                        addDetection(el, key, 1.0, `Match on attribute: ${word}`);
                        return; // Stop checking other keys for this input
                    }
                    // Partial match
                    if (attrs.some(a => a.includes(nWord))) {
                        addDetection(el, key, 0.7, `Partial match: ${word}`);
                        return;
                    }
                }
            }
        });

        return detected;
    },

    isHidden(el: HTMLElement) {
        if (el.getAttribute('type') === 'hidden') return true;
        const style = window.getComputedStyle(el);
        return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
    },

    getLabelText(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
        // 1. Check <label for="id">
        if (el.id) {
            const label = document.querySelector(`label[for="${el.id}"]`);
            if (label) return label.textContent || '';
        }
        // 2. Check parent <label>
        const parentLabel = el.closest('label');
        if (parentLabel) return parentLabel.textContent || '';

        // 3. Check preceding text (simple heuristic)
        // This is expensive and tricky, skipping for V1
        return '';
    }
};
