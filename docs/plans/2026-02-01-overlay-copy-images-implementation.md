# Overlay Copy & Images - 修订实现计划

## 问题修复清单

| 级别 | 问题 | 解决方案 |
|------|------|----------|
| Critical | 目标"all fields"但缺少 features/customFields | 添加 features 数组逐项复制 + customFields 键值对复制 |
| High | 缺少 manifest.json clipboardWrite 权限 | 添加权限 + 能力检测 fallback |
| High | 无自动化测试 | 添加 clipboard 工具函数单元测试 |
| Medium | 存储配额风险 | 添加总量上限检查 + 截图数量限制(最多5张) |
| Medium | 拖拽缺少错误处理 | 添加 try-catch + 用户提示 |
| Medium | Screenshot 数组索引错配 | 改用统一数据模型 `Screenshot { base64?, url? }` |
| Medium | Task 10 过大 | 拆分为 4 个原子任务 |

---

## 数据模型修订

```typescript
// src/types/index.ts
export interface Screenshot {
    base64?: string;
    url?: string;
}

export interface Profile {
    // 现有字段...
    logoBase64?: string;
    logoUrl?: string;
    screenshots?: Screenshot[];  // 统一数据模型，避免索引错配
}
```

---

## 任务清单 (修订后)

### Task 1: 添加 Clipboard 权限到 Manifest
**文件:** `src/manifest.ts`
**时间:** 2-3 分钟

添加 `clipboardWrite` 权限：
```typescript
permissions: ['storage', 'activeTab', 'scripting', 'clipboardWrite'],
```

---

### Task 2: 更新 Profile 类型
**文件:** `src/types/index.ts`
**时间:** 3-5 分钟

```typescript
export interface Screenshot {
    base64?: string;
    url?: string;
}

export interface Profile {
    // 现有字段保持不变
    id: string;
    name: string;
    // ...

    // 新增图片字段
    logoBase64?: string;
    logoUrl?: string;
    screenshots?: Screenshot[];
}
```

---

### Task 3: 创建 Clipboard 工具函数 + 单元测试
**文件:**
- `src/content/utils/clipboard.ts`
- `src/content/utils/clipboard.test.ts`
**时间:** 5 分钟

**关键改进：**
- 添加能力检测 `isClipboardSupported()`
- 添加 fallback 到 `document.execCommand('copy')`
- 添加错误处理和用户友好提示

```typescript
// clipboard.ts
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
```

**测试文件 (clipboard.test.ts):**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { base64ToBlob, isClipboardSupported } from './clipboard';

describe('clipboard utils', () => {
    describe('base64ToBlob', () => {
        it('should convert valid base64 to blob', () => {
            const base64 = 'data:image/png;base64,iVBORw0KGgo=';
            const blob = base64ToBlob(base64);
            expect(blob).toBeInstanceOf(Blob);
            expect(blob.type).toBe('image/png');
        });

        it('should default to image/png for invalid mime', () => {
            const base64 = 'data:;base64,iVBORw0KGgo=';
            const blob = base64ToBlob(base64);
            expect(blob.type).toBe('image/png');
        });
    });
});
```

---

### Task 4: 添加 Ripple CSS 样式
**文件:** `src/content/index.css`
**时间:** 2-3 分钟

(与原计划相同)

---

### Task 5: 创建 CopyableField 组件
**文件:** `src/content/components/CopyableField.tsx`
**时间:** 3-5 分钟

**关键改进：**
- 显示复制失败错误提示
- 支持多行文本（如 features）

---

### Task 6: 创建 ImageItem 组件 (带错误处理)
**文件:** `src/content/components/ImageItem.tsx`
**时间:** 5 分钟

**关键改进 - 拖拽错误处理：**
```typescript
const handleDragStart = async (e: React.DragEvent) => {
    if (!base64) return;

    try {
        const file = base64ToFile(base64, `${label.toLowerCase()}.png`);
        e.dataTransfer.items.add(file);
        e.dataTransfer.effectAllowed = 'copy';

        // 同时复制到剪贴板作为备用
        const result = await copyImage(base64);
        if (!result.success) {
            console.warn('Clipboard fallback failed:', result.error);
        }
    } catch (err) {
        console.error('Drag start failed:', err);
        // 拖拽失败时提示用户使用复制按钮
        setDragError('Drag failed, please use copy button');
        setTimeout(() => setDragError(null), 3000);
    }
};
```

---

### Task 7: 创建 ScreenshotList 组件 (统一数据模型)
**文件:** `src/content/components/ScreenshotList.tsx`
**时间:** 3-5 分钟

**关键改进 - 使用统一数据模型：**
```typescript
interface ScreenshotListProps {
    screenshots?: Screenshot[];  // 统一模型，不再是两个数组
}

