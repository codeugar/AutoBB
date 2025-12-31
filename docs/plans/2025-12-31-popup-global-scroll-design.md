# Popup Global Scroll Design

## Goals
- Move scrolling from internal list/editor containers to the popup root.
- Make the scrollbar feel like it belongs to the entire popup.
- Keep the list layout full-bleed with soft separators.

## Non-Goals
- Change popup dimensions or typography.
- Redesign header/footer content.

## Layout Changes
- Make the outer popup container the scroll container.
- Wrap header, main content, and footer in a min-height flex column.
- Remove inner scroll areas from ProfileList and ProfileEditor.

## Scroll Behavior
- `custom-scrollbar` and `is-scrolling` live on the popup root.
- Scrollbar is hidden by default and fades in on hover or scroll.
- Scroll state is cleared after a short idle timeout.

## Visual Result
- The scrollbar appears on the right edge of the popup.
- Header, content, and footer scroll together as a single unit.
- List rows remain full-bleed with soft gradient separators.
