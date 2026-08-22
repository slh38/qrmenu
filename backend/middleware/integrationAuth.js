const crypto = require("crypto");
const Tenant = require("../models/Tenant");
const { createResponse } = require("../utils");

const hashApiKey = (apiKey) => crypto.createHash("sha256").update(apiKey).digest("hex");

module.exports = async (req, res, next) => {
  const apiKey = req.headers["x-integration-key"];

  if (!apiKey || typeof apiKey !== "string") {
    return res.status(401).json(createResponse(false, "Entegrasyon anahtarı gerekli.", {}));
  }

  try {
    const tenant = await Tenant.findOne({
      "integration.apiKeyHash": hashApiKey(apiKey),
      "integration.mode": "gerapos",
      isActive: true,
    }).select("_id integration");

    if (!tenant) {
      return res.status(401).json(createResponse(false, "Entegrasyon anahtarı geçersiz.", {}));
    }

    req.tenantId = tenant._id;
    req.integrationTenant = tenant;
    return next();
  } catch (error) {
    return res.status(500).json(createResponse(false, "Entegrasyon doğrulanamadı.", { error: error.message }));
  }
};

module.exports.hashApiKey = hashApiKey;
