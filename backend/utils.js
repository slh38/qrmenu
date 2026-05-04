const Tenant = require("./models/Tenant");

const RESERVED_SUBDOMAINS = new Set(["www", "api", "admin", "app", "mail", "ftp", "blog"]);

const createResponse = (success, message, data = {}) => ({
  success,
  message,
  data,
});

const normalizeTurkish = (value) =>
  value
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");

const slugify = (value) =>
  normalizeTurkish(value)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const generateUniqueSlug = async (businessName) => {
  const baseSlug = slugify(businessName) || "isletme";
  let slug = RESERVED_SUBDOMAINS.has(baseSlug) ? `${baseSlug}-menu` : baseSlug;
  let counter = 2;

  while (await Tenant.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

const buildTenantPublicUrl = (slug) => {
  const rootDomain = process.env.ROOT_DOMAIN;
  if (rootDomain) {
    return `https://${slug}.${rootDomain}`;
  }

  return `${process.env.FRONTEND_URL}/menu/${slug}`;
};

const buildFileUrl = (req, filename) =>
  `${req.protocol}://${req.get("host")}/uploads/${filename}`;

module.exports = {
  buildTenantPublicUrl,
  buildFileUrl,
  createResponse,
  generateUniqueSlug,
  slugify,
};
