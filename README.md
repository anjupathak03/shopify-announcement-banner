# Shopify Announcement Banner

MERN-style Shopify app for managing a store-wide announcement banner. The embedded Shopify Admin app saves announcement text to MongoDB Atlas for audit history, syncs the live value to a Shopify shop metafield with the Admin GraphQL API, and displays it on the storefront through a Theme App Extension app embed block.

## Live Links

- Public GitHub repository: `https://github.com/anjupathak03/shopify-announcement-banner`
- Deployed Render app: `https://shopify-announcement-banner-1rs3.onrender.com`
- Health check: `https://shopify-announcement-banner-1rs3.onrender.com/healthz`
- Shopify Admin app: `https://admin.shopify.com/store/announcement-banner-test-hxju0hhe/apps/announcement-banner-anju`

The Render URL hosts the production web app and backend. The editable dashboard must be opened from Shopify Admin because Shopify provides the authenticated shop session there.

## What This Does

This app lets a Shopify merchant manage a store-wide announcement banner from inside Shopify Admin.

Working flow:

1. Merchant types announcement text in the embedded Shopify Admin app.
2. The Render-hosted Express backend saves the text and timestamp in MongoDB Atlas.
3. The backend syncs the latest text to a Shopify shop metafield.
4. The theme app extension app embed reads that metafield in Liquid.
5. The storefront displays the saved announcement banner on every page.

Architecture:

```text
Shopify Admin dashboard
-> App Bridge authenticated fetch
-> Render Express API
-> MongoDB Atlas audit record
-> Shopify shop metafield
-> Liquid app embed
-> Online Store banner
```

## Verified Demo Flow

Use this path for the required 2-3 minute video demo:

1. Open the Shopify Admin app from **Apps > Announcement Banner**.
2. Type a message such as `Sale 50% Off`.
3. Click **Save**.
4. Show the success message: `Announcement saved and synced`.
5. Open MongoDB Atlas and show the new record in `shopify_announcement_banner > announcements`.
6. Open **Online Store > Themes > Edit theme**.
7. In the theme editor, open **App embeds**.
8. Enable **Announcement Banner** and click **Save**.
9. Show the Online Store preview displaying the same saved message.

Verified proof:

- Shopify Admin app successfully saved announcement text.
- Audit History shows saved rows with `Synced` status.
- MongoDB Atlas stores announcement records with timestamp and sync status.
- Theme app embed displays the saved metafield value on the storefront preview.

Proof screenshot:

![Shopify Admin save and storefront app embed proof](https://github.com/user-attachments/assets/fc204820-f01e-47d2-aa44-90a67f601005)

## Shopify Metafield

The storefront bridge is a shop metafield:

- namespace: `my_app`
- key: `announcement`
- type: `single_line_text_field`
- Liquid path: `shop.metafields.my_app.announcement.value`

The backend also ensures a shop metafield definition exists with storefront read access before writing:

- owner type: `SHOP`
- access: `storefront: PUBLIC_READ`

## Requirements

- Node.js 20+
- Shopify Partner account
- Shopify development store
- MongoDB Atlas cluster, local MongoDB, or Docker
- Shopify CLI

## Local Setup

```bash
cd /home/anju/shopify-announcement-banner
npm install
cp .env.example .env
```

Fill `.env` with your Shopify app client ID, client secret, public app URL, and MongoDB connection.

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

If MongoDB is already installed on your laptop, start it with:

```bash
mkdir -p data/mongodb
mongod --dbpath ./data/mongodb --bind_ip 127.0.0.1 --port 27017
```

Keep that terminal open while the app runs, and use this MongoDB value in `.env`:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=shopify_announcement_banner
```

For local MongoDB with Docker:

```bash
docker compose up -d mongo mongo-express
```

Use this MongoDB value in `.env`:

```bash
MONGODB_URI=mongodb://admin:password@127.0.0.1:27017
MONGODB_DB_NAME=shopify_announcement_banner
```

Mongo Express will be available at:

```text
http://localhost:8081
```

Open it during the demo to show records in the `announcements` collection.

Then run:

```bash
npm run dev:shopify
```

Shopify CLI will ask you to log in, choose your Partner organization, connect/create an app, and select a development store.

## Theme App Embed

The theme app extension is already in:

```text
extensions/announcement-banner
```

After `shopify app dev` starts, open the theme editor, go to **App embeds**, enable **Announcement Banner**, and save.

For the deployed app, open Shopify Admin:

```text
Online Store -> Themes -> Edit theme -> App embeds -> Announcement Banner
```

Important notes:

- The left-side **Header > Announcement bar** section in Dawn is Shopify's native announcement bar. It is not this app.
- This app is enabled from **App embeds > Announcement Banner**.
- If the app embed was enabled before a new extension version was deployed, toggle the app embed off, save, toggle it on, and save again.
- For the main theme, deploy/release the theme app extension with `shopify app deploy --allow-updates`. The local `shopify app dev` preview can use a separate development host theme.

## Deployment

The production app is deployed on Render:

```text
https://shopify-announcement-banner-1rs3.onrender.com
```

Render runs:

```bash
npm ci && npm run build
npm start
```

Production environment:

```bash
NODE_ENV=production
SHOPIFY_API_VERSION=2026-04
SCOPES=write_products,read_themes
HOST=https://shopify-announcement-banner-1rs3.onrender.com
MONGODB_DB_NAME=shopify_announcement_banner
```

Secret values such as `SHOPIFY_API_SECRET` and `MONGODB_URI` are stored in Render environment variables and are not committed to the repository.

Shopify app configuration points to Render:

```text
application_url = "https://shopify-announcement-banner-1rs3.onrender.com"
redirect_url = "https://shopify-announcement-banner-1rs3.onrender.com/api/auth/callback"
```

## Troubleshooting

- The direct Render URL is not where merchants save text. It is the deployed host/status page. Open the dashboard from Shopify Admin.
- If Shopify says the app cannot load because of cookies, use a normal browser window and allow third-party cookies for Shopify and the Render domain.
- If the theme preview does not show the banner, go to **Online Store > Themes > Edit theme > App embeds**, toggle **Announcement Banner** off and on, then save.
- If Shopify Admin shows a stale dev preview, click **Clean dev preview** in the bottom Dev Console and hard refresh.

## Submission Checklist

Include these in the email submission:

- Public GitHub repository: `https://github.com/anjupathak03/shopify-announcement-banner`
- Deployed application: `https://shopify-announcement-banner-1rs3.onrender.com`
- Short video showing Admin save, MongoDB record, and Online Store preview banner.
- Updated resume.
