import React, { useState } from 'react';
import { Copy, Link, Check, AlertCircle } from 'lucide-react';
import { copyImage, copyText, base64ToFile } from '../utils/clipboard';
import { useRippleEffect } from '../hooks/useRippleEffect';

interface ImageItemProps {
    label: string;
    base64?: string;
    url?: string;
}

export const ImageItem: React.FC<ImageItemProps> = ({ label, base64, url }) => {
    const [copiedImg, setCopiedImg] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [dragError, setDragError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const { styles: imgStyles, onClick: imgRipple } = useRippleEffect();
    const { styles: urlStyles, onClick: urlRipple } = useRippleEffect();

    const handleCopyImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
        imgRipple(e);
        setActionError(null);
        if (!base64) return;
        const result = await copyImage(base64);
        if (result.success) {
            setCopiedImg(true);
            setTimeout(() => setCopiedImg(false), 1500);
        } else {
            setActionError(result.error ?? 'Copy image failed');
            setTimeout(() => setActionError(null), 3000);
        }
    };

    const handleCopyUrl = async (e: React.MouseEvent<HTMLButtonElement>) => {
        urlRipple(e);
        setActionError(null);
        if (!url) return;
        const result = await copyText(url);
        if (result.success) {
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 1500);
        } else {
            setActionError(result.error ?? 'Copy URL failed');
            setTimeout(() => setActionError(null), 3000);
        }
    };

    const handleDragStart = async (e: React.DragEvent) => {
        if (!base64) return;

        try {
            const file = base64ToFile(base64, `${label.toLowerCase()}.png`);
            e.dataTransfer.items.add(file);
            e.dataTransfer.effectAllowed = 'copy';

            // Also copy to clipboard as fallback
            const result = await copyImage(base64);
            if (!result.success) {
                console.warn('Clipboard fallback failed:', result.error);
            }
        } catch (err) {
            console.error('Drag start failed:', err);
            setDragError('Drag failed, please use copy button');
            setTimeout(() => setDragError(null), 3000);
        }
    };

    const imageSrc = base64 || url;
    if (!imageSrc) return null;

    return (
        <div className="flex flex-col gap-1 py-1.5">
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted uppercase tracking-wider w-20">
                    {label}
                </span>
                <img
                    src={imageSrc}
                    alt={label}
                    className="img-thumbnail"
                    draggable={!!base64}
                    onDragStart={handleDragStart}
                    title={base64 ? 'Drag to upload or use buttons' : 'Image preview'}
                />
                <div className="flex gap-1">
                    {base64 && (
                        <button
                            onClick={handleCopyImage}
                            className="copy-btn ripple-parent flex items-center gap-1"
                            title={copiedImg ? 'Copied!' : 'Copy image'}
                        >
                            {copiedImg ? (
                                <Check size={12} className="text-emerald-500" />
                            ) : (
                                <Copy size={12} />
                            )}
                            <span className="text-[10px]">Img</span>
                            {imgStyles.map((style, i) => (
                                <span key={i} className="ripple" style={style} />
                            ))}
                        </button>
                    )}
                    {url && (
                        <button
                            onClick={handleCopyUrl}
                            className="copy-btn ripple-parent flex items-center gap-1"
                            title={copiedUrl ? 'Copied!' : 'Copy URL'}
                        >
                            {copiedUrl ? (
                                <Check size={12} className="text-emerald-500" />
                            ) : (
                                <Link size={12} />
                            )}
                            <span className="text-[10px]">URL</span>
                            {urlStyles.map((style, i) => (
                                <span key={i} className="ripple" style={style} />
                            ))}
                        </button>
                    )}
                </div>
            </div>
            {actionError && (
                <div className="flex items-center gap-1 text-[10px] text-red-400 ml-20">
                    <AlertCircle size={10} />
                    {actionError}
                </div>
            )}
            {dragError && (
                <div className="flex items-center gap-1 text-[10px] text-red-400 ml-20">
                    <AlertCircle size={10} />
                    {dragError}
                </div>
            )}
        </div>
    );
};
