import { describe, it, expect } from 'vitest';
import { base64ToBlob } from './clipboard';

describe('clipboard utils', () => {
    describe('base64ToBlob', () => {
        it('should convert valid base64 to blob', () => {
            const base64 = 'data:image/png;base64,iVBORw0KGgo=';
            const blob = base64ToBlob(base64);
            expect(blob).toBeInstanceOf(Blob);
            expect(blob.type).toBe('image/png');
        });

        it('should default to image/png for invalid mime', () => {
            const base64 = 'data:;base64,iVBORw0KGgo=';
            const blob = base64ToBlob(base64);
            expect(blob.type).toBe('image/png');
        });
    });
});
