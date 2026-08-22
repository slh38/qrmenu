const express = require("express");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const IntegrationProduct = require("../models/IntegrationProduct");
const upload = require("../middleware/upload");
const { buildFileUrl, createResponse } = require("../utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = { tenantId: req.tenantId };
    if (req.query.categoryId) {
      query.categoryId = req.query.categoryId;
    }

    const items = await MenuItem.find(query)
      .populate("categoryId", "name")
      .sort({ order: 1, createdAt: 1 });

    return res.json(createResponse(true, "Ürünler listelendi.", { items }));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Ürünler alınamadı.", { error: error.message }));
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { categoryId, name, description, price, currency, isAvailable, order } = req.body;

    if (!categoryId || !name || typeof price === "undefined") {
      return res.status(400).json(createResponse(false, "Kategori, ürün adı ve fiyat gerekli.", {}));
    }

    const category = await Category.findOne({ _id: categoryId, tenantId: req.tenantId });
    if (!category) {
      return res.status(404).json(createResponse(false, "Kategori bulunamadı.", {}));
    }

    const item = await MenuItem.create({
      tenantId: req.tenantId,
      categoryId,
      name,
      description,
      price: Number(price),
      currency: currency || "TRY",
      imageUrl: req.file ? buildFileUrl(req, req.file.filename) : "",
      isAvailable: isAvailable === undefined ? true : isAvailable === "true" || isAvailable === true,
      order: Number(order || 0),
    });

    return res.status(201).json(createResponse(true, "Ürün oluşturuldu.", { item }));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Ürün oluşturulamadı.", { error: error.message }));
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const existingItem = await MenuItem.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!existingItem) {
      return res.status(404).json(createResponse(false, "Ürün bulunamadı.", {}));
    }

    if (req.body.categoryId) {
      const category = await Category.findOne({ _id: req.body.categoryId, tenantId: req.tenantId });
      if (!category) {
        return res.status(404).json(createResponse(false, "Kategori bulunamadı.", {}));
      }
    }

    const allowedFields = ["categoryId", "name", "description", "currency", "isAvailable", "order"];
    const payload = allowedFields.reduce((result, field) => {
      if (req.body[field] !== undefined) {
        result[field] = req.body[field];
      }
      return result;
    }, {});

    if (req.body.price !== undefined && existingItem.sourceType !== "gerapos") {
      payload.price = Number(req.body.price);
    }

    if (req.body.order !== undefined) {
      payload.order = Number(req.body.order);
    }

    if (req.body.isAvailable !== undefined) {
      payload.isAvailable = req.body.isAvailable === "true" || req.body.isAvailable === true;
    }

    if (req.file) {
      payload.imageUrl = buildFileUrl(req, req.file.filename);
    }

    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      payload,
      { new: true, runValidators: true }
    );

    return res.json(createResponse(true, "Ürün güncellendi.", { item }));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Ürün güncellenemedi.", { error: error.message }));
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!item) {
      return res.status(404).json(createResponse(false, "Ürün bulunamadı.", {}));
    }

    if (item.integrationProductId) {
      await IntegrationProduct.findOneAndUpdate(
        { _id: item.integrationProductId, tenantId: req.tenantId },
        { $set: { menuItemId: null } }
      );
    }

    return res.json(createResponse(true, "Ürün silindi.", {}));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Ürün silinemedi.", { error: error.message }));
  }
});

module.exports = router;
