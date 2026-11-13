function formatDate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function addDays(dateStr, days) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + Number(days));
    return formatDate(dt);
}

function diffDays(laterDateStr, earlierDateStr) {
    const [y1, m1, d1] = laterDateStr.split('-').map(Number);
    const [y2, m2, d2] = earlierDateStr.split('-').map(Number);
    const ms = Date.UTC(y1, m1 - 1, d1) - Date.UTC(y2, m2 - 1, d2);
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

class SystemModel {
    constructor() {
        if (SystemModel.instance) {
            return SystemModel.instance;
        }

        const today = formatDate(new Date());

        this.settings = {
            finePerDay: 5000,
            defaultLoanDays: 14,
            maxBooksPerReader: 5,
            renewDays: 7,
            maxRenewals: 1,
            cardValidMonths: 12
        };

        this.users = [
            { id: 'U01', username: 'admin', password: '123', role: 'ADMIN', fullName: 'Quản trị viên Hệ thống', cardId: null, active: true },
            { id: 'U02', username: 'thuthu01', password: '123', role: 'LIBRARIAN', fullName: 'Nguyễn Thị Lan', cardId: null, active: true },
            { id: 'U03', username: 'bandoc01', password: '123', role: 'READER', fullName: 'Trần Minh Quân', cardId: 'DG001', active: true },
            { id: 'U04', username: 'bandoc02', password: '123', role: 'READER', fullName: 'Lê Thu Hà', cardId: 'DG002', active: true }
        ];

        this.readers = [
            {
                cardId: 'DG001',
                fullName: 'Trần Minh Quân',
                studentCode: 'SV2023001',
                email: 'quan.tm@student.edu.vn',
                phone: '0912345678',
                issuedDate: addDays(today, -30),
                expiryDate: addDays(today, 335),
                status: 'HOAT_DONG'
            },
            {
                cardId: 'DG002',
                fullName: 'Lê Thu Hà',
                studentCode: 'SV2023045',
                email: 'ha.lt@student.edu.vn',
                phone: '0987654321',
                issuedDate: addDays(today, -60),
                expiryDate: addDays(today, 305),
                status: 'HOAT_DONG'
            }
        ];

        this.categories = ['Công nghệ thông tin', 'Kỹ thuật phần mềm', 'Trí tuệ nhân tạo', 'Cơ sở dữ liệu', 'Mạng máy tính'];

        this.books = [
            { isbn: '978-604-01', title: 'Phân tích và Thiết kế Hệ thống Thông tin', author: 'Nguyễn Văn Ba', category: 'Công nghệ thông tin', publisher: 'NXB Giáo dục', publishYear: 2024 },
            { isbn: '978-604-02', title: 'Clean Code - Mã sạch và Tư duy Lập trình', author: 'Robert C. Martin', category: 'Kỹ thuật phần mềm', publisher: 'NXB Khoa học Kỹ thuật', publishYear: 2022 },
            { isbn: '978-604-03', title: 'Giáo trình Cơ sở Dữ liệu Quan hệ', author: 'Lê Tiến Vương', category: 'Cơ sở dữ liệu', publisher: 'NXB Đại học Quốc gia', publishYear: 2023 },
            { isbn: '978-604-04', title: 'Thiết kế Hướng đối tượng với UML 2.5', author: 'Grady Booch', category: 'Kỹ thuật phần mềm', publisher: 'NXB Thông tin & Truyền thông', publishYear: 2021 },
            { isbn: '978-604-05', title: 'Nhập môn Trí tuệ Nhân tạo & Học máy', author: 'Stuart Russell', category: 'Trí tuệ nhân tạo', publisher: 'NXB Bách Khoa', publishYear: 2025 }
        ];

        this.copies = [
            { barcode: 'BC-1001', isbn: '978-604-01', status: 'DANG_MUON', location: 'Kệ A1 - Tầng 2', importId: 'PN-001' },
            { barcode: 'BC-1002', isbn: '978-604-01', status: 'SAN_SANG', location: 'Kệ A1 - Tầng 2', importId: 'PN-001' },
            { barcode: 'BC-1003', isbn: '978-604-02', status: 'SAN_SANG', location: 'Kệ A2 - Tầng 2', importId: 'PN-001' },
            { barcode: 'BC-1004', isbn: '978-604-02', status: 'SAN_SANG', location: 'Kệ A2 - Tầng 2', importId: 'PN-001' },
            { barcode: 'BC-1005', isbn: '978-604-03', status: 'SAN_SANG', location: 'Kệ B1 - Tầng 2', importId: 'PN-002' },
            { barcode: 'BC-1006', isbn: '978-604-04', status: 'SAN_SANG', location: 'Kệ B2 - Tầng 2', importId: 'PN-002' },
            { barcode: 'BC-1007', isbn: '978-604-05', status: 'SAN_SANG', location: 'Kệ C1 - Tầng 3', importId: 'PN-002' }
        ];

        this.importSlips = [
            {
                importId: 'PN-001',
                importDate: addDays(today, -45),
                supplier: 'Công ty Phát hành Sách Fahasa',
                librarian: 'Nguyễn Thị Lan',
                isbn: '978-604-01',
                bookTitle: 'Phân tích và Thiết kế Hệ thống Thông tin',
                quantity: 2,
                unitPrice: 120000,
                totalCost: 240000,
                barcodes: ['BC-1001', 'BC-1002'],
                note: 'Nhập bổ sung học kỳ 1'
            },
            {
                importId: 'PN-002',
                importDate: addDays(today, -20),
                supplier: 'NXB Đại học Quốc gia',
                librarian: 'Nguyễn Thị Lan',
                isbn: '978-604-03',
                bookTitle: 'Giáo trình Cơ sở Dữ liệu Quan hệ',
                quantity: 1,
                unitPrice: 95000,
                totalCost: 95000,
                barcodes: ['BC-1005'],
                note: 'Nhập giáo trình chuyên ngành'
            }
        ];

        this.loans = [
            {
                loanId: 'PM-001',
                cardId: 'DG001',
                barcode: 'BC-1001',
                isbn: '978-604-01',
                bookTitle: 'Phân tích và Thiết kế Hệ thống Thông tin',
                borrowDate: addDays(today, -8),
                dueDate: addDays(today, 6),
                returnDate: null,
                status: 'DANG_MUON',
                renewCount: 0,
                fineAmount: 0,
                fineCollected: false
            },
            {
                loanId: 'PM-000',
                cardId: 'DG001',
                barcode: 'BC-1003',
                isbn: '978-604-02',
                bookTitle: 'Clean Code - Mã sạch và Tư duy Lập trình',
                borrowDate: addDays(today, -25),
                dueDate: addDays(today, -11),
                returnDate: addDays(today, -9),
                status: 'DA_TRA',
                renewCount: 0,
                fineAmount: 10000,
                fineCollected: true
            }
        ];

        this.renewalRequests = [];

        this.userSeq = 5;
        this.readerSeq = 3;
        this.barcodeSeq = 1008;
        this.importSeq = 3;
        this.loanSeq = 2;
        this.renewSeq = 1;

        SystemModel.instance = this;
    }

    getToday() {
        return formatDate(new Date());
    }

    addDays(dateStr, days) {
        return addDays(dateStr, days);
    }

    diffDays(laterDateStr, earlierDateStr) {
        return diffDays(laterDateStr, earlierDateStr);
    }
}

module.exports = new SystemModel();