# Interview Guide

## What To Explain First

This app proves the required data flow:

Admin -> MongoDB -> Shopify Admin GraphQL API -> shop metafield -> Theme App Extension -> storefront

MongoDB is used for audit history. Shopify metafields are used as the storefront bridge because Liquid can read them directly.

## Key Concepts

- Shopify Partner account: where the app is created and configured.
- Development store: safe store used for installation and demo.
- Embedded app: React UI rendered inside Shopify Admin.
- OAuth/session storage: Shopify grants an access token; MongoDB session storage keeps it server-side.
- Admin GraphQL API: backend uses `metafieldsSet` to write the announcement.
- Shop metafield: global store-level custom data.
- Theme app extension: Shopify-hosted Liquid/CSS that integrates with themes.
- App embed block: renders globally, usually before `</body>`, and can float on every page.
- Liquid escaping: `{{ announcement | escape }}` prevents injected HTML from running.

## Save Flow

1. Merchant types text in the React/Polaris dashboard.
2. React sends `POST /api/announcement`.
3. Express validates the authenticated Shopify session.
4. Express creates a MongoDB audit record with `pending` sync status.
5. Express queries `shop { id }`.
6. Express calls `metafieldsSet` with:
   - `ownerId`: shop GID
   - `namespace`: `my_app`
   - `key`: `announcement`
   - `type`: `single_line_text_field`
   - `value`: entered text
7. MongoDB record is updated to `synced` or `failed`.
8. Liquid reads `shop.metafields.my_app.announcement.value`.

## Why Not ScriptTags

ScriptTags are legacy/deprecated for modern Online Store integrations. Theme app extensions are Shopify's current recommended path because they are versioned, theme-safe, merchant-controlled, and hosted by Shopify CDN.

## Questions You May Be Asked

**Why MongoDB if the storefront reads from Shopify?**  
MongoDB stores audit history and sync status. Shopify stores the live value used by the storefront.

**Why a shop metafield?**  
The announcement is store-wide, not product-specific, so the shop is the correct owner.

**What happens if Shopify sync fails?**  
The audit record is still saved with `failed` status and the error message, so the issue can be retried or debugged.

**Why GraphQL instead of REST?**  
Shopify is moving app development toward GraphQL. `metafieldsSet` is atomic and supports creating/updating metafields in one mutation.

**How does the theme display the text?**  
The app embed Liquid file reads the shop metafield and outputs an escaped banner.

**What would you improve for production?**  
Add retry logic, richer validation, tests, monitoring, uninstall cleanup, and a visible sync retry button.

## Demo Script

I built an embedded Shopify app using React, Polaris, Express, and MongoDB. When the merchant saves announcement text, the backend stores an audit record in MongoDB and syncs the current value to a shop metafield using Shopify Admin GraphQL. The storefront does not call my backend; the Theme App Extension app embed reads the metafield directly in Liquid and displays it as a floating banner on every page.
