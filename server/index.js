import express from "express";
import fs from "fs";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectMongo } from "./db.js";
import { config } from "./config.js";
import { shopify } from "./shopify.js";
import { announcementRoutes } from "./routes/announcements.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, "..", "client", "dist");
const clientIndexPath = path.join(clientDistPath, "index.html");

await connectMongo();

const app = express();

app.set("trust proxy", 1);
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use(shopify.cspHeaders());

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(shopify.config.auth.callbackPath, shopify.auth.callback());

app.post(
  shopify.config.webhooks.path,
  express.text({ type: "*/*" }),
  shopify.processWebhooks({ webhookHandlers: {} })
);

app.use(express.json({ limit: "1mb" }));
app.use("/api", announcementRoutes({ shopify }));

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

app.get("/", shopify.redirectToShopifyOrAppRoot());

app.get(/^\/app(\/.*)?$/, shopify.ensureInstalledOnShop(), (_req, res) => {
  if (fs.existsSync(clientIndexPath)) {
    return res.sendFile(clientIndexPath);
  }

  return res.status(404).send("Run npm run build before using production start.");
});

app.get(/^(?!\/api).*/, (_req, res) => {
  if (fs.existsSync(clientIndexPath)) {
    return res.sendFile(clientIndexPath);
  }

  return res.status(404).send("Client build not found.");
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.statusCode || 500).json({
    error: error.message || "Unexpected server error"
  });
});

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
