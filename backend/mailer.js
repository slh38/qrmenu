const nodemailer = require("nodemailer");

function getMailerConfig() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    return null;
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    from: MAIL_FROM,
  };
}

async function sendPasswordResetEmail({ to, businessName, resetUrl }) {
  const config = getMailerConfig();

  if (!config) {
    throw new Error("SMTP ayarlari eksik. Lutfen e-posta ayarlarini tamamlayin.");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject: "JokerQRMenu sifre sifirlama",
    text: [
      `Merhaba ${businessName || "JokerQRMenu kullanicisi"},`,
      "",
      "Sifrenizi sifirlamak icin asagidaki baglantiyi kullanin:",
      resetUrl,
      "",
      "Bu baglanti 1 saat boyunca gecerlidir.",
      "Eger bu istegi siz yapmadiysaniz bu e-postayi dikkate almayin.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#0f172a">
        <h2>JokerQRMenu şifre sıfırlama</h2>
        <p>Merhaba ${businessName || "JokerQRMenu kullanıcısı"},</p>
        <p>Şifrenizi sıfırlamak için aşağıdaki butonu kullanın:</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:12px;font-weight:700">
            Şifremi Sıfırla
          </a>
        </p>
        <p>Bu bağlantı <strong>1 saat</strong> boyunca geçerlidir.</p>
        <p>Eğer bu isteği siz yapmadıysanız bu e-postayı dikkate almayın.</p>
      </div>
    `,
  });
}

module.exports = {
  sendPasswordResetEmail,
};
