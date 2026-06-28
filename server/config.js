import dotenv from "dotenv";

dotenv.config();

function stripProtocol(url) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function getHostScheme(host) {
  return host.startsWith("http://") ? "http" : "https";
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const defaultPort = Number(process.env.BACKEND_PORT || process.env.SERVER_PORT || process.env.PORT || 3000);
const host =
  process.env.SHOPIFY_APP_URL ||
  process.env.APP_URL ||
  process.env.HOST ||
  `http://localhost:${defaultPort}`;

export const config = {
  port: defaultPort,
  host,
  hostName: stripProtocol(host),
  hostScheme: getHostScheme(host),
  shopifyApiKey: getRequiredEnv("SHOPIFY_API_KEY"),
  shopifyApiSecret: getRequiredEnv("SHOPIFY_API_SECRET"),
  shopifyApiVersion: process.env.SHOPIFY_API_VERSION || "2026-04",
  scopes: (process.env.SCOPES || "write_products,read_themes")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
  mongoDbName: process.env.MONGODB_DB_NAME || "shopify_announcement_banner",
  nodeEnv: process.env.NODE_ENV || "development"
};

export function getSessionStorageUrl() {
  const url = new URL(config.mongoUri);
  url.pathname = "/";
  return url;
}
