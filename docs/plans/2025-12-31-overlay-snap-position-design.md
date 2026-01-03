# Overlay snap and persistence design

## Overview
Add left/right edge snapping for the content overlay drag handle and persist the last position globally across sites.

## Behavior
- Dragging is free-form within viewport bounds.
- On mouseup, the overlay snaps to the nearest left/right edge with a fixed padding.
- Vertical position remains where the user dropped it, clamped within the viewport.
- The same x/y position is used for collapsed and expanded states.

## Data flow
- Track drag start pointer and origin position.
- During drag, update position using clamp logic.
- On mouseup, compute snap position and update state.

## Storage
- Persist the final snapped position to `chrome.storage.local` under `overlay_position`.
- On mount, read the stored position and clamp/snap it to the current viewport.
- Fallback to a default bottom-right position if no stored value exists.

## Edge cases
- If the viewport is smaller than the overlay, clamp to padding.
- On resize or open/close, re-clamp and re-snap to keep the overlay on screen.

## Tests
- Unit tests cover clamp, snap, and default positioning behavior.
