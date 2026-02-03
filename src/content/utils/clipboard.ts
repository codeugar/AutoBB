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
        const blob = await ensurePngBlob(base64);
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        return { success: true };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Image copy failed' };
    }
}

async function ensurePngBlob(base64: string): Promise<Blob> {
    const blob = base64ToBlob(base64);
    if (blob.type === 'image/png') return blob;
    return await convertBlobToPng(blob);
}

async function convertBlobToPng(blob: Blob): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    if ('createImageBitmap' in window) {
        const bitmap = await createImageBitmap(blob);
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        ctx.drawImage(bitmap, 0, 0);
    } else {
        const img = await blobToImage(blob);
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        ctx.drawImage(img, 0, 0);
    }

    return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((png) => {
            if (png) resolve(png);
            else reject(new Error('PNG conversion failed'));
        }, 'image/png');
    });
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Image decode failed'));
        };
        img.src = url;
    });
}
