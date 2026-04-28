const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Tenant = require("../models/Tenant");
const { createResponse, generateUniqueSlug } = require("../utils");

const router = express.Router();

const signToken = (tenantId) =>
  jwt.sign({ tenantId }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res) => {
  try {
    const { businessName, ownerName, email, password, phone, address } = req.body;

    if (!businessName || !email || !password) {
      return res.status(400).json(createResponse(false, "Zorunlu alanlar eksik.", {}));
    }

    const existingTenant = await Tenant.findOne({ email: email.toLowerCase() });
    if (existingTenant) {
      return res.status(409).json(createResponse(false, "Bu e-posta zaten kayıtlı.", {}));
    }

    const slug = await generateUniqueSlug(businessName);
    const hashedPassword = await bcrypt.hash(password, 10);

    const tenant = await Tenant.create({
      businessName,
      slug,
      ownerName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      address,
    });

    const token = signToken(tenant._id);

    return res.status(201).json(
      createResponse(true, "Kayıt başarılı.", {
        token,
        tenant: {
          _id: tenant._id,
          businessName: tenant.businessName,
          slug: tenant.slug,
          email: tenant.email,
          ownerName: tenant.ownerName,
          phone: tenant.phone,
          address: tenant.address,
          logoUrl: tenant.logoUrl,
          primaryColor: tenant.primaryColor,
        },
      })
    );
  } catch (error) {
    return res.status(500).json(createResponse(false, "Kayıt oluşturulamadı.", { error: error.message }));
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(createResponse(false, "E-posta ve şifre gerekli.", {}));
    }

    const tenant = await Tenant.findOne({ email: email.toLowerCase() });
    if (!tenant) {
      return res.status(401).json(createResponse(false, "Geçersiz giriş bilgileri.", {}));
    }

    const isPasswordValid = await bcrypt.compare(password, tenant.password);
    if (!isPasswordValid) {
      return res.status(401).json(createResponse(false, "Geçersiz giriş bilgileri.", {}));
    }

    const token = signToken(tenant._id);

    return res.json(
      createResponse(true, "Giriş başarılı.", {
        token,
        tenant: {
          _id: tenant._id,
          businessName: tenant.businessName,
          slug: tenant.slug,
          email: tenant.email,
          ownerName: tenant.ownerName,
          phone: tenant.phone,
          address: tenant.address,
          logoUrl: tenant.logoUrl,
          primaryColor: tenant.primaryColor,
        },
      })
    );
  } catch (error) {
    return res.status(500).json(createResponse(false, "Giriş yapılamadı.", { error: error.message }));
  }
});

module.exports = router;
