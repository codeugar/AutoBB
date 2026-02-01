import React, { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { copyText } from '../utils/clipboard';
import { useRippleEffect } from '../hooks/useRippleEffect';

interface CopyableFieldProps {
    label: string;
    value: string;
    maxLength?: number;
}

export const CopyableField: React.FC<CopyableFieldProps> = ({
    label,
    value,
    maxLength = 80,
}) => {
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { styles, onClick: rippleClick } = useRippleEffect();

    if (!value) return null;

    const displayValue = value.length > maxLength
        ? `${value.slice(0, maxLength)}...`
        : value;

    const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
        rippleClick(e);
        setError(null);
        const result = await copyText(value);
        if (result.success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } else {
            setError(result.error ?? 'Copy failed');
            setTimeout(() => setError(null), 3000);
        }
    };

    return (
        <div className="flex flex-col gap-1 py-1.5">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-muted uppercase tracking-wider block">
                        {label}
                    </span>
                    <span
                        className="text-xs text-primary whitespace-pre-wrap break-words block"
                        title={value}
                    >
                        {displayValue}
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    className="copy-btn ripple-parent flex items-center gap-1"
                    title={copied ? 'Copied!' : `Copy ${label}`}
                >
                    {copied ? (
                        <Check size={12} className="text-emerald-500" />
                    ) : (
                        <Copy size={12} />
                    )}
                    {styles.map((style, i) => (
                        <span key={i} className="ripple" style={style} />
                    ))}
                </button>
            </div>
            {error && (
                <div className="flex items-center gap-1 text-[10px] text-red-400">
                    <AlertCircle size={10} />
                    {error}
                </div>
            )}
        </div>
    );
};
