const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting để tránh spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 request per IP trong 15 phút
  message: {
    error: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút",
  },
});

// Cấu hình email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn
    pass: process.env.EMAIL_PASS, // App password của email
  },
});

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Vietnam format)
const isValidPhone = (phone) => {
  const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// API endpoint gửi email liên hệ
app.post("/api/contact", limiter, async (req, res) => {
  try {
    const { name, email, phone, message, recipientEmail } = req.body;

    // Validation dữ liệu đầu vào
    if (!name || !email || !phone || !message || !recipientEmail) {
      return res.status(400).json({
        success: false,
        error:
          "Vui lòng điền đầy đủ thông tin: tên, email, số điện thoại, tin nhắn và email người nhận",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Email không hợp lệ",
      });
    }

    if (!isValidEmail(recipientEmail)) {
      return res.status(400).json({
        success: false,
        error: "Email người nhận không hợp lệ",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        error: "Số điện thoại không hợp lệ",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Tên phải có ít nhất 2 ký tự",
      });
    }

    // Tạo nội dung email
    const emailContent = {
      from: `"${process.env.SENDER_NAME || "Website Contact Form"}" <${
        process.env.EMAIL_USER
      }>`,
      to: recipientEmail,
      subject: `Liên hệ mới từ ${name} - ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            📧 Liên Hệ Mới Từ Website
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Thông Tin Người Gửi:</h3>
            <p><strong>👤 Họ và tên:</strong> ${name}</p>
            <p><strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a></p>
            <p><strong>📱 Số điện thoại:</strong> <a href="tel:${phone}" style="color: #007bff; text-decoration: none;">${phone}</a></p>
          </div>

          <div style="background-color: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
            <h3 style="color: #28a745; margin-top: 0;">💬 Nội Dung Tin Nhắn:</h3>
            <p style="line-height: 1.6; color: #333; background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 0;">
              ${message.replace(/\n/g, "<br>")}
            </p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              📅 Thời gian nhận: ${new Date().toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
              })}
            </p>
          </div>

          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px;">
            <p>Email này được gửi tự động từ form liên hệ trên website</p>
          </div>
        </div>
      `,
      // Fallback text version
      text: `
        LIÊN HỆ MỚI TỪ WEBSITE

        Thông tin người gửi:
        - Họ và tên: ${name}
        - Email: ${email}
        - Số điện thoại: ${phone}

        Nội dung tin nhắn:
        ${message}

        Thời gian nhận: ${new Date().toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
        })}
      `,
    };

    // Gửi email
    const info = await transporter.sendMail(emailContent);

    console.log("Email sent successfully:", info.messageId);

    res.status(200).json({
      success: true,
      message: "Email đã được gửi thành công!",
      data: {
        messageId: info.messageId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);

    res.status(500).json({
      success: false,
      error: "Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API đang hoạt động bình thường",
    timestamp: new Date().toISOString(),
  });
});

// Test email configuration
app.get("/api/test-email-config", async (req, res) => {
  try {
    await transporter.verify();
    res.status(200).json({
      success: true,
      message: "Cấu hình email hợp lệ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Cấu hình email không hợp lệ",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint không tồn tại",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    success: false,
    error: "Lỗi server không xác định",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại port ${PORT}`);
  console.log(
    `📧 Email service: ${
      process.env.EMAIL_USER ? "Đã cấu hình" : "Chưa cấu hình"
    }`
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
