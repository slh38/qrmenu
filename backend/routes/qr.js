const express = require("express");
const QRCode = require("qrcode");
const Tenant = require("../models/Tenant");
const { buildTenantPublicUrl, createResponse } = require("../utils");

const router = express.Router();

router.get("/generate", async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenantId).select("slug primaryColor logoUrl businessName");
    if (!tenant) {
      return res.status(404).json(createResponse(false, "İşletme bulunamadı.", {}));
    }

    const publicUrl = buildTenantPublicUrl(tenant.slug);
    const qrCode = await QRCode.toDataURL(publicUrl, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: "H",
    });

    return res.json(
      createResponse(true, "QR kod üretildi.", {
        url: publicUrl,
        qrCode,
        primaryColor: tenant.primaryColor || "#2563eb",
        logoUrl: tenant.logoUrl || "",
        businessName: tenant.businessName || "",
      })
    );
  } catch (error) {
    return res.status(500).json(createResponse(false, "QR kod üretilemedi.", { error: error.message }));
  }
});

module.exports = router;
