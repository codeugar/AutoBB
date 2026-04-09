import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// Mock chrome.storage.local
const store: Record<string, unknown> = {};
const chromeStorageMock = {
    get: vi.fn((key: string) => Promise.resolve({ [key]: store[key] })),
    set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(store, items);
        return Promise.resolve();
    }),
};

vi.stubGlobal('chrome', {
    storage: {
        local: chromeStorageMock,
    },
});

import ModelSelector from './ModelSelector';
import { GEMINI_MODELS, ALL_MODELS } from '../../models';

describe('ModelSelector — full mode', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        for (const key of Object.keys(store)) delete store[key];
    });

    afterEach(() => {
        cleanup();
    });

    it('renders all preset models', () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} />);
        for (const m of GEMINI_MODELS) {
            expect(screen.getByText(m.label)).toBeTruthy();
        }
    });

    it('highlights the currently selected model', () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} />);
        // Requires each <input type="radio"> to have aria-label={model.label}
        const radio = screen.getByRole('radio', { name: /Gemini 2\.5 Flash$/ }) as HTMLInputElement;
        expect(radio.checked).toBe(true);
    });

    it('calls onChange and saves to storage when a model is clicked', async () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} />);
        const radio = screen.getByRole('radio', { name: /Gemini 2\.5 Pro/ });
        fireEvent.click(radio);

        expect(onChange).toHaveBeenCalledWith('gemini-2.5-pro');
        // Verify internal storage save (spec requirement)
        expect(chromeStorageMock.set).toHaveBeenCalledWith({
            selected_model: 'gemini-2.5-pro',
        });
    });

    it('renders custom model input field', () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} />);
        expect(screen.getByPlaceholderText(/custom model/i)).toBeTruthy();
    });

    it('accepts custom model ID via input and saves to storage', () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} />);
        const input = screen.getByPlaceholderText(/custom model/i);
        fireEvent.change(input, { target: { value: 'gemini-exp-custom' } });
        fireEvent.click(screen.getByText('Use'));

        expect(onChange).toHaveBeenCalledWith('gemini-exp-custom');
        expect(chromeStorageMock.set).toHaveBeenCalledWith({
            selected_model: 'gemini-exp-custom',
        });
    });

    it('does not call onChange for empty custom input', () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} />);
        fireEvent.click(screen.getByText('Use'));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('shows status badges for models', () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} />);
        expect(screen.getAllByText('stable').length).toBeGreaterThan(0);
        expect(screen.getAllByText('preview').length).toBeGreaterThan(0);
    });

    it('renders provider group headers', () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} />);
        expect(screen.getByText('Gemini')).toBeTruthy();
        expect(screen.getByText('OpenRouter — Perplexity')).toBeTruthy();
    });

    it('renders all models from both providers', () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} />);
        for (const m of ALL_MODELS) {
            expect(screen.getByText(m.label)).toBeTruthy();
        }
    });
});

describe('ModelSelector — compact mode', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders current model name as clickable text', () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} compact />);
        expect(screen.getByText(/2\.5 Flash/)).toBeTruthy();
    });

    it('shows popover on click', () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} compact />);
        fireEvent.click(screen.getByText(/2\.5 Flash/));
        for (const m of GEMINI_MODELS) {
            expect(screen.getByText(m.label)).toBeTruthy();
        }
    });

    it('hides popover after selection and calls onChange', () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} compact />);
        fireEvent.click(screen.getByText(/2\.5 Flash/));
        fireEvent.click(screen.getByText('Gemini 2.5 Pro'));
        expect(onChange).toHaveBeenCalledWith('gemini-2.5-pro');
        expect(chromeStorageMock.set).toHaveBeenCalledWith({
            selected_model: 'gemini-2.5-pro',
        });
    });

    it('displays custom model ID when value is not in preset list', () => {
        render(<ModelSelector value="gemini-exp-custom" onChange={onChange} compact />);
        expect(screen.getByText(/gemini-exp-custom/)).toBeTruthy();
    });

    it('uses inline styles only — no Tailwind classes (smoke test)', () => {
        const { container } = render(
            <ModelSelector value="gemini-2.5-flash" onChange={onChange} compact />,
        );
        const allElements = container.querySelectorAll('[class]');
        for (const el of allElements) {
            expect(el.className).not.toMatch(/glass-card|rounded-xl|accent-gradient/);
        }
    });

    it('shows all models from both providers in popover', () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} compact />);
        fireEvent.click(screen.getByText(/2\.5 Flash/));
        for (const m of ALL_MODELS) {
            expect(screen.getAllByText(m.label).length).toBeGreaterThan(0);
        }
    });

    it('shows shortened label for Gemini models in compact trigger', () => {
        render(<ModelSelector value="gemini-2.5-flash" onChange={onChange} compact />);
        expect(screen.getByText(/2\.5 Flash/)).toBeTruthy();
    });

    it('shows full label for OpenRouter models in compact trigger', () => {
        render(<ModelSelector value="perplexity/sonar" onChange={onChange} compact />);
        expect(screen.getByText(/Sonar/)).toBeTruthy();
    });
});
