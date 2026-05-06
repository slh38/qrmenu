const jwt = require("jsonwebtoken");
const Tenant = require("../models/Tenant");
const { createResponse } = require("../utils");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json(createResponse(false, "Yetkilendirme gerekli.", {}));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tenant = await Tenant.findById(decoded.tenantId).select("_id isActive");

    if (!tenant) {
      return res.status(401).json(createResponse(false, "İşletme hesabı bulunamadı.", {}));
    }

    if (!tenant.isActive) {
      return res.status(403).json(createResponse(false, "İşletme hesabınız geçici olarak pasif durumda.", {}));
    }

    req.tenantId = decoded.tenantId;
    return next();
  } catch (error) {
    return res.status(401).json(createResponse(false, "Geçersiz veya süresi dolmuş token.", {}));
  }
};
