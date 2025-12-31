# Overlay Accent Header Alignment Design

## Goals and Visual Alignment

The overlay FAB and expanded header should visually match the popup’s clean glass theme by adopting the same mint accent treatment used for primary actions. The collapsed floating button should read as a clear interactive anchor, using the mint gradient (`linear-gradient(to right, #059669, #10B981)`) with white iconography and a soft green glow, mirroring the popup’s action buttons. The expanded overlay header should shift from neutral glass to the same accent gradient to create a consistent “action surface” across the extension. This header remains draggable, but now behaves as a branded top bar; therefore, label and controls use white or near‑white text to maintain contrast against the gradient. Borders stay translucent white to keep the glass vocabulary intact without introducing new hues. No blue/purple tokens are allowed; all emphasis comes from the mint gradient and white overlays.

## Implementation Notes and Constraints

Implementation keeps the panel body glass (`.glass-panel`) and cards (`.glass-card`) unchanged so the hierarchy remains stable. Only the collapsed FAB and expanded header receive `accent-gradient`, with header text updated to white and icon containers using semi‑transparent white backgrounds plus a thin white border to preserve depth on the gradient. A dedicated `overlay-header` class is added to the header container for theme audits and tests, ensuring the header always uses `accent-gradient`. This change avoids layout impact: no size changes, no new scrolling behavior, no modifications to drag logic or persistence. Tests should assert the presence of `accent-gradient` on the overlay header and continue to enforce the global “no blue/purple” rule to prevent regressions.
