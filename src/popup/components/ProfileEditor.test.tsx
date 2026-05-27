import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Profile } from '../../types';
import ProfileEditor from './ProfileEditor';

const baseProfile: Profile = {
    id: 'profile-1',
    name: 'AutoBB',
    domain: 'https://autobb.dev',
    email: 'hello@autobb.dev',
    category: 'Automation',
    title: 'Auto-fill forms',
    shortDescription: 'A short pitch',
    longDescription: 'A longer product description',
    features: ['Detects fields'],
    tags: [],
    pricing: 'Free',
    customFields: {},
    userCases: ['Directory submissions'],
};

describe('ProfileEditor', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('autosaves a complete profile snapshot when a field changes', () => {
        const onAutoSave = vi.fn();

        render(
            <ProfileEditor
                profile={baseProfile}
                onSave={vi.fn()}
                onCancel={vi.fn()}
                onDelete={vi.fn()}
                onAutoSave={onAutoSave}
            />,
        );

        fireEvent.change(screen.getByLabelText('Official Website'), {
            target: { value: 'https://new.example.com' },
        });

        expect(onAutoSave).toHaveBeenCalledWith({
            ...baseProfile,
            domain: 'https://new.example.com',
        });
    });
});
