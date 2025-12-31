# Overlay Popup Theme Sync Design

## Goals and Visual Alignment

The overlay should visually match the popup regardless of the host page. The background must show the same green gradient surface as the popup, and typography must use the same font stack. This ensures the overlay doesn’t inherit page colors (which previously tinted the glass layers) and avoids fallback fonts in the content script. The collapsed FAB and header continue to use the mint accent gradient for interactive emphasis, but the panel body should read as a self‑contained glass surface with a controlled, consistent backdrop.

## Implementation Notes and Constraints

The overlay container gains a dedicated `overlay-panel` class that renders the popup gradient as a base layer and adds a semi‑transparent white overlay to mimic the popup glass surface. This makes card `backdrop-filter` effects blur the internal gradient instead of the host page. The `overlay-panel` class also handles border, radius, and shadow to match the main panel. Fonts are injected into the shadow root in the content script using the same Google Fonts URL as the popup HTML to ensure consistent typography. No page‑level background changes are introduced; only the overlay panel surface is adjusted. Tests should assert: (1) overlay uses `overlay-panel`, (2) the gradient layer exists in CSS, and (3) the content script injects the font link.
