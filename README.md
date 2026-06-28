# Shopify Announcement Banner

MERN-style Shopify app for managing a store-wide announcement banner. The embedded Shopify Admin app saves announcement text to MongoDB for audit history, syncs the live value to a shop metafield with the Admin GraphQL API, and displays it on the storefront through a Theme App Extension app embed block.

## Architecture

Admin dashboard -> App Bridge authenticated fetch -> Express API -> MongoDB audit record -> Shopify shop metafield -> Liquid app embed -> storefront banner

The metafield is:

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

Important notes:

- The left-side **Header > Announcement bar** section in Dawn is Shopify's native announcement bar. It is not this app.
- This app is enabled from **App embeds > Announcement Banner**.
- If the app embed was enabled before a new extension version was deployed, toggle the app embed off, save, toggle it on, and save again.
- For the main theme, deploy/release the theme app extension with `shopify app deploy --allow-updates`. The local `shopify app dev` preview can use a separate development host theme.

## Deployment

For Render:

- Connect this GitHub repo to a new Render **Web Service**, or use the included `render.yaml` as a Render Blueprint.
- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Health check path: `/healthz`
- Environment variables:

```bash
NODE_ENV=production
SHOPIFY_API_KEY=your-client-id
SHOPIFY_API_SECRET=your-client-secret
SHOPIFY_API_VERSION=2026-04
SCOPES=write_products,read_themes
HOST=https://your-render-service.onrender.com
MONGODB_URI=your-mongodb-atlas-connection-string
MONGODB_DB_NAME=shopify_announcement_banner
```

Use MongoDB Atlas for the deployed database. Do not upload `.env`; paste these values into Render's environment settings.

After Render gives you the live URL, update:

- `application_url` in `shopify.app.toml`
- `[auth].redirect_urls` to `https://your-render-service.onrender.com/api/auth/callback`
- `HOST` in Render to the same Render URL

Then run:

```bash
shopify app deploy --allow-updates
```

Commit and push the `shopify.app.toml` URL change after the Render URL is known.

If the storefront does not show the banner after deployment, re-enable the app embed in the theme editor:

1. Open **Online Store > Themes > Customize**.
2. Open **App embeds**.
3. Turn **Announcement Banner** off and save.
4. Turn **Announcement Banner** on and save.
5. Refresh the storefront preview.

## Demo Checklist

1. Open the app in Shopify Admin.
2. Type `Sale 50% Off` in **Announcement Text**.
3. Click **Save**.
4. Show the new MongoDB `announcements` record.
5. Confirm **App embeds > Announcement Banner** is enabled in the theme editor.
6. Open Online Store preview and show the floating banner.
7. Mention that Liquid reads Shopify metafields directly, so the storefront does not call your database.

## Proof of Work

The implementation has been verified with:

- Shopify Admin embedded app showing **Announcement saved and synced**.
- Audit history showing saved announcement records with `Synced` status.
- Theme editor **App embeds > Announcement Banner** enabled.
- Storefront/theme preview rendering the saved announcement text, for example `Sale 40% Off`, from `shop.metafields.my_app.announcement.value`.

Recommended demo screenshots:

- Admin app save success and audit history.
- Theme editor app embed panel with the banner visible at the top of the preview.

## GitHub Push

This repo ignores local secrets and generated files such as `.env`, `.shopify/`, `node_modules/`, `client/dist/`, and local MongoDB data.

```bash
git init
git add .
git commit -m "Build Shopify announcement banner app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shopify-announcement-banner.git
git push -u origin main
```
