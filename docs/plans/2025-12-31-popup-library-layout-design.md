# Popup Library Layout Refresh

## Goals
- Remove the nested container look in the Library/Profiles section.
- Make list items feel edge-to-edge and less cramped.
- Use whitespace and soft separators instead of heavy borders or panels.
- Hide scrollbars by default and reveal them on hover or scroll.

## Non-Goals
- Change overall popup size or header/footer layout.
- Redesign the editor view beyond scroll behavior.

## Layout Decisions
- Render the Library list directly on the main modal background.
- Keep the editor view wrapped in the existing inner panel for focus.
- Reduce container padding in the list view and rely on internal item padding.

## Visual Styling
- List items become full-width rows with internal padding.
- Remove thick card backgrounds and borders from list items.
- Add a soft gradient separator per row (transparent to subtle to transparent).
- Use hover-only surface glow to indicate interactivity.

## Scrollbar Behavior
- Default scrollbar thumb is fully transparent.
- Scrollbar becomes visible on hover or active scrolling.
- Use a short decay (approx 800ms) to fade out after scrolling.

## Implementation Notes
- Update App.tsx to conditionally wrap only the editor view.
- Adjust ProfileList styles for full-bleed layout and separators.
- Add scroll state to list/editor containers to toggle scroll visibility.
- Update custom-scrollbar CSS for hover/scroll visibility.
