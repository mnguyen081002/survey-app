# Nền Tảng Khảo Sát - Backend

API Backend cho ứng dụng khảo sát được xây dựng với NestJS, TypeScript và PostgreSQL. Ứng dụng hỗ trợ xác thực qua Google OAuth, quản lý khảo sát và tạo báo cáo với tích hợp AI.

## Tính Năng Chính

- Xác thực người dùng thông qua Google OAuth
- Tạo và quản lý khảo sát với cấu trúc JSON linh hoạt
- Thu thập và lưu trữ phản hồi khảo sát
- Phân tích phản hồi với hỗ trợ AI sử dụng Gemini
- Kết nối xã hội giữa người dùng
- API RESTful với tài liệu Swagger

## Công Nghệ Sử Dụng

- NestJS - Framework Node.js
- TypeScript - Ngôn ngữ lập trình
- PostgreSQL - Cơ sở dữ liệu với hỗ trợ JSONB
- TypeORM - ORM quản lý cơ sở dữ liệu
- JWT - Xác thực token, lưu trong Cookie
- Passport - Xác thực Google OAuth
- Google GenAI (Gemini) - Phân tích AI cho kết quả khảo sát
- Swagger - Tài liệu API
- Jest - Testing framework

## Yêu Cầu Hệ Thống

- Node.js (>= 19.x)
- PostgreSQL
- Google OAuth Credentials
- Google AI API Key (Gemini)

## Cài Đặt

1. Clone dự án về máy

2. Cài đặt các dependencies:

```bash
npm install
```

3. Cấu hình file .env:

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

# Google AI
GOOGLE_AI_API_KEY=your_gemini_api_key

# Server
PORT=3000

# Frontend
FRONTEND_URL=http://localhost:5173
```

4. Thiết lập Google Services:

   - **Google OAuth**:

     - Truy cập [Google Cloud Console](https://console.cloud.google.com/)
     - Tạo một project mới
     - Cấu hình OAuth consent screen
     - Tạo OAuth credentials (Client ID và Client Secret)
     - Thêm URL callback: `http://localhost:3000/api/auth/google/callback`

   - **Google Gemini AI**:
     - Đăng ký Gemini API từ [Google AI Studio](https://ai.google.dev/)
     - Lấy API key và cấu hình trong file .env

## Khởi Động Ứng Dụng

Chế độ phát triển:

```bash
npm run start:dev
```

Chế độ sản xuất:

```bash
npm run build
npm run start:prod
```

Chạy tests:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Cấu Trúc Dự Án

```
src/
├── ai/              # Tích hợp Gemini AI
├── auth/            # Xác thực và Google OAuth
├── common/          # Các utility, guards và interceptors
├── social-connections/ # Kết nối xã hội giữa người dùng
├── surveys/         # Quản lý khảo sát
├── responses/       # Quản lý phản hồi khảo sát
├── users/           # Quản lý người dùng
├── @types/          # TypeScript type definitions
├── app.module.ts    # Module gốc
└── main.ts          # Điểm khởi đầu ứng dụng
```

## Kiến Trúc Phần Mềm

Dự án được tổ chức theo các nguyên tắc SOLID:

- **Single Responsibility Principle**: Mỗi module (users, surveys, responses, auth, ai) chỉ xử lý một chức năng nghiệp vụ cụ thể.

- **Open/Closed Principle**: Sử dụng cơ chế mở rộng của NestJS (providers, interceptors, và guards) để mở rộng chức năng mà không thay đổi code hiện có.

- **Liskov Substitution Principle**: Sử dụng các abstract class (như BaseEntity, BaseController) để đảm bảo tính nhất quán giữa các lớp kế thừa.

- **Interface Segregation Principle**: API được chia thành các controller nhỏ (AuthController, SurveysController, ...) với các endpoint chức năng rõ ràng.

- **Dependency Inversion Principle**: Sử dụng Dependency Injection của NestJS để tách biệt các dependency giữa các module.

## Entities Chính

- **User**: Người dùng hệ thống, xác thực qua Google OAuth
- **Survey**: Khảo sát với cấu trúc linh hoạt lưu dưới dạng JSONB
- **Response**: Phản hồi khảo sát từ người dùng
- **SocialConnection**: Kết nối xã hội giữa người dùng

## API Endpoints

API documentation có sẵn tại: http://localhost:3000/api/docs

### Xác thực

- `GET /api/auth/google` - Đăng nhập bằng Google
- `GET /api/auth/google/callback` - Callback từ Google OAuth
- `GET /api/auth/profile` - Lấy thông tin người dùng hiện tại

### Quản lý User

- `GET /api/users` - Lấy danh sách người dùng
- `GET /api/users/:id` - Lấy thông tin người dùng

### Quản lý Survey

- `GET /api/surveys` - Lấy danh sách khảo sát
- `GET /api/surveys/active` - Lấy danh sách khảo sát đang hoạt động
- `GET /api/surveys/my-surveys` - Lấy danh sách khảo sát của người dùng hiện tại
- `POST /api/surveys` - Tạo khảo sát mới
- `GET /api/surveys/:id` - Lấy chi tiết khảo sát
- `PATCH /api/surveys/:id` - Cập nhật khảo sát
- `DELETE /api/surveys/:id` - Xóa khảo sát

### Quản lý Response

- `GET /api/responses` - Lấy danh sách phản hồi
- `POST /api/responses` - Tạo phản hồi mới
- `GET /api/responses/:id` - Lấy chi tiết phản hồi
- `GET /api/surveys/:id/responses` - Lấy tất cả phản hồi cho một khảo sát
- `DELETE /api/responses/:id` - Xóa phản hồi

### AI và phân tích

- `POST /api/ai/summarize` - Tạo tóm tắt AI cho kết quả khảo sát

## Tích hợp AI với Gemini

Ứng dụng sử dụng Google Gemini AI để phân tích và tóm tắt kết quả khảo sát:

- AiService cung cấp khả năng tạo tóm tắt thông minh từ dữ liệu khảo sát
- Sử dụng `gemini-2.0-flash` model cho phân tích nhanh
- Kết quả AI được lưu trong trường `aiSummary` của entity Survey

## Bảo Mật

- Sử dụng JWT cho xác thực API, lưu trong cookie
- Bảo vệ route với Guards
- Xác thực Google OAuth
- CORS được cấu hình để chỉ cho phép frontend truy cập

## Docker

Build và chạy với Docker:

```bash
# Build image
docker build -t survey-app-backend .

# Run container
docker run -p 3000:3000 survey-app-backend
```
