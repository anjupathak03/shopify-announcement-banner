import "@shopify/shopify-api/adapters/node";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { config, getSessionStorageUrl } from "./config.js";

export const shopify = shopifyApp({
  api: {
    apiKey: config.shopifyApiKey,
    apiSecretKey: config.shopifyApiSecret,
    apiVersion: config.shopifyApiVersion,
    scopes: config.scopes,
    hostName: config.hostName,
    hostScheme: config.hostScheme,
    isEmbeddedApp: true
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback"
  },
  webhooks: {
    path: "/api/webhooks"
  },
  sessionStorage: new MongoDBSessionStorage(
    getSessionStorageUrl(),
    config.mongoDbName,
    {}
  ),
  useOnlineTokens: false
});
