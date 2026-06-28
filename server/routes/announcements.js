import express from "express";
import { config } from "../config.js";
import { Announcement } from "../models/Announcement.js";
import {
  getAnnouncementMetafield,
  setAnnouncementMetafield
} from "../utils/shopifyMetafields.js";

const MAX_ANNOUNCEMENT_LENGTH = 300;

function normalizeAnnouncementText(value) {
  return String(value ?? "").trim();
}

function serializeRecord(record) {
  return {
    id: record._id.toString(),
    shop: record.shop,
    text: record.text,
    savedAt: record.savedAt,
    syncStatus: record.syncStatus,
    syncError: record.syncError,
    shopifyMetafieldId: record.shopifyMetafieldId
  };
}

export function announcementRoutes({ shopify }) {
  const router = express.Router();

  router.use(shopify.validateAuthenticatedSession());

  router.get("/announcement", async (_req, res, next) => {
    try {
      const session = res.locals.shopify.session;
      const [shopifyState, latestRecord, history] = await Promise.all([
        getAnnouncementMetafield(shopify, session),
        Announcement.findOne({ shop: session.shop }).sort({ savedAt: -1 }).lean(),
        Announcement.find({ shop: session.shop }).sort({ savedAt: -1 }).limit(8).lean()
      ]);

      res.json({
        shop: session.shop,
        apiKey: config.shopifyApiKey,
        announcementText: shopifyState.text || latestRecord?.text || "",
        metafield: shopifyState.metafield,
        latestRecord: latestRecord ? serializeRecord(latestRecord) : null,
        history: history.map(serializeRecord)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/announcement", async (req, res, next) => {
    const session = res.locals.shopify.session;
    const text = normalizeAnnouncementText(req.body?.text);

    if (!text) {
      return res.status(422).json({ error: "Announcement Text is required." });
    }

    if (text.length > MAX_ANNOUNCEMENT_LENGTH) {
      return res.status(422).json({
        error: `Announcement Text must be ${MAX_ANNOUNCEMENT_LENGTH} characters or fewer.`
      });
    }

    let record;

    try {
      record = await Announcement.create({
        shop: session.shop,
        text,
        syncStatus: "pending"
      });

      const syncResult = await setAnnouncementMetafield(shopify, session, text);

      record.shopifyOwnerId = syncResult.shop.shopId;
      record.shopifyMetafieldId = syncResult.metafield.id;
      record.syncStatus = "synced";
      await record.save();

      res.status(201).json({
        record: serializeRecord(record),
        metafield: syncResult.metafield
      });
    } catch (error) {
      if (record) {
        record.syncStatus = "failed";
        record.syncError = error.message;
        await record.save();
      }

      next(error);
    }
  });

  return router;
}
