const mongoose = require("mongoose");

const integrationProductSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["gerapos"],
      default: "gerapos",
      required: true,
    },
    externalStockId: {
      type: String,
      required: true,
      trim: true,
    },
    sourceName: {
      type: String,
      required: true,
      trim: true,
    },
    sourcePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sourceCategory: {
      type: String,
      default: "",
      trim: true,
    },
    sourceActive: {
      type: Boolean,
      default: null,
    },
    sourceRawActive: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      default: null,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

integrationProductSchema.index(
  { tenantId: 1, provider: 1, externalStockId: 1 },
  { unique: true }
);

module.exports = mongoose.model("IntegrationProduct", integrationProductSchema);
