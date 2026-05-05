const express = require("express");
const Tenant = require("../models/Tenant");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const { createResponse } = require("../utils");

const router = express.Router();

router.get("/menu/:slug", async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ slug: req.params.slug }).select(
      "businessName logoUrl coverImageUrl logoEffectEnabled logoSize tagline theme primaryColor address phone slug socialLinks"
    );

    if (!tenant) {
      return res.status(404).json(createResponse(false, "Menü bulunamadı.", {}));
    }

    const categories = await Category.find({
      tenantId: tenant._id,
      isActive: true,
    }).sort({ order: 1, createdAt: 1 });

    const items = await MenuItem.find({
      tenantId: tenant._id,
      isAvailable: true,
      categoryId: { $in: categories.map((category) => category._id) },
    }).sort({ order: 1, createdAt: 1 });

    const groupedItems = items.reduce((acc, item) => {
      const key = String(item.categoryId);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    const payload = categories.map((category) => ({
      _id: category._id,
      name: category.name,
      description: category.description,
      order: category.order,
      items: groupedItems[String(category._id)] || [],
    }));

    return res.json(
      createResponse(true, "Menü getirildi.", {
        tenant,
        categories: payload,
      })
    );
  } catch (error) {
    return res.status(500).json(createResponse(false, "Menü alınamadı.", { error: error.message }));
  }
});

module.exports = router;
