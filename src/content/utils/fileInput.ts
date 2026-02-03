const isVisible = (el: HTMLElement): boolean => {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
};

export const findNearestFileInput = (target: Element | null): HTMLInputElement | null => {
    if (!target) return null;

    if (target instanceof HTMLInputElement && target.type === 'file') return target;

    const label = target.closest('label');
    if (label) {
        const forId = label.getAttribute('for');
        if (forId) {
            const byId = document.getElementById(forId);
            if (byId instanceof HTMLInputElement && byId.type === 'file') return byId;
        }
        const nested = label.querySelector('input[type="file"]');
        if (nested instanceof HTMLInputElement) return nested;
    }

    let el: Element | null = target;
    while (el) {
        const input = el.querySelector?.('input[type="file"]');
        if (input instanceof HTMLInputElement) return input;
        el = el.parentElement;
    }

    const inputs = Array.from(document.querySelectorAll('input[type="file"]')) as HTMLInputElement[];
    return inputs.find((input) => isVisible(input)) ?? null;
};

export const setFileInput = (input: HTMLInputElement, file: File) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
};
