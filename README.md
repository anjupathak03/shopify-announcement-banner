# Shopify Announcement Banner

A MERN-style Shopify app for managing a store-wide announcement banner from Shopify Admin. The app stores an audit history in MongoDB, syncs the active announcement to a Shopify shop metafield, and renders the banner on the storefront through a Theme App Extension app embed.

## Overview

The project demonstrates the required Shopify data flow:

```text
Shopify Admin dashboard
-> App Bridge authenticated request
-> Express API on Render
-> MongoDB audit record
-> Shopify Admin GraphQL metafield sync
-> Liquid app embed
-> Online Store banner
```

## Live Deployment

- Public repository: `https://github.com/anjupathak03/shopify-announcement-banner`
- Render application host: `https://shopify-announcement-banner-1rs3.onrender.com`
- Health check: `https://shopify-announcement-banner-1rs3.onrender.com/healthz`

The Render URL hosts the production backend and frontend assets. The merchant dashboard is an embedded Shopify Admin experience and must be opened from an installed Shopify development store, where Shopify provides the authenticated shop session. The Shopify Admin URL for a development store is private and is not expected to be publicly accessible.

## Demo

The demo shows the full flow: saving an announcement from the embedded Shopify Admin app, verifying the MongoDB audit record, and displaying the synced message in the Online Store preview.

Demo video: `https://github.com/user-attachments/assets/fc204820-f01e-47d2-aa44-90a67f601005`

## Features

- Embedded Shopify Admin dashboard built with React and Polaris.
- Announcement text input with save confirmation and validation.
- MongoDB audit history with saved text, timestamp, shop, and sync status.
- Shopify Admin GraphQL sync to a shop metafield.
- Theme App Extension app embed that displays the current metafield value on every storefront page.
- Render production deployment with a health check endpoint.

## Tech Stack

- React
- Shopify Polaris
- Shopify App Bridge
- Node.js
- Express
- MongoDB / MongoDB Atlas
- Shopify Admin GraphQL API
- Shopify Theme App Extension
- Liquid
- Render

## Metafield Contract

The storefront bridge uses a shop metafield:

- namespace: `my_app`
- key: `announcement`
- type: `single_line_text_field`
- Liquid path: `shop.metafields.my_app.announcement.value`

The backend ensures the shop metafield definition exists with storefront read access before writing the active announcement value.

## Repository Structure

```text
client/                         React admin dashboard
server/                         Express API, MongoDB models, Shopify API helpers
extensions/announcement-banner  Theme App Extension app embed
shopify.app.toml                Shopify app configuration
render.yaml                     Render deployment configuration
```

## Local Development

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Required environment variables:

```bash
SHOPIFY_API_KEY=your-client-id
SHOPIFY_API_SECRET=your-client-secret
SHOPIFY_API_VERSION=2026-04
SCOPES=write_products,read_themes
HOST=https://your-public-app-url.example.com
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=shopify_announcement_banner
NODE_ENV=development
```

Run MongoDB locally or with Docker Compose:

```bash
docker compose up -d mongo mongo-express
```

For Docker Compose, use:

```bash
MONGODB_URI=mongodb://admin:password@127.0.0.1:27017
MONGODB_DB_NAME=shopify_announcement_banner
```

Start the Shopify development server:

```bash
npm run dev:shopify
```

The Shopify CLI will prompt for Partner account authentication, app selection, and development store selection.

## Theme App Embed

The Theme App Extension is located at:

```text
extensions/announcement-banner
```

Enable the storefront banner in Shopify Admin:

```text
Online Store -> Themes -> Edit theme -> App embeds -> Announcement Banner -> Save
```

The app embed reads the shop metafield in Liquid and renders the announcement across storefront pages. Shopify's native Dawn announcement bar is separate from this app and is not required for the extension to work.

## Production Deployment

The production app is deployed on Render:

```text
https://shopify-announcement-banner-1rs3.onrender.com
```

Render build and start commands:

```bash
npm ci && npm run build
npm start
```

Production environment variables:

```bash
NODE_ENV=production
SHOPIFY_API_KEY=your-client-id
SHOPIFY_API_SECRET=your-client-secret
SHOPIFY_API_VERSION=2026-04
SCOPES=write_products,read_themes
HOST=https://shopify-announcement-banner-1rs3.onrender.com
MONGODB_URI=your-mongodb-atlas-connection-string
MONGODB_DB_NAME=shopify_announcement_banner
```

Secret values are stored in Render environment variables and are not committed to the repository.

The Shopify app configuration points to the Render deployment:

```text
application_url = "https://shopify-announcement-banner-1rs3.onrender.com"
redirect_url = "https://shopify-announcement-banner-1rs3.onrender.com/api/auth/callback"
```

After changing Shopify app URLs or extension configuration, deploy the Shopify app:

```bash
npx shopify app deploy --allow-updates
```

## Verification Flow

A complete demo should show:

1. Open the embedded app from Shopify Admin.
2. Enter an announcement such as `Sale 50% Off`.
3. Click **Save** and show the success state.
4. Show the new audit record in MongoDB Atlas under `shopify_announcement_banner > announcements`.
5. Open the Shopify theme editor and enable the **Announcement Banner** app embed.
6. Show the saved message rendering in the Online Store preview.

## Troubleshooting

- The direct Render URL is a deployment host/status page, not the merchant save flow. Announcement saves require the embedded Shopify Admin context.
- If Shopify Admin reports a cookie-related load error, allow third-party cookies for Shopify and the Render domain or use a browser profile where Shopify embedded apps are allowed.
- If the storefront preview does not show the banner, toggle **Announcement Banner** off and on in **App embeds**, then save the theme.
- If a development preview appears stale, use **Clean dev preview** in the Shopify CLI Dev Console and refresh the Shopify Admin page.

## Scripts

```bash
npm run dev:shopify   # Start Shopify CLI development mode
npm run dev           # Run local Express and Vite servers
npm run build         # Build production frontend assets
npm start             # Start the Express production server
npm test              # Run Node test runner
```
