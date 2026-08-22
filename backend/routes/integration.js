const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth");
const integrationAuth = require("../middleware/integrationAuth");
const { hashApiKey } = require("../middleware/integrationAuth");
const Category = require("../models/Category");
const IntegrationProduct = require("../models/IntegrationProduct");
const MenuItem = require("../models/MenuItem");
const Tenant = require("../models/Tenant");
const { createResponse } = require("../utils");

const router = express.Router();

function normalizeActive(value) {
  if (value === null || typeof value === "undefined" || value === "") {
    return null;
  }

  if (value === false || value === 0) {
    return false;
  }

  const normalized = String(value).trim().toLocaleLowerCase("tr-TR");
  if (["0", "false", "pasif", "hayir", "hayır"].includes(normalized)) {
    return false;
  }

  if (["1", "true", "aktif", "evet"].includes(normalized)) {
    return true;
  }

  return null;
}

function normalizeProduct(row) {
  const externalStockId = row.externalStockId ?? row.StokKart_ID;
  const sourceName = row.sourceName ?? row.STOKADI;
  const sourcePrice = row.sourcePrice ?? row.BirimFiyati;
  const sourceCategory = row.sourceCategory ?? row.KategoriAdi ?? "";
  const rawActive = row.sourceActive ?? row.Aktif ?? null;
  const numericPrice = Number(String(sourcePrice ?? "").replace(",", "."));

  if (externalStockId === null || typeof externalStockId === "undefined" || !String(externalStockId).trim()) {
    return null;
  }

  if (!sourceName || !String(sourceName).trim() || !Number.isFinite(numericPrice) || numericPrice < 0) {
    return null;
  }

  return {
    externalStockId: String(externalStockId).trim(),
    sourceName: String(sourceName).trim(),
    sourcePrice: numericPrice,
    sourceCategory: String(sourceCategory || "").trim(),
    sourceActive: normalizeActive(rawActive),
    sourceRawActive: rawActive,
  };
}

router.post("/gerapos/sync", integrationAuth, async (req, res) => {
  try {
    if (!Array.isArray(req.body.products)) {
      return res.status(400).json(createResponse(false, "Ürün listesi gerekli.", {}));
    }

    if (req.body.products.length > 10000) {
      return res.status(400).json(createResponse(false, "Tek istekte en fazla 10.000 ürün gönderilebilir.", {}));
    }

    const productsByStockId = new Map();
    let invalidCount = 0;

    req.body.products.forEach((row) => {
      const product = normalizeProduct(row || {});
      if (product) {
        productsByStockId.set(product.externalStockId, product);
      } else {
        invalidCount += 1;
      }
    });

    const products = [...productsByStockId.values()];
    const now = new Date();

    if (req.body.products.length > 0 && products.length === 0) {
      return res.status(400).json(
        createResponse(false, "Gönderilen ürünlerin hiçbiri geçerli stok ID, ad ve fiyat içermiyor.", {
          invalidCount,
        })
      );
    }

    if (products.length) {
      await IntegrationProduct.bulkWrite(
        products.map((product) => ({
          updateOne: {
            filter: {
              tenantId: req.tenantId,
              provider: "gerapos",
              externalStockId: product.externalStockId,
            },
            update: {
              $set: {
                ...product,
                lastSeenAt: now,
              },
              $setOnInsert: {
                tenantId: req.tenantId,
                provider: "gerapos",
              },
            },
            upsert: true,
          },
        }))
      );
    }

    if (req.body.isFullSnapshot === true) {
      await IntegrationProduct.updateMany(
        {
          tenantId: req.tenantId,
          provider: "gerapos",
          externalStockId: { $nin: products.map((product) => product.externalStockId) },
        },
        { $set: { sourceActive: false } }
      );
    }

    const linkedProducts = await IntegrationProduct.find({
      tenantId: req.tenantId,
      provider: "gerapos",
      menuItemId: { $ne: null },
    }).select("menuItemId sourcePrice sourceActive");

    if (linkedProducts.length) {
      await MenuItem.bulkWrite(
        linkedProducts.map((product) => ({
          updateOne: {
            filter: { _id: product.menuItemId, tenantId: req.tenantId },
            update: {
              $set: {
                price: product.sourcePrice,
                sourceActive: product.sourceActive !== false,
              },
            },
          },
        }))
      );
    }

    await Tenant.findByIdAndUpdate(req.tenantId, {
      $set: {
        "integration.lastSyncedAt": now,
        "integration.lastSyncCount": products.length,
        "integration.lastSyncStatus": "success",
        "integration.lastSyncError": "",
      },
    });

    return res.json(
      createResponse(true, "Adisyon ürünleri senkronize edildi.", {
        receivedCount: req.body.products.length,
        syncedCount: products.length,
        invalidCount,
      })
    );
  } catch (error) {
    await Tenant.findByIdAndUpdate(req.tenantId, {
      $set: {
        "integration.lastSyncStatus": "error",
        "integration.lastSyncError": error.message,
      },
    }).catch(() => {});

    return res.status(500).json(createResponse(false, "Senkronizasyon başarısız.", { error: error.message }));
  }
});

