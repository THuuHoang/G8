# Hệ thống Quản lý Thư viện (Enterprise Library Management System)

Đồ án môn học **Phân tích và Thiết kế Hệ thống** — Xây dựng hệ thống quản lý thư viện theo **Kiến trúc 3 lớp (3-Tier Architecture)**, áp dụng phân quyền dựa trên vai trò (RBAC) và các mẫu thiết kế phần mềm (Design Patterns).

---

## 1. Tổng quan & 7 Khối nghiệp vụ chính

Hệ thống tin học hóa toàn bộ vòng đời tài liệu và quy trình lưu thông trong thư viện thông qua 7 Use-case cốt lõi:

1. **UC01 – Đăng nhập & Phân quyền (RBAC):** Xác thực tài khoản và tự động điều hướng giao diện, phân tách quyền hạn theo 3 vai trò: **Quản trị viên (Admin)**, **Thủ thư (Librarian)** và **Bạn đọc (Reader)**.
2. **UC02 – Cấp thẻ bạn đọc:** Thủ thư khởi tạo hồ sơ thẻ thư viện cho độc giả tại quầy, tự động sinh mã thẻ định danh và kích hoạt tài khoản đăng nhập cho bạn đọc.
3. **UC03 – Quản lý danh mục & Khai báo đầu sách:** Biên mục thông tin chung của đầu sách (Mã ISBN, tên sách, tác giả, thể loại, năm xuất bản).
4. **UC04 – Nhập kho & Sinh mã Barcode cá biệt:** Nhập số lượng bản sao vật lý cho từng đầu sách; hệ thống tự động sinh mã vạch cá biệt (Barcode) duy nhất để theo dõi trạng thái từng cuốn sách riêng lẻ.
5. **UC05 – Lập phiếu mượn sách:** Kiểm tra tự động điều kiện thẻ bạn đọc (còn hạn sử dụng, chưa vượt hạn mức tối đa 5 cuốn) và trạng thái sẵn sàng (`SAN_SANG`) của mã Barcode trước khi ghi nhận giao dịch mượn.
6. **UC06 – Trả sách & Tính phí phạt quá hạn:** Tiếp nhận hoàn trả qua mã Barcode, tự động đối chiếu ngày hẹn trả để tính phí phạt trễ hạn (`5.000 VNĐ/ngày`) và khôi phục trạng thái sẵn sàng cho bản sao sách.
7. **UC07 – Cổng tra cứu trực tuyến (OPAC):** Cho phép bạn đọc tìm kiếm sách theo tên, tác giả, thể loại hoặc mã ISBN; kiểm tra tình trạng từng bản sao trên kệ và theo dõi lịch sử mượn cá nhân.

---

## 2. Kiến trúc hệ thống & Công nghệ sử dụng

Hệ thống được thiết kế theo **Kiến trúc 3 lớp (3-Tier Architecture)** tách biệt hoàn toàn giữa giao diện, xử lý nghiệp vụ và lưu trữ dữ liệu:

* **Tầng Trình diễn (Presentation Tier – `public/index.html`):** Xây dựng theo mô hình Single Page Application (SPA) bằng **HTML5**, **Tailwind CSS** và **Vanilla JavaScript (Fetch API)**, giao tiếp bất đồng bộ với máy chủ qua định dạng JSON.
* **Tầng Xử lý Nghiệp vụ (Business Logic Tier – `server.js`, `src/apiRoutes.js`, `src/systemController.js`):** Sử dụng **Node.js** và **Express.js** để định tuyến RESTful API, kiểm tra ràng buộc nghiệp vụ và thực thi phân quyền.
* **Tầng Dữ liệu (Data Storage Tier – `src/systemModel.js`):** Cấu trúc lưu trữ hướng đối tượng tập trung trong bộ nhớ (In-Memory Structured Store) kèm bộ dữ liệu khởi tạo mẫu.
* **Design Patterns áp dụng:**
  * **Singleton Pattern** (`systemModel.js`): Đảm bảo chỉ tồn tại một thể hiện dữ liệu duy nhất xuyên suốt vòng đời ứng dụng, tránh xung đột trạng thái mã Barcode khi nhiều người dùng thao tác đồng thời.
  * **Facade Pattern** (`systemController.js`): Đóng gói toàn bộ quy trình kiểm tra đa điều kiện (thẻ bạn đọc, hạn mức, mã vạch, tính phạt) sau các phương thức giao diện gọn nhẹ cho lớp định tuyến gọi tới.

