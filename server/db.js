import mongoose from "mongoose";
import { config } from "./config.js";

function buildMongoUri(baseUri, dbName) {
  const url = new URL(baseUri);

  if (!url.pathname || url.pathname === "/") {
    url.pathname = `/${dbName}`;
  }

  return url.toString();
}

export async function connectMongo() {
  const uri = buildMongoUri(config.mongoUri, config.mongoDbName);

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);

  console.log(`MongoDB connected: ${config.mongoDbName}`);
}
