# Hệ thống Quản lý Thư viện (Enterprise Library Management System)

Dự án Bài tập lớn môn **Phân tích và Thiết kế Hệ thống**, xây dựng Hệ thống Quản lý Thư viện theo **Kiến trúc 3 lớp (3-Tier Architecture)** sử dụng Node.js, Express và giao diện SPA (HTML5/Tailwind CSS).

---

## Tính năng & 7 Khối nghiệp vụ chính

1. **Xác thực & Phân quyền RBAC:** Kiểm soát truy cập theo 3 vai trò: Quản trị viên (Admin), Thủ thư (Librarian) và Bạn đọc (Reader).
2. **Cấp thẻ bạn đọc (UC02):** Khởi tạo hồ sơ thẻ thư viện và tự động kích hoạt tài khoản đăng nhập cho độc giả.
3. **Quản lý danh mục & Khai báo đầu sách:** Thêm mới và quản lý thông tin biên mục sách (ISBN, tên sách, tác giả, thể loại).
4. **Nhập kho & Sinh mã Barcode cá biệt:** Quản lý từng bản sao sách vật lý thông qua mã định danh Barcode duy nhất.
5. **Lập phiếu mượn sách:** Kiểm tra tự động điều kiện thẻ, hạn mức mượn và cập nhật trạng thái bản sao sách.
6. **Trả sách & Tính phí phạt quá hạn:** Tự động đối chiếu ngày hẹn trả và tính tiền phạt theo số ngày trễ hạn.
7. **Cổng tra cứu trực tuyến (OPAC):** Cho phép độc giả tìm kiếm sách, kiểm tra tình trạng sẵn sàng của từng mã Barcode và xem lịch sử mượn.

---

## Cấu trúc thư mục dự án

```text
library-management-system/
├── package.json              # Khai báo thông tin dự án và thư viện Express
├── server.js                 # Điểm khởi chạy HTTP Server và cấu hình Static/API
├── src/
│   ├── apiRoutes.js          # Định tuyến các RESTful API của 7 khối nghiệp vụ
│   ├── systemController.js   # Xử lý logic nghiệp vụ, kiểm tra ràng buộc & tính phạt
│   └── systemModel.js        # Kho lưu trữ dữ liệu tập trung và dữ liệu khởi tạo mẫu
└── public/
    └── index.html            # Giao diện người dùng SPA đa phân hệ
```

---

## Hướng dẫn cài đặt và khởi chạy

**Yêu cầu môi trường:** Máy tính đã cài đặt [Node.js](https://nodejs.org/).

1. **Cài đặt các gói thư viện phụ thuộc:**
   ```bash
   npm install
   ```

2. **Khởi động máy chủ:**
   ```bash
   npm start
   ```

3. **Truy cập ứng dụng:**
   Mở trình duyệt web và truy cập địa chỉ: `http://localhost:3000`

---

## Tài khoản kiểm thử hệ thống

| Vai trò | Tên đăng nhập | Mật khẩu | Phạm vi chức năng |
| :--- | :---: | :---: | :--- |
| **Quản trị viên (Admin)** | `admin` | `123` | Toàn quyền quản trị và vận hành nghiệp vụ |
| **Thủ thư (Librarian)** | `thuthu01` | `123` | Khai báo sách, nhập kho Barcode, cấp thẻ, mượn/trả sách |
| **Bạn đọc (Reader)** | `bandoc01` | `123` | Tra cứu danh mục OPAC và xem lịch sử mượn cá nhân |
