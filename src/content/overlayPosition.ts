export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export function clampPosition(
  position: Point,
  viewport: Size,
  element: Size,
  padding: number,
): Point {
  const maxX = Math.max(padding, viewport.width - element.width - padding);
  const maxY = Math.max(padding, viewport.height - element.height - padding);
  const x = Math.min(Math.max(padding, position.x), maxX);
  const y = Math.min(Math.max(padding, position.y), maxY);
  return { x, y };
}

export function snapPositionToEdge(
  position: Point,
  viewport: Size,
  element: Size,
  padding: number,
): Point {
  const clamped = clampPosition(position, viewport, element, padding);
  const maxX = Math.max(padding, viewport.width - element.width - padding);
  const distanceLeft = Math.abs(clamped.x - padding);
  const distanceRight = Math.abs(maxX - clamped.x);
  const x = distanceLeft <= distanceRight ? padding : maxX;
  return { x, y: clamped.y };
}

export function defaultPosition(viewport: Size, element: Size, padding: number): Point {
  const x = Math.max(padding, viewport.width - element.width - padding);
  const y = Math.max(padding, viewport.height - element.height - padding);
  return { x, y };
}
