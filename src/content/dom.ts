export const domUtils = {
    // React 16+ hack to trigger onChange
    setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

        if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
        } else if (valueSetter) {
            valueSetter.call(element, value);
        } else {
            element.value = value;
        }

        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    },

    injectShadowWrapper(): { root: ShadowRoot, div: HTMLDivElement } {
        const id = 'autolink-extension-root';
        let host = document.getElementById(id);
        if (host) {
            return { root: host.shadowRoot!, div: host as HTMLDivElement };
        }

        host = document.createElement('div');
        host.id = id;
        host.style.position = 'fixed';
        host.style.zIndex = '2147483647'; // Max z-index
        host.style.top = '0';
        host.style.left = '0';
        host.style.width = '0';
        host.style.height = '0';
        host.style.overflow = 'visible';

        const shadow = host.attachShadow({ mode: 'open' });
        document.body.appendChild(host);

        // Inject styles into shadow DOM if possible, or we just rely on inline styles for the Overlay
        // Ideally we fetch the CSS built by Vite and inject it here

        return { root: shadow, div: host as HTMLDivElement };
    }
};