---

## 3. Cấu trúc thư mục dự án

```text
library-management-system/
├── package.json              # Khai báo thông tin dự án và thư viện Express
├── package-lock.json         # Khóa phiên bản các gói phụ thuộc
├── server.js                 # Điểm khởi chạy HTTP Server (Port 3000)
├── .gitignore                # Loại trừ node_modules/ và .env khỏi Git
├── README.md                 # Tài liệu hướng dẫn cài đặt và sử dụng
├── src/
│   ├── apiRoutes.js          # Định tuyến các RESTful API của 7 khối nghiệp vụ
│   ├── systemController.js   # Xử lý logic nghiệp vụ, kiểm tra ràng buộc & tính phạt
│   └── systemModel.js        # Kho lưu trữ dữ liệu tập trung và dữ liệu mẫu
└── public/
    └── index.html            # Giao diện người dùng SPA đa phân hệ
```

---

## 4. Hướng dẫn cài đặt và khởi chạy

**Yêu cầu môi trường:** Máy tính đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 16 trở lên).

1. **Tải mã nguồn về máy:**
   ```bash
   git clone [https://github.com/THuuHoang/G8.git](https://github.com/THuuHoang/G8.git)
   cd G8
   ```
   *(Hoặc bấm nút **Code $\rightarrow$ Download ZIP** trên GitHub, giải nén và mở thư mục bằng VS Code).*

2. **Cài đặt các gói thư viện phụ thuộc:**
   ```bash
   npm install
   ```

3. **Khởi động máy chủ:**
   ```bash
   npm start
   ```

4. **Truy cập ứng dụng:**
   Mở trình duyệt web và truy cập địa chỉ: `http://localhost:3000`

---

## 5. Tài khoản kiểm thử mẫu

Hệ thống đã khởi tạo sẵn dữ liệu mẫu gồm đầu sách, mã Barcode, thẻ độc giả và 3 tài khoản đại diện cho từng vai trò:

| Vai trò | Tên đăng nhập | Mật khẩu | Phạm vi chức năng được cấp quyền |
| :--- | :---: | :---: | :--- |
| **Quản trị viên (Admin)** | `admin` | `123` | Toàn quyền quản trị hệ thống, xem thống kê và thực thi mọi nghiệp vụ |
| **Thủ thư (Librarian)** | `thuthu01` | `123` | Khai báo đầu sách, nhập kho sinh Barcode, cấp thẻ bạn đọc, lập phiếu mượn/trả |
| **Bạn đọc (Reader)** | `bandoc01` | `123` | Tra cứu danh mục sách trực tuyến (OPAC) và xem lịch sử mượn cá nhân |

---

## 6. Thành viên nhóm thực hiện

| STT | Mã sinh viên | Họ và tên | Vai trò / Nhiệm vụ chính |
| :---: | :---: | :--- | :--- |
| 1 | `24100492` | `Trần Hữu Hoàng` | Phân tích nghiệp vụ, đặc tả Use-case, tổng hợp báo cáo |
| 2 | `` | `` | Thiết kế biểu đồ UML & cấu trúc dữ liệu |
| 3 | `` | `` | Phát triển Backend Node.js/Express & phân quyền RBAC |
| 4 | `` | `` | Xây dựng giao diện SPA & kiểm thử hệ thống |
