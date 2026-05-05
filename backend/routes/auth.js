const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Tenant = require("../models/Tenant");
const { sendPasswordResetEmail } = require("../mailer");
const { createResponse, generateUniqueSlug } = require("../utils");

const router = express.Router();

const signToken = (tenantId) =>
  jwt.sign({ tenantId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const serializeTenant = (tenant) => ({
  _id: tenant._id,
  businessName: tenant.businessName,
  slug: tenant.slug,
  email: tenant.email,
  ownerName: tenant.ownerName,
  phone: tenant.phone,
  address: tenant.address,
  logoUrl: tenant.logoUrl,
  coverImageUrl: tenant.coverImageUrl,
  logoEffectEnabled: tenant.logoEffectEnabled,
  logoSize: tenant.logoSize,
  tagline: tenant.tagline,
  theme: tenant.theme,
  primaryColor: tenant.primaryColor,
  socialLinks: tenant.socialLinks,
});

function buildResetUrl(token) {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  return `${baseUrl.replace(/\/$/, "")}/reset-password/${token}`;
}

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
        tenant: serializeTenant(tenant),
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
        tenant: serializeTenant(tenant),
      })
    );
  } catch (error) {
    return res.status(500).json(createResponse(false, "Giriş yapılamadı.", { error: error.message }));
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(createResponse(false, "E-posta adresi gerekli.", {}));
    }

    const tenant = await Tenant.findOne({ email: email.toLowerCase() });

    if (!tenant) {
      return res.json(
        createResponse(true, "Eğer bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderilecektir.", {})
      );
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    tenant.resetPasswordToken = hashedToken;
    tenant.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await tenant.save();

    await sendPasswordResetEmail({
      to: tenant.email,
      businessName: tenant.businessName,
      resetUrl: buildResetUrl(rawToken),
    });

    return res.json(
      createResponse(true, "Eğer bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderilecektir.", {})
    );
  } catch (error) {
    return res.status(500).json(createResponse(false, "Şifre sıfırlama e-postası gönderilemedi.", { error: error.message }));
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json(createResponse(false, "Yeni şifre en az 6 karakter olmalı.", {}));
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const tenant = await Tenant.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!tenant) {
      return res.status(400).json(createResponse(false, "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.", {}));
    }

    tenant.password = await bcrypt.hash(password, 10);
    tenant.resetPasswordToken = "";
    tenant.resetPasswordExpiresAt = null;
    await tenant.save();

    return res.json(createResponse(true, "Şifreniz başarıyla güncellendi.", {}));
  } catch (error) {
    return res.status(500).json(createResponse(false, "Şifre güncellenemedi.", { error: error.message }));
  }
});

module.exports = router;
