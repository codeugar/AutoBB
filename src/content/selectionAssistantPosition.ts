export type RectLike = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type TooltipPos = {
  left: number;
  top: number;
};

const BUTTON_SIZE = 28;
const VIEWPORT_MARGIN = 8;
const RECT_HORIZONTAL_OFFSET = 20;
const VERTICAL_OFFSET = 8;

const isFiniteNumber = (value: number) => Number.isFinite(value);

export function isVisibleRect(rect: RectLike | null | undefined): rect is RectLike {
  if (!rect) return false;

  return (
    isFiniteNumber(rect.left) &&
    isFiniteNumber(rect.top) &&
    isFiniteNumber(rect.right) &&
    isFiniteNumber(rect.bottom) &&
    isFiniteNumber(rect.width) &&
    isFiniteNumber(rect.height) &&
    (rect.width > 0 || rect.height > 0 || rect.right > rect.left || rect.bottom > rect.top)
  );
}

export function findAnchorRect(
  boundingRect: RectLike | null | undefined,
  clientRects: readonly RectLike[] = [],
): RectLike | null {
  if (isVisibleRect(boundingRect)) return boundingRect;

  for (const rect of clientRects) {
    if (isVisibleRect(rect)) return rect;
  }

  return null;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

export function computeTooltipPosition({
  rect,
  fallbackPoint,
  viewport,
}: {
  rect?: RectLike | null;
  fallbackPoint?: Point | null;
  viewport: Size;
}): TooltipPos | null {
  let rawLeft: number;
  let rawTop: number;

  if (isVisibleRect(rect)) {
    rawLeft = rect.right - RECT_HORIZONTAL_OFFSET;
    rawTop = rect.bottom + VERTICAL_OFFSET;
  } else if (
    fallbackPoint &&
    isFiniteNumber(fallbackPoint.x) &&
    isFiniteNumber(fallbackPoint.y)
  ) {
    rawLeft = fallbackPoint.x - BUTTON_SIZE / 2;
    rawTop = fallbackPoint.y + VERTICAL_OFFSET;
  } else {
    return null;
  }

  return {
    left: clamp(rawLeft, VIEWPORT_MARGIN, viewport.width - BUTTON_SIZE - VIEWPORT_MARGIN),
    top: clamp(rawTop, VIEWPORT_MARGIN, viewport.height - BUTTON_SIZE - VIEWPORT_MARGIN),
  };
}
