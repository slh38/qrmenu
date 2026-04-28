require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Tenant = require("./models/Tenant");
const Category = require("./models/Category");
const MenuItem = require("./models/MenuItem");
const { generateUniqueSlug } = require("./utils");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/qrmenu");

  const email = "demo@qrmenu.local";
  await MenuItem.deleteMany({});
  await Category.deleteMany({});
  await Tenant.deleteMany({ email });

  const slug = await generateUniqueSlug("Cafe Istanbul");
  const password = await bcrypt.hash("123456", 10);

  const tenant = await Tenant.create({
    businessName: "Cafe Istanbul",
    slug,
    ownerName: "Demo Owner",
    email,
    password,
    phone: "+90 555 000 00 00",
    address: "Kadikoy / Istanbul",
    primaryColor: "#c84c24",
  });

  const starters = await Category.create({
    tenantId: tenant._id,
    name: "Baslangiclar",
    description: "Paylasimlik ve hafif tabaklar",
    order: 1,
  });

  const mains = await Category.create({
    tenantId: tenant._id,
    name: "Ana Yemekler",
    description: "Gunluk favoriler",
    order: 2,
  });

  await MenuItem.insertMany([
    {
      tenantId: tenant._id,
      categoryId: starters._id,
      name: "Humus Tabagi",
      description: "Sicak pide esliginde servis edilir.",
      price: 165,
      order: 1,
    },
    {
      tenantId: tenant._id,
      categoryId: mains._id,
      name: "Izgara Tavuk",
      description: "Mevsim salatasi ve baharatli patates ile.",
      price: 310,
      order: 1,
    },
  ]);

  console.log("Demo tenant created:");
  console.log({ email, password: "123456", slug });

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
