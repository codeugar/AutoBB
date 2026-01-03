import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
    name: 'AutoBB',
    description: 'Auto-fill submission forms with profile data',
    version: '1.0.0',
    manifest_version: 3,
    icons: {
        '16': 'icon16.png',
        '32': 'icon32.png',
        '48': 'icon48.png',
        '128': 'icon128.png',
    },
    action: {
        default_popup: 'src/popup/index.html',
        default_icon: {
            '16': 'icon16.png',
            '32': 'icon32.png',
            '48': 'icon48.png',
        },
    },
    permissions: ['storage', 'activeTab', 'scripting'],
    background: {
        service_worker: 'src/background/index.ts',
        type: 'module',
    },
    content_scripts: [
        {
            matches: ['<all_urls>'],
            js: ['src/content/index.tsx'],
            run_at: 'document_end',
        },
    ],
})
