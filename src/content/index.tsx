import React from 'react';
import ReactDOM from 'react-dom/client';
import Overlay from './Overlay';
import { domUtils } from './dom';
// @ts-ignore
import cssUrl from '../index.css?inline'; // Using inline for Shadow DOM style injection

console.log('AutoLink content script initializing...');

const init = () => {
    const { root } = domUtils.injectShadowWrapper();

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
