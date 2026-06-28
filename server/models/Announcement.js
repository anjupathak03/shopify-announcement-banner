import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    shop: {
      type: String,
      required: true,
      index: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    savedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    shopifyOwnerId: String,
    shopifyMetafieldId: String,
    syncStatus: {
      type: String,
      enum: ["pending", "synced", "failed"],
      default: "pending",
      index: true
    },
    syncError: String
  },
  { timestamps: true }
);

export const Announcement = mongoose.model("Announcement", announcementSchema);