export const ScreenshotList: React.FC<ScreenshotListProps> = ({
    screenshots = [],
}) => {
    // 直接遍历，无索引错配风险
    return (
        <>
            {screenshots.map((shot, i) => (
                <ImageItem
                    key={i}
                    label={`Shot ${i + 1}`}
                    base64={shot.base64}
                    url={shot.url}
                />
            ))}
        </>
    );
};
```

---

### Task 8: 创建 ProfileFieldsSection (覆盖所有字段)
**文件:** `src/content/components/ProfileFieldsSection.tsx`
**时间:** 5 分钟

**关键改进 - 覆盖所有字段：**
```typescript
export const ProfileFieldsSection: React.FC<{ profile: Profile }> = ({ profile }) => {
    return (
        <div>
            {/* 基础字段 */}
            <CopyableField label="Name" value={profile.name} />
            <CopyableField label="Title" value={profile.title} />
            <CopyableField label="Short Desc" value={profile.shortDescription} />
            <CopyableField label="Long Desc" value={profile.longDescription} />
            <CopyableField label="Email" value={profile.email} />
            <CopyableField label="Domain" value={profile.domain} />
            <CopyableField label="Category" value={profile.category} />
            <CopyableField label="Pricing" value={profile.pricing} />

            {/* Tags */}
            {profile.tags.length > 0 && (
                <CopyableField label="Tags" value={profile.tags.join(', ')} />
            )}

            {/* Features - 逐项复制 */}
            {profile.features.filter(f => f.trim()).map((feature, i) => (
                <CopyableField key={i} label={`Feature ${i + 1}`} value={feature} />
            ))}

            {/* Custom Fields - 键值对复制 */}
            {Object.entries(profile.customFields).map(([key, value]) => (
                <CopyableField key={key} label={key} value={value} />
            ))}
        </div>
    );
};
```

---

### Task 9: 更新 Overlay.tsx
**文件:** `src/content/Overlay.tsx`
**时间:** 3-5 分钟

(与原计划相同)

---

### Task 10a: ProfileEditor - 添加图片状态
**文件:** `src/popup/components/ProfileEditor.tsx`
**时间:** 3 分钟

只添加状态和常量：
```typescript
const MAX_LOGO_SIZE = 500 * 1024;  // 500KB
const MAX_SCREENSHOT_SIZE = 1024 * 1024;  // 1MB
const MAX_SCREENSHOTS = 5;
const MAX_TOTAL_STORAGE = 4 * 1024 * 1024;  // 4MB (留 1MB 余量)

