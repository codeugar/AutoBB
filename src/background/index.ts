import { ensureSelectionContextMenu, registerSelectionContextMenu } from './contextMenu';

registerSelectionContextMenu(chrome);
ensureSelectionContextMenu(chrome);

console.log('Background service worker started');
