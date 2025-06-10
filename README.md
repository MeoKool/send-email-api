# API Gửi Email Liên Hệ - Node.js

API Node.js đơn giản để xử lý form liên hệ và gửi email tự động.

## 🚀 Tính năng

- ✅ Nhận thông tin liên hệ qua API POST
- ✅ Gửi email tự động với template đẹp
- ✅ Validation dữ liệu đầu vào
- ✅ Rate limiting chống spam
- ✅ Hỗ trợ CORS
- ✅ Error handling tốt
- ✅ Format email đẹp với HTML

## 📋 Yêu cầu

- Node.js >= 16.0.0
- NPM hoặc Yarn
- Gmail account (hoặc email service khác)

## 🛠️ Cài đặt

### 1. Clone hoặc tạo project mới

```bash
mkdir contact-email-api
cd contact-email-api
```

### 2. Tạo các file

Tạo file `server.js` với code từ artifact đầu tiên
Tạo file `package.json` với nội dung từ artifact thứ hai

### 3. Cài đặt dependencies

```bash
npm install
```

### 4. Cấu hình môi trường

Tạo file `.env` và cấu hình:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
PORT=3000
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SENDER_NAME=Website Contact Form
```

### 5. Lấy App Password cho Gmail

1. Vào [Google Account Settings](https://myaccount.google.com/)
2. Chọn **Security** → **2-Step Verification** (bật nếu chưa có)
3. Vào **App passwords** → **Select app** → **Other**
4. Nhập tên app → **Generate**
5. Copy mật khẩu 16 ký tự vào `EMAIL_PASS`

## 🚀 Chạy ứng dụng

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## 📡 API Endpoints

### 1. Gửi email liên hệ

**POST** `/api/contact`

**Request Body:**

```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0987654321",
  "message": "Nội dung tin nhắn cần gửi",
  "recipientEmail": "admin@company.com"
}
```

**Response thành công:**

```json
{
  "success": true,
  "message": "Email đã được gửi thành công!",
  "data": {
    "messageId": "<message-id>",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response lỗi:**

```json
{
  "success": false,
  "error": "Email không hợp lệ"
}
```

### 2. Health check

**GET** `/api/health`

### 3. Test cấu hình email

**GET** `/api/test-email-config`

## 🧪 Test API

### Sử dụng cURL

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone": "0987654321",
    "message": "Xin chào, tôi muốn liên hệ về dịch vụ của công ty.",
    "recipientEmail": "admin@company.com"
  }'
```

### Sử dụng JavaScript (Frontend)

```javascript
const sendContactEmail = async (formData) => {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      alert("Email đã được gửi thành công!");
    } else {
      alert("Lỗi: " + result.error);
    }
  } catch (error) {
    alert("Có lỗi xảy ra: " + error.message);
  }
};

// Sử dụng
sendContactEmail({
  name: "Nguyễn Văn A",
  email: "user@example.com",
  phone: "0987654321",
  message: "Nội dung tin nhắn",
  recipientEmail: "admin@company.com",
});
```

## 🔒 Bảo mật

- Rate limiting: 5 requests/15 phút per IP
- Input validation và sanitization
- CORS protection
- Environment variables cho sensitive data

## 🛡️ Validation Rules

- **Name**: Tối thiểu 2 ký tự
- **Email**: Format email hợp lệ
- **Phone**: Format số điện thoại Việt Nam (0xxxxxxxxx, +84xxxxxxxxx)
- **Message**: Tối thiểu 10 ký tự
- **RecipientEmail**: Format email hợp lệ