const [logoPreview, setLogoPreview] = useState<string | undefined>(profile?.logoBase64);
const [screenshots, setScreenshots] = useState<Screenshot[]>(profile?.screenshots || []);
```

---

### Task 10b: ProfileEditor - 添加 Logo 上传处理
**文件:** `src/popup/components/ProfileEditor.tsx`
**时间:** 3 分钟

```typescript
const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_LOGO_SIZE) {
        alert(`Logo must be under ${MAX_LOGO_SIZE / 1024}KB`);
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setFormData(prev => ({ ...prev, logoBase64: base64 }));
    };
    reader.readAsDataURL(file);
};
```

---

### Task 10c: ProfileEditor - 添加 Screenshot 上传处理 (带配额检查)
**文件:** `src/popup/components/ProfileEditor.tsx`
**时间:** 5 分钟

```typescript
const calculateTotalSize = (): number => {
    let total = 0;
    if (formData.logoBase64) total += formData.logoBase64.length;
    screenshots.forEach(s => {
        if (s.base64) total += s.base64.length;
    });
    return total;
};

const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // 检查数量限制
    if (screenshots.length + files.length > MAX_SCREENSHOTS) {
        alert(`Maximum ${MAX_SCREENSHOTS} screenshots allowed`);
        return;
    }

    files.forEach(file => {
        if (file.size > MAX_SCREENSHOT_SIZE) {
            alert(`${file.name} exceeds ${MAX_SCREENSHOT_SIZE / 1024 / 1024}MB limit`);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;

            // 检查总存储配额
            const newTotal = calculateTotalSize() + base64.length;
            if (newTotal > MAX_TOTAL_STORAGE) {
                alert('Total image storage limit exceeded (4MB max)');
                return;
            }

            const newScreenshot: Screenshot = { base64 };
            setScreenshots(prev => [...prev, newScreenshot]);
            setFormData(prev => ({
                ...prev,
                screenshots: [...(prev.screenshots || []), newScreenshot]
            }));
        };
        reader.readAsDataURL(file);
    });
};
```

---

### Task 10d: ProfileEditor - 添加图片上传 UI
**文件:** `src/popup/components/ProfileEditor.tsx`
**时间:** 5 分钟

添加 Logo 和 Screenshot 上传 UI 组件。

---

### Task 11: 安装依赖 + 运行测试
**时间:** 3 分钟

```bash
npm install @tracksuitdev/use-ripple
npm install -D vitest @testing-library/react
npm run test
npm run build
```

---

### Task 12: 端到端手动测试
**时间:** 10 分钟

测试清单：
- [ ] 所有字段（包括 features、customFields）都有复制按钮
- [ ] 复制成功显示 ripple 效果
- [ ] 复制失败显示错误提示
- [ ] Logo 上传限制 500KB
- [ ] Screenshot 上传限制 1MB/张，最多 5 张
- [ ] 总存储不超过 4MB
- [ ] 拖拽图片到支持的网站
- [ ] 拖拽失败时显示提示

---

## 关键文件清单

| 文件 | 操作 |
|------|------|
| `src/manifest.ts` | 修改 - 添加 clipboardWrite 权限 |
| `src/types/index.ts` | 修改 - 添加 Screenshot 类型和图片字段 |
| `src/content/utils/clipboard.ts` | 新建 - 剪贴板工具函数 |
| `src/content/utils/clipboard.test.ts` | 新建 - 单元测试 |
| `src/content/index.css` | 修改 - 添加 ripple 样式 |
| `src/content/components/CopyableField.tsx` | 新建 |
| `src/content/components/ImageItem.tsx` | 新建 |
| `src/content/components/ScreenshotList.tsx` | 新建 |
| `src/content/components/ProfileFieldsSection.tsx` | 新建 |
| `src/content/Overlay.tsx` | 修改 - 集成新组件 |
| `src/popup/components/ProfileEditor.tsx` | 修改 - 添加图片上传 |

---

## 验证方式

1. **单元测试:** `npm run test` - 验证 clipboard 工具函数
2. **构建检查:** `npm run build` - 无 TypeScript 错误
3. **手动测试:**
   - 加载扩展到 Chrome
   - 创建 Profile 并上传图片
   - 在 Overlay 中测试所有复制功能
   - 测试拖拽到 https://imgbb.com 等图片上传网站
