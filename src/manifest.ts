import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
    name: 'AutoLink',
    description: 'Auto-fill submission forms with profile data',
    version: '1.0.0',
    manifest_version: 3,
    action: {
        default_popup: 'src/popup/index.html',
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
