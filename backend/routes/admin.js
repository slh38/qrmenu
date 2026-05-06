const express = require("express");
const jwt = require("jsonwebtoken");
const Tenant = require("../models/Tenant");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const adminAuth = require("../middleware/adminAuth");
const { createResponse, buildTenantPublicUrl } = require("../utils");

const router = express.Router();

function signAdminToken() {
  return jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return res.status(500).json(createResponse(false, "Admin girişi henüz yapılandırılmadı.", {}));
  }

  if (username !== adminUsername || password !== adminPassword) {
    return res.status(401).json(createResponse(false, "Geçersiz admin bilgileri.", {}));
  }

  return res.json(
    createResponse(true, "Admin girişi başarılı.", {
      token: signAdminToken(),
      admin: { username: adminUsername },
    })
  );
});

router.get("/overview", adminAuth, async (_req, res) => {
  try {
    const [tenants, categoryCounts, menuItemCounts] = await Promise.all([
      Tenant.find({})
        .select("businessName slug email phone isActive menuViewCount createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      Category.aggregate([{ $group: { _id: "$tenantId", count: { $sum: 1 } } }]),
      MenuItem.aggregate([{ $group: { _id: "$tenantId", count: { $sum: 1 } } }]),
    ]);

    const categoryCountMap = new Map(categoryCounts.map((entry) => [String(entry._id), entry.count]));
    const menuItemCountMap = new Map(menuItemCounts.map((entry) => [String(entry._id), entry.count]));

    const tenantRows = tenants.map((tenant) => ({
      _id: tenant._id,
      businessName: tenant.businessName,
      slug: tenant.slug,
      email: tenant.email,
      phone: tenant.phone,
      isActive: tenant.isActive,
      menuViewCount: tenant.menuViewCount || 0,
      categoryCount: categoryCountMap.get(String(tenant._id)) || 0,
      menuItemCount: menuItemCountMap.get(String(tenant._id)) || 0,
      publicUrl: buildTenantPublicUrl(tenant.slug),
      createdAt: tenant.createdAt,
    }));

    const stats = {
      tenantCount: tenantRows.length,
      activeTenantCount: tenantRows.filter((tenant) => tenant.isActive).length,
      totalCategoryCount: tenantRows.reduce((sum, tenant) => sum + tenant.categoryCount, 0),
      totalMenuItemCount: tenantRows.reduce((sum, tenant) => sum + tenant.menuItemCount, 0),
      totalMenuViewCount: tenantRows.reduce((sum, tenant) => sum + tenant.menuViewCount, 0),
    };

    return res.json(
      createResponse(true, "Admin özeti getirildi.", {
        stats,
        tenants: tenantRows,
      })
    );
  } catch (error) {
    return res.status(500).json(createResponse(false, "Admin özeti alınamadı.", { error: error.message }));
  }
});

router.put("/tenants/:tenantId/status", adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json(createResponse(false, "Yeni durum bilgisi gerekli.", {}));
    }

    const tenant = await Tenant.findByIdAndUpdate(req.params.tenantId, { isActive }, { new: true }).select(
      "businessName slug isActive"
    );

    if (!tenant) {
      return res.status(404).json(createResponse(false, "İşletme bulunamadı.", {}));
    }

    return res.json(
      createResponse(true, `İşletme ${isActive ? "aktif" : "pasif"} duruma alındı.`, {
        tenant,
      })
    );
  } catch (error) {
    return res.status(500).json(createResponse(false, "İşletme durumu güncellenemedi.", { error: error.message }));
  }
});

module.exports = router;
