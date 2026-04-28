const express = require("express");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const upload = require("../middleware/upload");
const { buildFileUrl, createResponse } = require("../utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ tenantId: req.tenantId }).sort({ order: 1, createdAt: 1 });
    const categoryIds = categories.map((category) => category._id);
    const counts = categoryIds.length
      ? await MenuItem.aggregate([
          { $match: { tenantId: categories[0].tenantId, categoryId: { $in: categoryIds } } },
          { $group: { _id: "$categoryId", count: { $sum: 1 } } },
        ])
      : [];

    const countMap = new Map(counts.map((item) => [String(item._id), item.count]));
    const enrichedCategories = categories.map((category) => ({
      ...category.toObject(),
      itemCount: countMap.get(String(category._id)) || 0,
    }));

    return res.json(createResponse(true, "Kategoriler listelendi.", { categories: enrichedCategories }));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Kategoriler alınamadı.", { error: error.message }));
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, order, isActive } = req.body;

    if (!name) {
      return res.status(400).json(createResponse(false, "Kategori adı gerekli.", {}));
    }

    const category = await Category.create({
      tenantId: req.tenantId,
      name,
      description,
      order,
      isActive,
    });

    return res.status(201).json(createResponse(true, "Kategori oluşturuldu.", { category }));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Kategori oluşturulamadı.", { error: error.message }));
  }
});

router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json(createResponse(false, "Kategori bulunamadı.", {}));
    }

    return res.json(createResponse(true, "Kategori güncellendi.", { category }));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Kategori güncellenemedi.", { error: error.message }));
  }
});

router.post("/:id/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(createResponse(false, "Kategori gorseli gerekli.", {}));
    }

    const imageUrl = buildFileUrl(req, req.file.filename);
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { imageUrl },
      { new: true }
    );

    if (!category) {
      return res.status(404).json(createResponse(false, "Kategori bulunamadi.", {}));
    }

    return res.json(createResponse(true, "Kategori gorseli guncellendi.", { category }));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Kategori gorseli yuklenemedi.", { error: error.message }));
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!category) {
      return res.status(404).json(createResponse(false, "Kategori bulunamadı.", {}));
    }

    await MenuItem.deleteMany({ tenantId: req.tenantId, categoryId: req.params.id });

    return res.json(createResponse(true, "Kategori ve ilişkili ürünler silindi.", {}));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Kategori silinemedi.", { error: error.message }));
  }
});

module.exports = router;
