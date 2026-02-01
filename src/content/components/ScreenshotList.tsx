import React from 'react';
import type { Screenshot } from '../../types';
import { ImageItem } from './ImageItem';

interface ScreenshotListProps {
    screenshots?: Screenshot[];
}

export const ScreenshotList: React.FC<ScreenshotListProps> = ({
    screenshots = [],
}) => {
    if (screenshots.length === 0) return null;

    return (
        <>
            {screenshots.map((shot, i) => (
                <ImageItem
                    key={i}
                    label={`Shot ${i + 1}`}
                    base64={shot.base64}
                    url={shot.url}
                />
            ))}
        </>
    );
};
