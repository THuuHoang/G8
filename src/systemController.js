const systemModel = require('./systemModel');

class SystemController {
    login(req, res) {
        const { username, password } = req.body;
        const user = systemModel.users.find(u => u.username === username && u.password === password);
        if (!user) {
            return res.status(401).json({ status: 'ERROR', message: 'Tài khoản hoặc mật khẩu không chính xác!' });
        }
        const { password: _, ...userInfo } = user;
        res.json({
            status: 'SUCCESS',
            message: `Đăng nhập thành công với vai trò: ${userInfo.role}`,
            user: userInfo
        });
    }

    getSummary(req, res) {
        res.json({ status: 'SUCCESS', data: systemModel.getDataSummary() });
    }

    addDauSach(req, res) {
        const { tenSach, theLoai, tacGia, nxb, giaBia, ke } = req.body;
        if (!tenSach) return res.status(400).json({ status: 'ERROR', message: 'Tên sách không được để trống!' });

        const maDauSach = `DS00${systemModel.dauSach.length + 1}`;
        const newBook = { maDauSach, tenSach, theLoai, tacGia, nxb, giaBia: parseInt(giaBia) || 100000, ke };
        systemModel.dauSach.unshift(newBook);

        res.json({ status: 'SUCCESS', message: 'Khai báo đầu sách thành công!', data: newBook });
    }

    nhapKhoBarcode(req, res) {
        const { maDauSach, soLuong } = req.body;
        const book = systemModel.dauSach.find(b => b.maDauSach === maDauSach);
        if (!book) return res.status(400).json({ status: 'ERROR', message: 'Không tìm thấy đầu sách!' });

        const count = parseInt(soLuong) || 1;
        const createdBarcodes = [];
        for (let i = 1; i <= count; i++) {
            const barcode = `BC-${maDauSach}-${systemModel.cuonSach.length + i}`;
            const item = { maBarcode: barcode, maDauSach, tenSach: book.tenSach, trangThai: 'Sẵn sàng' };
            systemModel.cuonSach.unshift(item);
            createdBarcodes.push(barcode);
        }

        res.json({ status: 'SUCCESS', message: `Đã nhập kho thành công và tự động sinh ${count} mã Barcode!`, barcodes: createdBarcodes });
    }

    createBanDoc(req, res) {
        const { maSV, hoTen, doiTuong, email } = req.body;
        if (!maSV || !hoTen) return res.status(400).json({ status: 'ERROR', message: 'Vui lòng điền đủ Mã SV/GV và Họ tên!' });

        const isExist = systemModel.banDoc.some(b => b.maSV === maSV);
        if (isExist) return res.status(400).json({ status: 'ERROR', message: 'Mã SV/GV này đã được cấp thẻ trên hệ thống!' });

        const maThe = `LIB2026_${Math.floor(10000 + Math.random() * 90000)}`;
        const today = new Date();
        const ngayCap = today.toISOString().split('T')[0];
        
        const expiry = new Date();
        expiry.setFullYear(today.getFullYear() + (doiTuong === 'Giảng viên' ? 3 : 1));
        const ngayHetHan = expiry.toISOString().split('T')[0];

        const newCard = { maThe, maSV, hoTen, doiTuong, email, ngayCap, ngayHetHan, trangThai: 'Hoạt động' };
        systemModel.banDoc.unshift(newCard);

        res.json({ status: 'SUCCESS', message: 'Cấp thẻ bạn đọc thành công!', data: newCard });
    }

    lapPhieuMuon(req, res) {
        const { maThe, maBarcode } = req.body;
        const card = systemModel.banDoc.find(c => c.maThe === maThe);
        const book = systemModel.cuonSach.find(b => b.maBarcode === maBarcode);

        if (!card || card.trangThai !== 'Hoạt động') {
            return res.status(400).json({ status: 'ERROR', message: 'Thẻ bạn đọc không tồn tại hoặc đang bị KHÓA!' });
        }
        if (!book || book.trangThai !== 'Sẵn sàng') {
            return res.status(400).json({ status: 'ERROR', message: 'Sách này không sẵn sàng trong kho!' });
        }

        book.trangThai = 'Đã mượn';

        const today = new Date();
        const ngayMuon = today.toISOString().split('T')[0];
        const hanTra = new Date();
        hanTra.setDate(today.getDate() + systemModel.systemConfig.soNgayMuonToiDa);
        const ngayHanTra = hanTra.toISOString().split('T')[0];

        const maPhieu = `PM00${systemModel.phieuMuon.length + 1}`;
        const phieu = { maPhieu, maThe, hoTen: card.hoTen, maBarcode, tenSach: book.tenSach, ngayMuon, ngayHanTra, ngayTra: null, trangThai: 'Đang mượn' };
        systemModel.phieuMuon.unshift(phieu);

        res.json({ status: 'SUCCESS', message: 'Lập phiếu mượn thành công!', data: phieu });
    }

    traSach(req, res) {
        const { maPhieu } = req.body;
        const phieu = systemModel.phieuMuon.find(p => p.maPhieu === maPhieu && p.trangThai !== 'Đã trả');
        if (!phieu) return res.status(400).json({ status: 'ERROR', message: 'Phiếu mượn không tồn tại hoặc đã trả rồi!' });

        const today = new Date();
        const ngayTraStr = today.toISOString().split('T')[0];
        phieu.ngayTra = ngayTraStr;
        phieu.trangThai = 'Đã trả';

        const book = systemModel.cuonSach.find(b => b.maBarcode === phieu.maBarcode);
        if (book) book.trangThai = 'Sẵn sàng';

        const hanTraDate = new Date(phieu.ngayHanTra);
        let tienPhat = 0;
        let soNgayTre = 0;

        if (today > hanTraDate) {
            const diffTime = Math.abs(today - hanTraDate);
            soNgayTre = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            tienPhat = soNgayTre * systemModel.systemConfig.mucPhatMotNgay;

            const maBienLai = `BL00${systemModel.thuPhat.length + 1}`;
            systemModel.thuPhat.unshift({
                maBienLai,
                maPhieu: phieu.maPhieu,
                maThe: phieu.maThe,
                hoTen: phieu.hoTen,
                soTien: tienPhat,
                lyDo: `Trễ ${soNgayTre} ngày`,
                ngayThu: ngayTraStr
            });
        }

        res.json({
            status: 'SUCCESS',
            message: tienPhat > 0 
                ? `Trả sách thành công! Cảnh báo quá hạn ${soNgayTre} ngày. Phí phạt: ${tienPhat.toLocaleString()} VNĐ` 
                : 'Trả sách đúng hạn thành công!',
            tienPhat
        });
    }
}

module.exports = new SystemController();