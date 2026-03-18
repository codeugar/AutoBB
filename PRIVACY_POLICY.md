# AutoBB Privacy Policy

Last updated: March 18, 2026

AutoBB is a Chrome extension that helps users fill online submission forms faster.

## What data AutoBB handles

AutoBB may handle:

- Profile data entered by the user, such as name, email, website, category, descriptions, tags, features, and user cases.
- Optional images entered by the user (logo and screenshots).
- Extension settings, such as active profile, enabled/disabled sites, panel position, and custom AI prompt.
- The current tab hostname (domain) to apply per-site enable/disable settings.
- Form field information on the current page to detect matching inputs for autofill.
- Text selected by the user on a webpage, when the user triggers the AI explainer feature.
- Competitor domain names entered by the user for website traffic tracking.

## How AutoBB uses data

AutoBB uses this data only to provide extension features:

- Save and manage user profiles.
- Detect form fields and fill them with the selected profile.
- Copy text or images to the clipboard when the user clicks copy.
- Let users drag images to file upload areas.
- Remember extension preferences.
- Explain selected text using the AI explainer feature (requires user action).
- Display monthly website traffic trends for user-specified competitor domains.

## Data storage and transfer

- AutoBB stores profile data and settings locally in `chrome.storage.local` on the user's browser.
- AutoBB does not require an account.
- AutoBB does not sell user data.
- AutoBB does not share user data with third parties for advertising.
- AutoBB does not send user profile data to developer-owned servers.

AutoBB may load Google Fonts to display UI text. This request does not include user profile data.

### AI Explainer (Gemini API)

When the user selects text and triggers the AI explainer, the selected text is sent to the Google Gemini API to generate an explanation. This requires the user to provide their own Gemini API key, which is stored locally and sent only to Google's API endpoint (`https://generativelanguage.googleapis.com`). Data sent to Google is subject to [Google's Privacy Policy](https://policies.google.com/privacy). AutoBB does not store or transmit the selected text anywhere else.

### Website Traffic Tracker (SimilarWeb API)

When the user adds a competitor domain, AutoBB queries the SimilarWeb API (`https://data.similarweb.com`) to retrieve traffic data for that domain. This requires the user to provide their own SimilarWeb API key, stored locally. Data sent to SimilarWeb is subject to SimilarWeb's privacy policy. AutoBB does not store or transmit domain queries anywhere else.

## Permissions used

- `storage`: save profiles and settings locally.
- `activeTab`: read current tab URL to apply site-specific enable/disable status.
- `clipboardWrite`: copy text/images when user clicks copy actions.
- `contextMenus`: add a right-click menu option that appears when the user selects text, allowing them to trigger the AI explainer. The context menu does not collect, store, or transmit any data on its own.
- Host access (`<all_urls>`): detect and fill form fields on pages where the user uses AutoBB, and enable the AI explainer overlay on any page.

## User control

Users can:

- Edit or delete saved profiles at any time.
- Disable AutoBB globally or for specific sites.
- Remove all local data by uninstalling the extension.
- Choose not to provide a Gemini API key to disable the AI explainer feature.
- Choose not to provide a SimilarWeb API key to disable the website traffic tracker.

## Contact

For support or privacy questions:

- https://github.com/codeugar/AutoBB/issues
