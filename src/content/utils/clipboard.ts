/**
 * Convert base64 string to Blob for clipboard operations
 */
export function base64ToBlob(base64: string): Blob {
    const [meta, data] = base64.split(',');
    const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
}

/**
 * Create a File object from base64 for drag operations
 */
export function base64ToFile(base64: string, filename: string = 'image.png'): File {
    const blob = base64ToBlob(base64);
    return new File([blob], filename, { type: blob.type });
}

export function isClipboardSupported(): boolean {
    return !!(navigator.clipboard && navigator.clipboard.writeText);
}

export async function copyText(text: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (isClipboardSupported()) {
            await navigator.clipboard.writeText(text);
            return { success: true };
        }
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return { success: true };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Copy failed' };
    }
}

export async function copyImage(base64: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!navigator.clipboard?.write) {
            return { success: false, error: 'Image copy not supported in this browser' };
        }
        const blob = base64ToBlob(base64);
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        return { success: true };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Image copy failed' };
    }
}
