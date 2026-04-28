require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authMiddleware = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const tenantRoutes = require("./routes/tenant");
const categoryRoutes = require("./routes/category");
const menuItemRoutes = require("./routes/menuItem");
const publicMenuRoutes = require("./routes/publicMenu");
const qrRoutes = require("./routes/qr");
const { createResponse } = require("./utils");

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.json(createResponse(true, "QR Menu API çalışıyor.", {}));
});

app.use("/api/auth", authRoutes);
app.use("/api/public", publicMenuRoutes);
app.use("/api/tenant", authMiddleware, tenantRoutes);
app.use("/api/categories", authMiddleware, categoryRoutes);
app.use("/api/menu-items", authMiddleware, menuItemRoutes);
app.use("/api/qr", authMiddleware, qrRoutes);

app.use((error, _req, res, _next) => {
  const statusCode = error.name === "MulterError" ? 400 : 500;
  res.status(statusCode).json(createResponse(false, error.message || "Beklenmeyen bir hata oluştu.", {}));
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/qrmenu";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });
