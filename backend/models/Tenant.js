const mongoose = require("mongoose");

const socialLinkSchema = new mongoose.Schema(
  {
    instagram: { type: String, default: "", trim: true },
    facebook: { type: String, default: "", trim: true },
    tiktok: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    whatsapp: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const tenantSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    ownerName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    coverImageUrl: {
      type: String,
      default: "",
    },
    tagline: {
      type: String,
      default: "",
      trim: true,
    },
    theme: {
      type: String,
      enum: ["showcase", "minimal", "editorial"],
      default: "showcase",
    },
    primaryColor: {
      type: String,
      default: "#2563eb",
    },
    socialLinks: {
      type: socialLinkSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", tenantSchema);
