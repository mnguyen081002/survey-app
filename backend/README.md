# Survey App Backend

Backend API cho ứng dụng khảo sát xây dựng với NestJS và PostgreSQL.

## Yêu cầu

- Node.js (>= 14.x)
- PostgreSQL
- Google OAuth Credentials

## Cài đặt

1. Cài đặt các dependencies:

```bash
npm install
```

2. Cấu hình file .env:

```
# Database
DATABASE_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=survey_app

# JWT Auth
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Server
PORT=3000

# Frontend
FRONTEND_URL=http://localhost:5173
```

3. Lấy Google OAuth Credentials:
   - Truy cập [Google Cloud Console](https://console.cloud.google.com/)
   - Tạo một project mới
   - Cấu hình OAuth consent screen
   - Tạo OAuth credentials (Client ID và Client Secret)
   - Thêm URL callback: `http://localhost:3000/api/auth/google/callback`

## Khởi động

Chế độ phát triển:

```bash
npm run start:dev
```

Chế độ sản xuất:

```bash
npm run build
npm run start:prod
```

## API Endpoints

API documentation có sẵn tại: http://localhost:3000/api/docs

### Xác thực

- `GET /api/auth/google` - Đăng nhập bằng Google
- `GET /api/auth/google/callback` - Callback từ Google OAuth
- `GET /api/auth/profile` - Lấy thông tin người dùng hiện tại

### Quản lý Survey

- `GET /api/surveys` - Lấy danh sách survey
- `GET /api/surveys/active` - Lấy danh sách survey đang hoạt động
- `GET /api/surveys/my-surveys` - Lấy danh sách survey của người dùng hiện tại
- `POST /api/surveys` - Tạo survey mới
- `GET /api/surveys/:id` - Lấy chi tiết survey
- `PATCH /api/surveys/:id` - Cập nhật survey
- `DELETE /api/surveys/:id` - Xóa survey

### Quản lý Response

- `GET /api/responses` - Lấy danh sách response
- `POST /api/responses` - Tạo response mới
- `GET /api/responses/:id` - Lấy chi tiết response
- `DELETE /api/responses/:id` - Xóa response
