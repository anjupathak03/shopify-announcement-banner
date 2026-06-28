# Shopify Announcement Banner

MERN-style Shopify app for managing a store-wide announcement banner. The embedded Shopify Admin app saves announcement text to MongoDB for audit history, syncs the live value to a shop metafield with the Admin GraphQL API, and displays it on the storefront through a Theme App Extension app embed block.

Deployed app: https://shopify-announcement-banner-1rs3.onrender.com



https://github.com/user-attachments/assets/fc204820-f01e-47d2-aa44-90a67f601005



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


