# Overlay Copy & Images Feature Design

## Overview

Enhance the AutoBB floating overlay to support:
1. One-click copy for all profile fields
2. Image support (Logo + Screenshots) with both Base64 and URL formats
3. Drag-and-drop images to target websites
4. Visual click feedback using ripple effect

## Data Model Changes

### Profile Type Extension

```typescript
// src/types/index.ts
export interface Profile {
    // Existing fields
    id: string;
    name: string;
    domain: string;
    email: string;
    category: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    features: string[];
    tags: string[];
    pricing: string;
    customFields: Record<string, string>;

    // New image fields
    logoBase64?: string;           // Base64 encoded, for upload
    logoUrl?: string;              // URL, for URL input fields
    screenshotsBase64?: string[];  // Base64 array
    screenshotUrls?: string[];     // URL array
}
```

### Storage Considerations

- Base64 images increase storage size; Chrome storage.local limit ~5MB
- Recommendation: Logo max 500KB, each Screenshot max 1MB
- Add image compression/size limits in ProfileEditor

## UI Layout

### Expanded Panel Structure

```
┌─────────────────────────────────────┐
│ ⚡ AutoBB                      [✕]  │  ← Header (draggable)
├─────────────────────────────────────┤
│ ACTIVE PROFILE                      │
│ [▼ Profile dropdown selector     ]  │
├─────────────────────────────────────┤
│ 📋 PROFILE FIELDS                   │  ← New: Copyable fields
│ ┌─────────────────────────────────┐ │
│ │ Name         Product Name [Copy]│ │
│ │ Title        Tagline      [Copy]│ │
│ │ Short Desc   Brief...     [Copy]│ │
│ │ Long Desc    Detailed...  [Copy]│ │
│ │ Email        xxx@xx.com   [Copy]│ │
│ │ Domain       example.com  [Copy]│ │
│ │ Pricing      Free         [Copy]│ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 🖼️ IMAGES                           │  ← New: Images section
│ ┌─────────────────────────────────┐ │
│ │ Logo  [thumb] [CopyImg] [CopyURL]│ │  ← Draggable
│ │ Screenshots (3) [Expand ▼]      │ │
│ │   [🖼️ First preview]            │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Detected Fields: 5                  │
│ [▶ Auto Fill]                       │
├─────────────────────────────────────┤
│ 🚫 Disable on this site             │
└─────────────────────────────────────┘
```

### Component Structure

```
Overlay.tsx
├── ProfileSelector        (existing)
├── CopyableFieldList      (new)
│   └── CopyableField      (single field + copy button)
├── ImageSection           (new)
│   ├── LogoItem           (thumbnail + dual buttons)
│   └── ScreenshotList     (collapsible)
│       └── ScreenshotItem (thumbnail + dual buttons)
├── DetectedFieldsCard     (existing)
└── AutoFillButton         (existing)
```

## Interaction Behaviors

### 1. Text Field Copy

```typescript
const handleCopyText = async (value: string, fieldName: string) => {
  await navigator.clipboard.writeText(value);
  showToast(`${fieldName} copied`);
};
```

**Flow:**
1. User clicks [Copy] button
2. Button triggers ripple effect
3. Text written to clipboard
4. Brief success toast (1.5s)

### 2. Image Copy (Dual Buttons)

```typescript
// Copy image to clipboard (Base64 → Blob → Clipboard)
const handleCopyImage = async (base64: string) => {
  const blob = base64ToBlob(base64);
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ]);
  showToast('Image copied, use Cmd+V to paste');
};

// Copy URL to clipboard
const handleCopyUrl = async (url: string) => {
  await navigator.clipboard.writeText(url);
  showToast('URL copied');
};
```

### 3. Image Drag (with Clipboard Fallback)

```typescript
const handleDragStart = async (e: DragEvent, base64: string) => {
  const blob = base64ToBlob(base64);
  const file = new File([blob], 'image.png', { type: 'image/png' });

  // Add File object (this is what websites read)
  e.dataTransfer.items.add(file);
  e.dataTransfer.effectAllowed = 'copy';

  // Also copy to clipboard as fallback
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ]);
};
```

**Compatibility:**
- If website supports drag-and-drop upload → Our solution works
- If website only supports click-to-select → Use clipboard paste (Cmd+V)

### 4. Ripple Click Feedback

Using `@tracksuitdev/use-ripple` for Material Design ripple effect:

```typescript
import useRipple from '@tracksuitdev/use-ripple';

const CopyButton = ({ onClick, children }) => {
  const { styles, onClick: rippleClick } = useRipple({
    duration: 400,
  });

  return (
    <button
      onClick={(e) => { rippleClick(e); onClick(); }}
      className="relative overflow-hidden"
    >
      {children}
      {styles?.map((style, i) => (
        <span key={i} className="ripple" style={style} />
      ))}
    </button>
  );
};
```

## File Changes

### Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add image fields to Profile type |
| `src/content/Overlay.tsx` | Refactor to new UI layout |
| `src/popup/components/ProfileEditor.tsx` | Add image upload/URL input |
| `src/content/index.css` | Add ripple animation styles |
| `package.json` | Add `@tracksuitdev/use-ripple` |

### Files to Create

| File | Purpose |
|------|---------|
| `src/content/components/CopyableField.tsx` | Copyable field component |
| `src/content/components/ImageSection.tsx` | Images area (Logo + Screenshots) |
| `src/content/utils/clipboard.ts` | Clipboard utilities |
| `src/content/hooks/useRippleEffect.ts` | Custom ripple hook wrapper |

## Technical Notes

### Chrome Extension Permissions

Add to `manifest.json` if not present:
```json
{
  "permissions": ["clipboardWrite"]
}
```

### Image Processing Utility

```typescript
// Base64 to Blob (for clipboard image copy)
function base64ToBlob(base64: string): Blob {
  const [meta, data] = base64.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}
```

### Shadow DOM Considerations

- Ripple CSS must be injected into Shadow DOM
- All styles are already scoped within the extension's Shadow DOM

## Dependencies

```bash
npm install @tracksuitdev/use-ripple
```
