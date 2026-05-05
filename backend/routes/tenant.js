const express = require("express");
const Tenant = require("../models/Tenant");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const upload = require("../middleware/upload");
const { buildFileUrl, buildTenantPublicUrl, createResponse, isReservedSubdomain, slugify } = require("../utils");

const router = express.Router();

function getPastDayKeys(days) {
  const keys = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    keys.push(date.toISOString().slice(0, 10));
  }

  return keys;
}

function buildViewTrend(history = []) {
  const countsByDay = new Map(history.map((entry) => [entry.day, entry.count]));

  return getPastDayKeys(7).map((dayKey) => ({
    day: dayKey.slice(5).replace("-", "."),
    count: countsByDay.get(dayKey) || 0,
  }));
}

router.get("/me", async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenantId).select("-password");
    if (!tenant) {
      return res.status(404).json(createResponse(false, "İşletme bulunamadı.", {}));
    }

    const [categoryCount, menuItemCount] = await Promise.all([
      Category.countDocuments({ tenantId: req.tenantId }),
      MenuItem.countDocuments({ tenantId: req.tenantId }),
    ]);

    return res.json(
      createResponse(true, "İşletme bilgileri getirildi.", {
        tenant,
        stats: {
          categoryCount,
          menuItemCount,
          menuViewCount: tenant.menuViewCount || 0,
          menuViewTrend: buildViewTrend(tenant.menuViewHistory || []),
        },
      })
    );
  } catch (error) {
    return res.status(500).json(createResponse(false, "İşletme bilgileri alınamadı.", { error: error.message }));
  }
});

router.put("/me", async (req, res) => {
  try {
    const { businessName, phone, address, primaryColor, tagline, theme, socialLinks, logoEffectEnabled, logoSize } = req.body;

    const tenant = await Tenant.findByIdAndUpdate(
      req.tenantId,
      { businessName, phone, address, primaryColor, tagline, theme, socialLinks, logoEffectEnabled, logoSize },
      { new: true, runValidators: true }
    ).select("-password");

    return res.json(createResponse(true, "İşletme bilgileri güncellendi.", { tenant }));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Güncelleme başarısız.", { error: error.message }));
  }
});

router.put("/me/slug", async (req, res) => {
  try {
    const { slug: requestedSlug } = req.body;

    if (!requestedSlug) {
      return res.status(400).json(createResponse(false, "Yeni subdomain gerekli.", {}));
    }

    const nextSlug = slugify(requestedSlug);

    if (!nextSlug || nextSlug.length < 3) {
      return res.status(400).json(createResponse(false, "Subdomain en az 3 karakter olmalı.", {}));
    }

    if (isReservedSubdomain(nextSlug)) {
      return res.status(409).json(createResponse(false, "Bu subdomain kullanılamaz. Farklı bir ad seç.", {}));
    }

    const existingTenant = await Tenant.findOne({
      slug: nextSlug,
      _id: { $ne: req.tenantId },
    });

    if (existingTenant) {
      return res.status(409).json(createResponse(false, "Bu subdomain zaten kullanımda.", {}));
    }

    const tenant = await Tenant.findByIdAndUpdate(
      req.tenantId,
      { slug: nextSlug },
      { new: true, runValidators: true }
    ).select("-password");

    if (!tenant) {
      return res.status(404).json(createResponse(false, "İşletme bulunamadı.", {}));
    }

    return res.json(
      createResponse(true, "Subdomain güncellendi. Eski QR kodlarınızı yeniden oluşturmayı unutmayın.", {
        tenant,
        publicUrl: buildTenantPublicUrl(tenant.slug),
      })
    );
  } catch (error) {
    return res.status(500).json(createResponse(false, "Subdomain güncellenemedi.", { error: error.message }));
  }
});

router.post("/me/logo", upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(createResponse(false, "Logo dosyası gerekli.", {}));
    }

    const logoUrl = buildFileUrl(req, req.file.filename);
    const tenant = await Tenant.findByIdAndUpdate(req.tenantId, { logoUrl }, { new: true }).select("-password");

    return res.json(createResponse(true, "Logo yüklendi.", { tenant }));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Logo yüklenemedi.", { error: error.message }));
  }
});

router.post("/me/cover", upload.single("cover"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(createResponse(false, "Kapak görseli gerekli.", {}));
    }

    const coverImageUrl = buildFileUrl(req, req.file.filename);
    const tenant = await Tenant.findByIdAndUpdate(req.tenantId, { coverImageUrl }, { new: true }).select("-password");

    return res.json(createResponse(true, "Kapak görseli yüklendi.", { tenant }));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Kapak görseli yüklenemedi.", { error: error.message }));
  }
});

module.exports = router;