router.get("/gerapos/settings", authMiddleware, async (req, res) => {
  try {
    const [tenant, totalProductCount, importedProductCount] = await Promise.all([
      Tenant.findById(req.tenantId).select("integration"),
      IntegrationProduct.countDocuments({ tenantId: req.tenantId, provider: "gerapos" }),
      IntegrationProduct.countDocuments({ tenantId: req.tenantId, provider: "gerapos", menuItemId: { $ne: null } }),
    ]);

    return res.json(
      createResponse(true, "Entegrasyon ayarları getirildi.", {
        integration: tenant?.integration || {},
        totalProductCount,
        importedProductCount,
      })
    );
  } catch (error) {
    return res.status(500).json(createResponse(false, "Entegrasyon ayarları alınamadı.", { error: error.message }));
  }
});

router.post("/gerapos/key", authMiddleware, async (req, res) => {
  try {
    const apiKey = `jqr_${crypto.randomBytes(32).toString("hex")}`;

    await Tenant.findByIdAndUpdate(req.tenantId, {
      $set: {
        "integration.mode": "gerapos",
        "integration.apiKeyHash": hashApiKey(apiKey),
        "integration.apiKeyLastFour": apiKey.slice(-4),
      },
    });

    return res.json(
      createResponse(true, "Entegrasyon anahtarı oluşturuldu.", {
        apiKey,
        lastFour: apiKey.slice(-4),
      })
    );
  } catch (error) {
    return res.status(500).json(createResponse(false, "Entegrasyon anahtarı oluşturulamadı.", { error: error.message }));
  }
});

router.delete("/gerapos/key", authMiddleware, async (req, res) => {
  try {
    await Tenant.findByIdAndUpdate(req.tenantId, {
      $set: {
        "integration.apiKeyHash": "",
        "integration.apiKeyLastFour": "",
      },
    });

    return res.json(createResponse(true, "Entegrasyon anahtarı iptal edildi.", {}));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Entegrasyon anahtarı iptal edilemedi.", { error: error.message }));
  }
});

router.get("/gerapos/products", authMiddleware, async (req, res) => {
  try {
    const products = await IntegrationProduct.find({ tenantId: req.tenantId, provider: "gerapos" })
      .populate({
        path: "menuItemId",
        select: "name categoryId imageUrl isAvailable",
        populate: { path: "categoryId", select: "name" },
      })
      .sort({ sourceCategory: 1, sourceName: 1 });

    return res.json(createResponse(true, "Adisyon ürünleri listelendi.", { products }));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Adisyon ürünleri alınamadı.", { error: error.message }));
  }
});

router.post("/gerapos/import", authMiddleware, async (req, res) => {
  try {
    const productIds = [...new Set(Array.isArray(req.body.productIds) ? req.body.productIds : [])].filter((id) =>
      mongoose.isValidObjectId(id)
    );
    const { categoryId } = req.body;

    if (!productIds.length || !mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json(createResponse(false, "Ürünler ve hedef QR kategorisi gerekli.", {}));
    }

    const category = await Category.findOne({ _id: categoryId, tenantId: req.tenantId });
    if (!category) {
      return res.status(404).json(createResponse(false, "QR kategorisi bulunamadı.", {}));
    }

    const products = await IntegrationProduct.find({
      _id: { $in: productIds },
      tenantId: req.tenantId,
      provider: "gerapos",
      menuItemId: null,
      sourceActive: { $ne: false },
    });

    if (!products.length) {
      return res.status(409).json(createResponse(false, "Aktarılabilecek yeni ürün bulunamadı.", {}));
    }

    const items = await MenuItem.insertMany(
      products.map((product) => ({
        tenantId: req.tenantId,
        categoryId: category._id,
        name: product.sourceName,
        description: "",
        price: product.sourcePrice,
        currency: "TRY",
        isAvailable: true,
        order: 0,
        sourceType: "gerapos",
        integrationProductId: product._id,
        sourceActive: product.sourceActive !== false,
      }))
    );

    await IntegrationProduct.bulkWrite(
      products.map((product, index) => ({
        updateOne: {
          filter: { _id: product._id, tenantId: req.tenantId },
          update: { $set: { menuItemId: items[index]._id } },
        },
      }))
    );

    return res.status(201).json(
      createResponse(true, `${items.length} ürün QR Menü'ye aktarıldı.`, {
        importedCount: items.length,
        skippedCount: productIds.length - items.length,
      })
    );
  } catch (error) {
    return res.status(500).json(createResponse(false, "Ürünler QR Menü'ye aktarılamadı.", { error: error.message }));
  }
});

module.exports = router;
