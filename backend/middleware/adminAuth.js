const jwt = require("jsonwebtoken");
const { createResponse } = require("../utils");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json(createResponse(false, "Admin girişi gerekli.", {}));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.admin) {
      return res.status(403).json(createResponse(false, "Bu işlem için admin yetkisi gerekli.", {}));
    }

    req.admin = true;
    return next();
  } catch (error) {
    return res.status(401).json(createResponse(false, "Geçersiz veya süresi dolmuş admin oturumu.", {}));
  }
};
