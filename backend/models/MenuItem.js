const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "TRY",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    sourceType: {
      type: String,
      enum: ["manual", "gerapos"],
      default: "manual",
    },
    integrationProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IntegrationProduct",
      default: null,
    },
    sourceActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

menuItemSchema.index(
  { tenantId: 1, integrationProductId: 1 },
  { unique: true, partialFilterExpression: { integrationProductId: { $type: "objectId" } } }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
