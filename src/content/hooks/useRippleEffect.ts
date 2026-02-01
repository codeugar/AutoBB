import type React from 'react';
import { useRipple } from '@tracksuitdev/use-ripple';

export interface RippleStyle extends React.CSSProperties {
    top?: string;
    left?: string;
    width?: string;
    height?: string;
}

export interface RippleReturn {
    styles: RippleStyle[];
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export const useRippleEffect = (): RippleReturn => {
    const ripple = useRipple({ duration: 400 }) as unknown as RippleReturn;
    return {
        styles: ripple.styles ?? [],
        onClick: ripple.onClick,
    };
};
