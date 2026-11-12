class SystemModel {
    constructor() {
        this.systemConfig = {
            soSachToiDa: 5,
            soNgayMuonToiDa: 14,
            mucPhatMotNgay: 5000
        };

        this.users = [
            { username: 'admin', password: '123', hoTen: 'Quản Trị Viên', role: 'ADMIN' },
            { username: 'thuthu01', password: '123', hoTen: 'Nguyễn Văn Thủ Thư', role: 'LIBRARIAN' },
            { username: 'bandoc01', password: '123', hoTen: 'Trần Hữu Hoàng', role: 'READER', maThe: 'LIB2026_00492' }
        ];

        this.danhMuc = {
            theLoai: ['Công nghệ Thông tin', 'Kinh tế & Quản trị', 'Văn học & Nghệ thuật', 'Ngoại ngữ'],
            tacGia: ['Robert C. Martin', 'Erich Gamma', 'Nguyễn Nhật Ánh', 'Dale Carnegie'],
            nxb: ['NXB Giáo Dục', 'NXB Trẻ', 'NXB Thông tin & Truyền thông'],
            ke: ['Kệ A1 - Tầng 1', 'Kệ B2 - Tầng 2', 'Kệ C3 - Tầng 3']
        };

        this.dauSach = [
            { maDauSach: 'DS001', tenSach: 'Clean Code - Mã Sạch', theLoai: 'Công nghệ Thông tin', tacGia: 'Robert C. Martin', nxb: 'NXB Giáo Dục', giaBia: 150000, ke: 'Kệ A1 - Tầng 1' },
            { maDauSach: 'DS002', tenSach: 'Đắc Nhân Tâm', theLoai: 'Kinh tế & Quản trị', tacGia: 'Dale Carnegie', nxb: 'NXB Trẻ', giaBia: 120000, ke: 'Kệ B2 - Tầng 2' }
        ];

        this.cuonSach = [
            { maBarcode: 'BC-DS001-01', maDauSach: 'DS001', tenSach: 'Clean Code - Mã Sạch', trangThai: 'Sẵn sàng' },
            { maBarcode: 'BC-DS001-02', maDauSach: 'DS001', tenSach: 'Clean Code - Mã Sạch', trangThai: 'Đã mượn' },
            { maBarcode: 'BC-DS002-01', maDauSach: 'DS002', tenSach: 'Đắc Nhân Tâm', trangThai: 'Sẵn sàng' }
        ];

        this.banDoc = [
            { maThe: 'LIB2026_00492', maSV: '24100492', hoTen: 'Trần Hữu Hoàng', doiTuong: 'Sinh viên', email: 'hoang.th@phenikaa.edu.vn', ngayCap: '2026-10-11', ngayHetHan: '2027-10-11', trangThai: 'Hoạt động' },
            { maThe: 'LIB2026_00108', maSV: 'GV0028', hoTen: 'Lê Thị Mai', doiTuong: 'Giảng viên', email: 'mai.lt@phenikaa.edu.vn', ngayCap: '2026-01-15', ngayHetHan: '2029-01-15', trangThai: 'Hoạt động' }
        ];

        this.phieuMuon = [
            { maPhieu: 'PM001', maThe: 'LIB2026_00492', hoTen: 'Trần Hữu Hoàng', maBarcode: 'BC-DS001-02', tenSach: 'Clean Code - Mã Sạch', ngayMuon: '2026-10-01', ngayHanTra: '2026-10-15', ngayTra: null, trangThai: 'Quá hạn' }
        ];

        this.thuPhat = [
            { maBienLai: 'BL001', maPhieu: 'PM000', maThe: 'LIB2026_00108', hoTen: 'Lê Thị Mai', soTien: 15000, lyDo: 'Trả sách quá hạn 3 ngày', ngayThu: '2026-10-10' }
        ];
    }

    getDataSummary() {
        return {
            config: this.systemConfig,
            danhMuc: this.danhMuc,
            dauSach: this.dauSach,
            cuonSach: this.cuonSach,
            banDoc: this.banDoc,
            phieuMuon: this.phieuMuon,
            thuPhat: this.thuPhat
        };
    }
}

module.exports = new SystemModel();