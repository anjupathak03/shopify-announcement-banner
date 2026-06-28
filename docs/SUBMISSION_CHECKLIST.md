# Submission Checklist

## Before Recording

- Create Partner account at `partners.shopify.com`.
- Create a development store.
- Create or connect this app with Shopify CLI.
- Add MongoDB Atlas connection string to `.env`, or run local MongoDB with Docker:

```bash
docker compose up -d mongo mongo-express
```

- Run `npm run dev:shopify`.
- Install the app on the dev store.
- Enable the **Announcement Banner** app embed in the theme editor.
- If testing against the main theme, run `shopify app deploy --allow-updates`, then re-enable the app embed so the theme references the latest extension version.

## GitHub

```bash
cd /home/anju/shopify-announcement-banner
git init
git add .
git commit -m "Build Shopify announcement banner app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shopify-announcement-banner.git
git push -u origin main
```

## Render

- Create a MongoDB Atlas database for the deployed app.
- Create a Render **Web Service** from the GitHub repo, or use the included `render.yaml` Blueprint.
- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Health check path: `/healthz`
- Add these Render env vars:

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

- Update `shopify.app.toml` `application_url` to the Render URL.
- Update `shopify.app.toml` redirect URL to `https://your-render-service.onrender.com/api/auth/callback`.
- Commit and push that Render URL change.
- Run `shopify app deploy --allow-updates`.

## Video

Show these four things:

1. Saving `Sale 50% Off` in the app dashboard.
2. MongoDB record saved in `announcements`.
3. App embed enabled from **App embeds > Announcement Banner** in the theme editor.
4. Storefront preview displaying the banner.

## Email

To: `careers@futureblinkmail.xyz`

Subject: `Shopify App Developer Task`

Include:

- Public GitHub repository link
- Deployed application link
- Loom/YouTube video link
- Updated resume
