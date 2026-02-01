import React from 'react';
import type { Profile } from '../../types';
import { CopyableField } from './CopyableField';
import { ImageItem } from './ImageItem';
import { ScreenshotList } from './ScreenshotList';

interface ProfileFieldsSectionProps {
    profile: Profile;
}

export const ProfileFieldsSection: React.FC<ProfileFieldsSectionProps> = ({ profile }) => {
    const hasImages = Boolean(
        profile.logoBase64 ||
        profile.logoUrl ||
        (profile.screenshots?.length ?? 0) > 0
    );

    return (
        <div className="flex flex-col gap-3">
            <div className="glass-card rounded-xl p-3">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
                    Profile Fields
                </p>
                <div className="flex flex-col divide-y divide-white/5">
                    <CopyableField label="Name" value={profile.name} />
                    <CopyableField label="Title" value={profile.title} />
                    <CopyableField label="Short Desc" value={profile.shortDescription} maxLength={120} />
                    <CopyableField label="Long Desc" value={profile.longDescription} maxLength={200} />
                    <CopyableField label="Email" value={profile.email} />
                    <CopyableField label="Domain" value={profile.domain} />
                    <CopyableField label="Category" value={profile.category} />
                    <CopyableField label="Pricing" value={profile.pricing} />
                    {profile.tags.length > 0 && (
                        <CopyableField label="Tags" value={profile.tags.join(', ')} />
                    )}
                    {profile.features
                        .filter((feature) => feature.trim())
                        .map((feature, i) => (
                            <CopyableField
                                key={`${feature}-${i}`}
                                label={`Feature ${i + 1}`}
                                value={feature}
                                maxLength={200}
                            />
                        ))}
                    {Object.entries(profile.customFields).map(([key, value]) => (
                        <CopyableField key={key} label={key} value={value} maxLength={200} />
                    ))}
                </div>
            </div>

            {hasImages && (
                <div className="glass-card rounded-xl p-3">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
                        Images
                    </p>
                    <ImageItem
                        label="Logo"
                        base64={profile.logoBase64}
                        url={profile.logoUrl}
                    />
                    <ScreenshotList screenshots={profile.screenshots} />
                </div>
            )}
        </div>
    );
};
