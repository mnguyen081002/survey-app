# Nền Tảng Khảo Sát - Frontend

Nền tảng khảo sát hiện đại được xây dựng bằng React, TypeScript và NextUI.

## Tính Năng Chính

- Tạo và quản lý khảo sát
- Phản hồi khảo sát
- Xem báo cáo khảo sát
- Xuất báo cáo ra định dạng DOCX
- Xác thực qua Google OAuth

## Công Nghệ Sử Dụng

- React - Thư viện UI
- TypeScript - Ngôn ngữ lập trình
- Vite - Công cụ build
- NextUI - Thư viện UI components
- Tailwind CSS - Framework CSS
- React Query - Quản lý trạng thái và fetch dữ liệu
- SurveyJS - Thư viện tạo khảo sát
- React Router - Điều hướng trong ứng dụng

## Bắt Đầu

### Yêu Cầu Hệ Thống

- Node.js 19+
- npm 9+

### Cài Đặt

1. Clone dự án về máy
2. Cài đặt các dependencies:
   ```bash
   npm install
   ```

### Phát Triển

Khởi động máy chủ phát triển:

```bash
npm run dev
```

Ứng dụng sẽ chạy tại địa chỉ `http://localhost:5173`.

### Build Sản Phẩm

Để build ứng dụng cho môi trường production:

```bash
npm run build
```

Các file đã build sẽ được lưu trong thư mục `dist`.

## Cấu Trúc Dự Án

```
src/
├── components/     # Các component tái sử dụng
├── pages/         # Các component trang
├── hooks/         # Custom hooks
├── services/      # Dịch vụ API
├── utils/         # Các hàm tiện ích
├── contexts/      # React contexts
├── types/         # Định nghĩa kiểu TypeScript
└── assets/        # Tài nguyên tĩnh
```

## Kiến Trúc Phần Mềm

Dự án được tổ chức theo các nguyên tắc SOLID:

- **Single Responsibility Principle**: Mỗi component và service chỉ đảm nhiệm một chức năng duy nhất
- **Open/Closed Principle**: Cấu trúc cho phép mở rộng mà không cần sửa đổi code hiện có
- **Liskov Substitution Principle**: Các interface được thiết kế để đảm bảo tính nhất quán
- **Interface Segregation Principle**: API được chia nhỏ theo chức năng
- **Dependency Inversion Principle**: Sử dụng dependency injection và custom hooks

## Tích Hợp API

Frontend kết nối với backend API tại `http://localhost:3000`. Các endpoint API:

- `GET /api/surveys` - Lấy tất cả khảo sát
- `GET /api/surveys/:id` - Lấy khảo sát theo ID
- `POST /api/surveys` - Tạo khảo sát mới
- `PUT /api/surveys/:id` - Cập nhật khảo sát
- `DELETE /api/surveys/:id` - Xóa khảo sát
- `POST /api/surveys/:id/responses` - Gửi phản hồi
- `GET /api/surveys/:id/responses` - Lấy phản hồi khảo sát
- `GET /api/reports/:id` - Lấy báo cáo

## Xác Thực

Ứng dụng sử dụng Google OAuth cho xác thực. Bạn cần:

1. Tạo một Google OAuth client ID
2. Thêm client ID vào biến môi trường
3. Cấu hình backend để xử lý OAuth callbacks
