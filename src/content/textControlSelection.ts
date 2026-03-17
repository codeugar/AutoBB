import { isVisibleRect, type RectLike } from './selectionAssistantPosition.js';

const SUPPORTED_INPUT_TYPES = new Set(['', 'text', 'search', 'url', 'tel', 'email', 'password']);

const MIRROR_STYLE_PROPERTIES = [
  'box-sizing',
  'width',
  'height',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-style',
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'font-stretch',
  'font-variant',
  'font-kerning',
  'font-feature-settings',
  'font-variation-settings',
  'line-height',
  'letter-spacing',
  'text-transform',
  'text-indent',
  'text-align',
  'text-rendering',
  'text-decoration',
  'text-shadow',
  'word-spacing',
  'tab-size',
  'direction',
];

type TextControlElement = HTMLInputElement | HTMLTextAreaElement;

export type TextControlSelection = {
  text: string;
  start: number;
  end: number;
  rect: RectLike | null;
};

type TextControlLike = Pick<TextControlElement, 'tagName' | 'value' | 'selectionStart' | 'selectionEnd'> & {
  type?: string;
};

type MeasureSelectionRect = (
  control: TextControlElement,
  selection: { start: number; end: number; text: string },
) => RectLike | null;

const isTextControlLike = (value: unknown): value is TextControlLike => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<TextControlLike>;
  if (typeof candidate.tagName !== 'string' || typeof candidate.value !== 'string') return false;
  if (candidate.selectionStart !== null && typeof candidate.selectionStart !== 'number') return false;
  if (candidate.selectionEnd !== null && typeof candidate.selectionEnd !== 'number') return false;

  if (candidate.tagName.toUpperCase() === 'TEXTAREA') return true;
  if (candidate.tagName.toUpperCase() !== 'INPUT') return false;

  const type = typeof candidate.type === 'string' ? candidate.type.toLowerCase() : '';
  return SUPPORTED_INPUT_TYPES.has(type);
};

export function findTextControlTarget(target: EventTarget | null): TextControlElement | null {
  const fromTarget =
    target instanceof Element ? target.closest('input, textarea') : null;

  if (isTextControlLike(fromTarget)) return fromTarget as TextControlElement;
  if (document.activeElement && isTextControlLike(document.activeElement)) {
    return document.activeElement as TextControlElement;
  }

  return null;
}

const copyMirrorStyles = (source: CSSStyleDeclaration, mirror: HTMLElement) => {
  for (const property of MIRROR_STYLE_PROPERTIES) {
    mirror.style.setProperty(property, source.getPropertyValue(property));
  }
};

export function measureTextControlSelectionRect(
  control: TextControlElement,
  selection: { start: number; end: number; text: string },
): RectLike | null {
  const doc = control.ownerDocument;
  const win = doc?.defaultView;
  if (!doc?.body || !win) return null;

  const controlRect = control.getBoundingClientRect();
  if (!isVisibleRect(controlRect)) return null;

  const computedStyle = win.getComputedStyle(control);
  const mirror = doc.createElement('div');
  const content = doc.createElement('div');
  const selectedSpan = doc.createElement('span');

  mirror.setAttribute('aria-hidden', 'true');
  mirror.style.position = 'fixed';
  mirror.style.left = `${controlRect.left}px`;
  mirror.style.top = `${controlRect.top}px`;
  mirror.style.width = `${controlRect.width}px`;
  mirror.style.height = `${controlRect.height}px`;
  mirror.style.visibility = 'hidden';
  mirror.style.pointerEvents = 'none';
  mirror.style.overflow = 'hidden';
  mirror.style.zIndex = '-1';

  copyMirrorStyles(computedStyle, mirror);

  content.style.whiteSpace = control.tagName === 'TEXTAREA' ? 'pre-wrap' : 'pre';
  content.style.wordBreak = 'break-word';
  content.style.overflowWrap = 'break-word';
  content.style.transform = `translate(${-control.scrollLeft}px, ${-control.scrollTop}px)`;
  content.style.transformOrigin = 'top left';
  content.style.minHeight = '100%';

  content.append(doc.createTextNode(control.value.slice(0, selection.start)));

  selectedSpan.textContent = selection.text;
  content.append(selectedSpan);

  content.append(doc.createTextNode(control.value.slice(selection.end)));
  mirror.append(content);

  doc.body.append(mirror);

  try {
    const rect = selectedSpan.getBoundingClientRect();
    if (!isVisibleRect(rect)) return null;

    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  } finally {
    mirror.remove();
  }
}

export function getTextControlSelection(
  control: unknown,
  measureSelectionRect: MeasureSelectionRect = measureTextControlSelectionRect,
): TextControlSelection | null {
  if (!isTextControlLike(control)) return null;

  const start = control.selectionStart;
  const end = control.selectionEnd;
  if (typeof start !== 'number' || typeof end !== 'number') return null;

  const normalizedStart = Math.min(start, end);
  const normalizedEnd = Math.max(start, end);
  if (normalizedStart === normalizedEnd) return null;

  const text = control.value.slice(normalizedStart, normalizedEnd);
  if (!text) return null;

  return {
    text,
    start: normalizedStart,
    end: normalizedEnd,
    rect: measureSelectionRect(control as TextControlElement, {
      start: normalizedStart,
      end: normalizedEnd,
      text,
    }),
  };
}
