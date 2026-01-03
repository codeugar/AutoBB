import React from 'react';
import ReactDOM from 'react-dom/client';
import Overlay from './Overlay';
import { domUtils } from './dom';
// @ts-ignore
import cssUrl from '../index.css?inline'; // Using inline for Shadow DOM style injection

console.log('AutoBB content script initializing...');

const init = () => {
    const { root } = domUtils.injectShadowWrapper();

    if (!root.querySelector('link[data-autobb-fonts]')) {
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href =
            'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap';
        fontLink.setAttribute('data-autobb-fonts', 'true');
        root.appendChild(fontLink);
    }

    // Create a style element for the shadow DOM
    // Note: Vite in dev mode might inject styles differently, but strictly for production build of Extensions, 
    // inline css or fetching the CSS file is needed.
    // For `npm run dev` with HMR, it might be tricky. 
    // We'll try a simple approach: if cssUrl is a string (inline), use it.

    const style = document.createElement('style');
    style.textContent = cssUrl;
    root.appendChild(style);

    // Also need to inject a container for React
    const container = document.createElement('div');
    container.id = 'root';
    // Prevent popup layout styles from creating a click-blocking box on pages.
    container.style.width = '0';
    container.style.height = '0';
    container.style.minHeight = '0';
    container.style.maxHeight = 'none';
    container.style.overflow = 'visible';
    root.appendChild(container);

    ReactDOM.createRoot(container).render(
        <React.StrictMode>
            <Overlay />
        </React.StrictMode>
    );
};

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
