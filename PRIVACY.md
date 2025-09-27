# Shoujin Privacy Policy
Effective date: 2025-09-25

This Privacy Policy describes how the Shoujin browser extension (“Shoujin”, “the extension”, “we”, “our”, or “us”) handles information when you install and use the extension. We are committed to minimizing data collection and respecting your privacy.

If you have questions, please open an issue at the project repository: https://github.com/bluolightning/shoujin.

## Summary
- We do not sell your data.
- We do not use your data for targeted advertising.
- The extension stores settings and user-provided content locally in your browser.
- Network requests may occur to retrieve site icons/favicons. These requests inherently disclose your IP address and requested domains/URLs to the destination service.
- We strive to request only the minimum browser permissions required for the features you use.

## Scope
This policy covers the Shoujin browser extension and any data it processes. It does not cover third-party websites or services you may visit or interact with while using the web, even if the extension facilitates those interactions.

## Information We Collect
Shoujin is designed to operate with minimal data collection.

1) Data stored locally on your device
- Extension settings and preferences
- Any configuration or data you explicitly enter into the extension
- Cached assets (e.g., previously fetched favicons or thumbnails), if applicable

2) Network requests initiated by the extension
To deliver certain features, the extension may make network requests, for example:
- Fetching site metadata or icons/favicons

These requests necessarily expose standard network information to the destination (e.g., your IP address, user agent, timestamp, and the requested resource). Depending on your browser configuration, they may also transmit headers such as referrer and, in some cases, cookies associated with those domains.

3) Diagnostics and analytics
- The extension itself does not include built-in analytics or tracking that identifies you personally.
- Browser extension stores (e.g., Chrome Web Store, Firefox Add-ons) may provide us with aggregate, non-identifying installation and usage statistics. These platforms operate under their own privacy policies.

## What We Do NOT Collect
- We do not collect your browsing history. Only general domain names, and not the full URL path, are stored or used (eg. ```github.com``` and not ```github.com/bluolightning/shoujin```).
- We do not collect your passwords or authentication tokens.
- We do not read or collect page content, unless you take an explicit action that requires reading the active page for a feature you invoked (if applicable). In such cases, data is processed only to complete that action.

## External Favicon Services
To display icons for websites, the extension may request favicons from:
- The website directly (e.g., https://example.com/favicon.ico)
- Third-party favicon services such as (examples) Google S2 (https://www.google.com/s2/favicons) or DuckDuckGo Icons (https://icons.duckduckgo.com)

What is sent
- The domain name for which an icon is requested
- Standard network information (e.g., IP address, user agent, timestamp)
- Depending on your browser settings, additional headers (e.g., referrer); cookies for those services may be sent if your browser has them for the requested domain

What those services may do
- Respond with an icon resource
- Log requests per their own privacy policies
- Set or read cookies associated with their domains, subject to your browser’s cookie settings and the service’s policies

Why we use them
- To reliably display a recognizable icon for the websites you interact with inside the extension
- To avoid repeatedly requesting large or complex pages just to extract icons

Your choices
- You may block or filter requests to specific endpoints at the network level using content blockers, DNS filtering, or firewall rules.
- You can clear cookies for those services in your browser if you prefer they not be sent.
- If the extension offers a setting to disable external favicon services in the future, you will be able to use that option to reduce third-party requests. Absent such a setting, third-party requests may still occur when icon fetching is needed.

## Browser Permissions
Shoujin requests only the permissions needed for its features. If a permission is present, it is used solely to provide a related feature. You can review granted permissions in your browser’s extension manager.

## Data Sharing
- We do not sell or rent personal data.
- We do not share personal data with third parties except as necessary to provide the service (e.g., making a request to a favicon provider or to a site you direct us to contact), comply with law, or protect our rights.

## Data Retention
- Local data persists until you delete it, reset the extension, clear your browser data, or uninstall the extension.
- Network request logs on third-party services (e.g., favicon providers) are controlled by those services and subject to their privacy policies.

## Security
We take reasonable measures to protect information handled by the extension. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.

## International Transfers
Network requests may be routed through servers located in various countries. By using the extension, you acknowledge that your requests may be processed outside your country of residence and governed by different data protection laws.

## Children’s Privacy
The extension is not directed to children under 13, and we do not knowingly collect personal information from children.

## Your Rights and Choices
Depending on your jurisdiction, you may have rights to access, correct, or delete your personal data. Since the extension generally stores information locally on your device, you can typically exercise these rights by:
- Editing or deleting data within the extension UI
- Clearing the extension’s storage or resetting it
- Uninstalling the extension

For data held by third parties (e.g., favicon services, browser vendors), please contact those entities directly.

## Changes to This Policy
We may update this Privacy Policy from time to time. Changes will be posted in the project repository. For significant changes, we may also provide a notice within the extension's update notes or user interface. Your continued use of the extension after an update constitutes acceptance of the revised policy.

## Contact
If you have questions or concerns:
- Open an issue: https://github.com/bluolightning/shoujin/issues
- Alternatively, contact the repository owner via GitHub: https://github.com/bluolightning
