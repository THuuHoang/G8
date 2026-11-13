const db = require('./systemModel');

class SystemController {
    login(username, password) {
        if (!username || !password) {
            throw new Error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
        }
        const user = db.users.find(u => u.username === username.trim() && u.password === password.trim());
        if (!user) {
            throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
        if (!user.active) {
            throw new Error('Tài khoản này đã bị Quản trị viên vô hiệu hóa.');
        }

        let readerCard = null;
        if (user.role === 'READER' && user.cardId) {
            readerCard = db.readers.find(r => r.cardId === user.cardId) || null;
            if (readerCard && readerCard.status !== 'HOAT_DONG') {
                throw new Error('Thẻ bạn đọc hiện đang bị khóa. Vui lòng liên hệ Thủ thư.');
            }
        }

        return {
            id: user.id,
            username: user.username,
            role: user.role,
            fullName: user.fullName,
            cardId: user.cardId,
            readerCard,
            settings: db.settings
        };
    }

    changePassword(username, oldPassword, newPassword) {
        if (!oldPassword || !newPassword || newPassword.trim().length < 3) {
            throw new Error('Mật khẩu mới phải có ít nhất 3 ký tự.');
        }
        const user = db.users.find(u => u.username === username);
        if (!user) {
            throw new Error('Không tìm thấy tài khoản.');
        }
        if (user.password !== oldPassword.trim()) {
            throw new Error('Mật khẩu hiện tại không đúng.');
        }
        user.password = newPassword.trim();
        return { message: 'Đổi mật khẩu thành công!' };
    }

    getUsers() {
        return db.users.map(u => ({
            id: u.id,
            username: u.username,
            role: u.role,
            fullName: u.fullName,
            cardId: u.cardId,
            active: u.active
        }));
    }

    createUser({ fullName, username, password, role }) {
        if (!fullName || !username || !password) {
            throw new Error('Vui lòng nhập đầy đủ Họ tên, Tên đăng nhập và Mật khẩu.');
        }
        const cleanUser = username.trim();
        if (db.users.some(u => u.username === cleanUser)) {
            throw new Error(`Tên đăng nhập "${cleanUser}" đã tồn tại.`);
        }
        const validRoles = ['ADMIN', 'LIBRARIAN'];
        const finalRole = validRoles.includes(role) ? role : 'LIBRARIAN';

        const newUser = {
            id: `U${String(db.userSeq++).padStart(2, '0')}`,
            username: cleanUser,
            password: password.trim(),
            role: finalRole,
            fullName: fullName.trim(),
            cardId: null,
            active: true
        };
        db.users.push(newUser);
        return newUser;
    }

    updateUserPermission(userId, { role, active }) {
        const user = db.users.find(u => u.id === userId);
        if (!user) {
            throw new Error('Không tìm thấy người dùng.');
        }
        if (user.username === 'admin' && active === false) {
            throw new Error('Không thể khóa tài khoản Quản trị viên gốc.');
        }
        if (role && ['ADMIN', 'LIBRARIAN', 'READER'].includes(role)) {
            user.role = role;
        }
        if (typeof active === 'boolean') {
            user.active = active;
        }
        return user;
    }

    resetUserPassword(userId, newPassword) {
        if (!newPassword || newPassword.trim().length < 3) {
            throw new Error('Mật khẩu mới phải có ít nhất 3 ký tự.');
        }
        const user = db.users.find(u => u.id === userId);
        if (!user) {
            throw new Error('Không tìm thấy tài khoản.');
        }
        user.password = newPassword.trim();
        return { username: user.username };
    }

    getSettings() {
        return db.settings;
    }

    updateSettings({ finePerDay, defaultLoanDays, maxBooksPerReader, renewDays, maxRenewals, cardValidMonths }) {
        const fine = Number(finePerDay);
        const loanDays = Number(defaultLoanDays);
        const maxBooks = Number(maxBooksPerReader);
        const rDays = Number(renewDays);
        const maxRen = Number(maxRenewals);
        const validMonths = Number(cardValidMonths);

        if (fine < 0 || loanDays < 1 || maxBooks < 1 || rDays < 1 || maxRen < 0 || validMonths < 1) {
            throw new Error('Các tham số quy định phải là số hợp lệ.');
        }

        db.settings = {
            finePerDay: fine,
            defaultLoanDays: loanDays,
            maxBooksPerReader: maxBooks,
            renewDays: rDays,
            maxRenewals: maxRen,
            cardValidMonths: validMonths
        };
        return db.settings;
    }

    getBooks(keyword = '', category = '') {
        const kw = String(keyword || '').trim().toLowerCase();
        const cat = String(category || '').trim();

        const filtered = db.books.filter(b => {
            const matchCat = !cat || b.category === cat;
            const matchKw = !kw ||
                b.title.toLowerCase().includes(kw) ||
                b.author.toLowerCase().includes(kw) ||
                b.isbn.toLowerCase().includes(kw) ||
                b.category.toLowerCase().includes(kw);
            return matchCat && matchKw;
        });

        return {
            categories: db.categories,
            items: filtered.map(book => {
                const bookCopies = db.copies.filter(c => c.isbn === book.isbn);
                return {
                    ...book,
                    totalCopies: bookCopies.length,
                    availableCopies: bookCopies.filter(c => c.status === 'SAN_SANG').length,
                    copies: bookCopies
                };
            })
        };
    }

    addCategory(name) {
        const clean = String(name || '').trim();
        if (!clean) throw new Error('Vui lòng nhập tên danh mục.');
        if (db.categories.includes(clean)) throw new Error('Danh mục này đã tồn tại.');
        db.categories.push(clean);
        return db.categories;
    }

    addBook({ isbn, title, author, category, publisher, publishYear }) {
        if (!isbn || !title || !author) {
            throw new Error('Vui lòng nhập đầy đủ Mã ISBN, Tên sách và Tác giả.');
        }
        if (db.books.some(b => b.isbn.toLowerCase() === isbn.trim().toLowerCase())) {
            throw new Error(`Mã ISBN "${isbn}" đã tồn tại.`);
        }
        const cat = (category || db.categories[0] || 'Tổng hợp').trim();
        if (!db.categories.includes(cat)) {
            db.categories.push(cat);
        }
        const newBook = {
            isbn: isbn.trim(),
            title: title.trim(),
            author: author.trim(),
            category: cat,
            publisher: (publisher || 'NXB Tổng hợp').trim(),
            publishYear: Number(publishYear) || new Date().getFullYear()
        };
        db.books.unshift(newBook);
        return newBook;
    }

    updateBook(isbn, { title, author, category, publisher, publishYear }) {
        const book = db.books.find(b => b.isbn === isbn);
        if (!book) throw new Error('Không tìm thấy đầu sách.');
        if (title) book.title = title.trim();
        if (author) book.author = author.trim();
        if (category) book.category = category.trim();
        if (publisher) book.publisher = publisher.trim();
        if (publishYear) book.publishYear = Number(publishYear);
        return book;
    }

    deleteBook(isbn) {
        const idx = db.books.findIndex(b => b.isbn === isbn);
        if (idx === -1) throw new Error('Không tìm thấy đầu sách.');
        if (db.copies.some(c => c.isbn === isbn && c.status === 'DANG_MUON')) {
            throw new Error('Không thể xóa đầu sách vì đang có bản sao được bạn đọc mượn.');
        }
        db.books.splice(idx, 1);
        db.copies = db.copies.filter(c => c.isbn !== isbn);
        return { deletedIsbn: isbn };
    }

    getImportSlips() {
        return db.importSlips;
    }

    createImportSlip({ isbn, quantity, unitPrice, supplier, location, librarian, note }) {
        const book = db.books.find(b => b.isbn === isbn);
        if (!book) throw new Error('Vui lòng chọn đầu sách hợp lệ.');
        const qty = Number(quantity);
        if (!qty || qty < 1 || qty > 100) {
            throw new Error('Số lượng sách nhập phải từ 1 đến 100 cuốn.');
        }
        const price = Math.max(0, Number(unitPrice) || 0);
        const shelf = (location || 'Kệ A1 - Tầng 1').trim();
        const importId = `PN-${String(db.importSeq++).padStart(3, '0')}`;

        const generatedBarcodes = [];
        for (let i = 0; i < qty; i++) {
            const barcode = `BC-${db.barcodeSeq++}`;
            db.copies.push({
                barcode,
                isbn: book.isbn,
                status: 'SAN_SANG',
                location: shelf,
                importId
            });
            generatedBarcodes.push(barcode);
        }

        const slip = {
            importId,
            importDate: db.getToday(),
            supplier: (supplier || 'Nhà cung cấp sách').trim(),
            librarian: librarian || 'Thủ thư',
            isbn: book.isbn,
            bookTitle: book.title,
            quantity: qty,
            unitPrice: price,
            totalCost: qty * price,
            barcodes: generatedBarcodes,
            note: (note || '').trim()
        };

        db.importSlips.unshift(slip);
        return slip;
    }

    getCopies(keyword = '') {
        const kw = String(keyword || '').trim().toLowerCase();
        return db.copies
            .map(c => {
                const book = db.books.find(b => b.isbn === c.isbn);
                return {
                    ...c,
                    bookTitle: book ? book.title : c.isbn,
                    author: book ? book.author : '',
                    category: book ? book.category : ''
                };
            })
            .filter(c => !kw ||
                c.barcode.toLowerCase().includes(kw) ||
                c.bookTitle.toLowerCase().includes(kw) ||
                c.isbn.toLowerCase().includes(kw)
            );
    }

    updateCopy(barcode, { location, status }) {
        const copy = db.copies.find(c => c.barcode === barcode);
        if (!copy) throw new Error('Không tìm thấy mã bản sách.');
        if (copy.status === 'DANG_MUON' && status && status !== 'DANG_MUON') {
            throw new Error('Bản sách đang được mượn, không thể đổi trạng thái thủ công.');
        }
        if (location) copy.location = location.trim();
        if (status && ['SAN_SANG', 'BAO_TRI'].includes(status)) {
            copy.status = status;
        }
        return copy;
    }

    getReaders() {
        return db.readers.map(r => {
            const activeCount = db.loans.filter(l => l.cardId === r.cardId && l.status === 'DANG_MUON').length;
            const totalFine = db.loans.filter(l => l.cardId === r.cardId).reduce((s, l) => s + (l.fineAmount || 0), 0);
            const account = db.users.find(u => u.cardId === r.cardId);
            return {
                ...r,
                username: account ? account.username : '',
                maxBooks: db.settings.maxBooksPerReader,
                activeBorrowedCount: activeCount,
                totalFine
            };
        });
    }

    createReaderCard({ fullName, studentCode, email, phone, username, password }) {
        if (!fullName || !username || !password) {
            throw new Error('Vui lòng nhập đầy đủ Họ tên, Tên đăng nhập và Mật khẩu.');
        }
        if (db.users.some(u => u.username === username.trim())) {
            throw new Error(`Tên đăng nhập "${username}" đã được sử dụng.`);
        }

        const today = db.getToday();
        const cardId = `DG${String(db.readerSeq++).padStart(3, '0')}`;
        const expiryDate = db.addDays(today, db.settings.cardValidMonths * 30);

        const newReader = {
            cardId,
            fullName: fullName.trim(),
            studentCode: (studentCode || '').trim(),
            email: (email || '').trim(),
            phone: (phone || '').trim(),
            issuedDate: today,
            expiryDate,
            status: 'HOAT_DONG'
        };

        const newUser = {
            id: `U${String(db.userSeq++).padStart(2, '0')}`,
            username: username.trim(),
            password: password.trim(),
            role: 'READER',
            fullName: fullName.trim(),
            cardId,
            active: true
        };

        db.readers.push(newReader);
        db.users.push(newUser);
        return { reader: newReader, username: newUser.username };
    }

    updateReaderCard(cardId, { action, phone, email }) {
        const reader = db.readers.find(r => r.cardId === cardId);
        if (!reader) throw new Error('Không tìm thấy thẻ bạn đọc.');

        if (action === 'RENEW_CARD') {
            const baseDate = reader.expiryDate > db.getToday() ? reader.expiryDate : db.getToday();
            reader.expiryDate = db.addDays(baseDate, db.settings.cardValidMonths * 30);
            reader.status = 'HOAT_DONG';
        } else if (action === 'TOGGLE_LOCK') {
            reader.status = reader.status === 'HOAT_DONG' ? 'BI_KHOA' : 'HOAT_DONG';
        }
        if (phone !== undefined) reader.phone = phone.trim();
        if (email !== undefined) reader.email = email.trim();
        return reader;
    }

    getLoans() {
        const today = db.getToday();
        return db.loans.map(l => {
            const reader = db.readers.find(r => r.cardId === l.cardId);
            const isOverdue = l.status === 'DANG_MUON' && today > l.dueDate;
            const overdueDays = isOverdue ? db.diffDays(today, l.dueDate) : 0;
            return {
                ...l,
                readerName: reader ? reader.fullName : l.cardId,
                isOverdue,
                overdueDays,
                estimatedFine: isOverdue ? overdueDays * db.settings.finePerDay : l.fineAmount
            };
        });
    }

    borrowBook({ cardId, barcode }) {
        if (!cardId || !barcode) {
            throw new Error('Vui lòng nhập Mã thẻ bạn đọc và Mã Barcode sách.');
        }
        const today = db.getToday();
        const reader = db.readers.find(r => r.cardId === cardId.trim().toUpperCase());
        if (!reader) throw new Error(`Không tìm thấy thẻ bạn đọc "${cardId}".`);
        if (reader.status !== 'HOAT_DONG') throw new Error('Thẻ bạn đọc đang bị khóa.');
        if (today > reader.expiryDate) throw new Error(`Thẻ bạn đọc đã hết hạn (${reader.expiryDate}).`);

        const activeCount = db.loans.filter(l => l.cardId === reader.cardId && l.status === 'DANG_MUON').length;
        if (activeCount >= db.settings.maxBooksPerReader) {
            throw new Error(`Bạn đọc đã mượn tối đa ${db.settings.maxBooksPerReader} cuốn theo quy định.`);
        }

        const copy = db.copies.find(c => c.barcode === barcode.trim().toUpperCase());
        if (!copy) throw new Error(`Không tìm thấy mã Barcode "${barcode}".`);
        if (copy.status !== 'SAN_SANG') {
            throw new Error(`Bản sách "${copy.barcode}" hiện không sẵn sàng (${copy.status}).`);
        }

        const book = db.books.find(b => b.isbn === copy.isbn);
        copy.status = 'DANG_MUON';

        const newLoan = {
            loanId: `PM-${String(db.loanSeq++).padStart(3, '0')}`,
            cardId: reader.cardId,
            barcode: copy.barcode,
            isbn: copy.isbn,
            bookTitle: book ? book.title : copy.isbn,
            borrowDate: today,
            dueDate: db.addDays(today, db.settings.defaultLoanDays),
            returnDate: null,
            status: 'DANG_MUON',
            renewCount: 0,
            fineAmount: 0,
            fineCollected: false
        };
        db.loans.unshift(newLoan);
        return newLoan;
    }

    returnBook({ barcode, customReturnDate, collectFine = true }) {
        if (!barcode) throw new Error('Vui lòng nhập mã Barcode sách cần trả.');
        const cleanBarcode = barcode.trim().toUpperCase();
        const loan = db.loans.find(l => l.barcode === cleanBarcode && l.status === 'DANG_MUON');
        if (!loan) {
            throw new Error(`Không tìm thấy phiếu đang mượn cho mã "${barcode}".`);
        }

        const actualReturnDate = (customReturnDate && customReturnDate.trim()) ? customReturnDate.trim() : db.getToday();
        let overdueDays = 0;
        let fine = 0;

        if (actualReturnDate > loan.dueDate) {
            overdueDays = db.diffDays(actualReturnDate, loan.dueDate);
            fine = overdueDays * db.settings.finePerDay;
        }

        loan.returnDate = actualReturnDate;
        loan.status = 'DA_TRA';
        loan.fineAmount = fine;
        loan.fineCollected = fine > 0 ? Boolean(collectFine) : true;

        db.renewalRequests.forEach(r => {
            if (r.loanId === loan.loanId && r.status === 'CHO_DUYET') {
                r.status = 'TU_CHOI';
                r.note = 'Sách đã được hoàn trả';
            }
        });

        const copy = db.copies.find(c => c.barcode === cleanBarcode);
        if (copy) copy.status = 'SAN_SANG';

        return { loan, overdueDays, fineAmount: fine };
    }

    getRenewalRequests() {
        return db.renewalRequests;
    }

    submitRenewalRequest({ cardId, loanId, reason }) {
        const loan = db.loans.find(l => l.loanId === loanId && l.cardId === cardId);
        if (!loan) throw new Error('Không tìm thấy phiếu mượn hợp lệ.');
        if (loan.status !== 'DANG_MUON') throw new Error('Chỉ có thể gia hạn sách đang mượn.');
        if (loan.renewCount >= db.settings.maxRenewals) {
            throw new Error(`Phiếu mượn đã đạt giới hạn tối đa ${db.settings.maxRenewals} lần gia hạn.`);
        }
        if (db.getToday() > loan.dueDate) {
            throw new Error('Sách đã quá hạn trả, không thể yêu cầu gia hạn trực tuyến.');
        }
        if (db.renewalRequests.some(r => r.loanId === loanId && r.status === 'CHO_DUYET')) {
            throw new Error('Bạn đã gửi yêu cầu gia hạn cho cuốn sách này và đang chờ Thủ thư duyệt.');
        }

        const reader = db.readers.find(r => r.cardId === cardId);
        const req = {
            requestId: `GH-${String(db.renewSeq++).padStart(3, '0')}`,
            loanId: loan.loanId,
            cardId,
            readerName: reader ? reader.fullName : cardId,
            barcode: loan.barcode,
            bookTitle: loan.bookTitle,
            currentDueDate: loan.dueDate,
            proposedDueDate: db.addDays(loan.dueDate, db.settings.renewDays),
            reason: (reason || 'Cần thêm thời gian nghiên cứu tài liệu').trim(),
            createdAt: db.getToday(),
            status: 'CHO_DUYET'
        };
        db.renewalRequests.unshift(req);
        return req;
    }

    processRenewalRequest(requestId, approved) {
        const req = db.renewalRequests.find(r => r.requestId === requestId);
        if (!req) throw new Error('Không tìm thấy yêu cầu gia hạn.');
        if (req.status !== 'CHO_DUYET') throw new Error('Yêu cầu này đã được xử lý.');

        if (approved) {
            const loan = db.loans.find(l => l.loanId === req.loanId && l.status === 'DANG_MUON');
            if (!loan) throw new Error('Phiếu mượn không còn hiệu lực.');
            loan.dueDate = req.proposedDueDate;
            loan.renewCount += 1;
            req.status = 'DA_DUYET';
        } else {
            req.status = 'TU_CHOI';
        }
        return req;
    }

    getReaderPortal(cardId) {
        const reader = db.readers.find(r => r.cardId === cardId);
        if (!reader) throw new Error('Không tìm thấy thẻ bạn đọc.');

        const today = db.getToday();
        const myLoans = db.loans
            .filter(l => l.cardId === cardId)
            .map(l => {
                const isOverdue = l.status === 'DANG_MUON' && today > l.dueDate;
                const overdueDays = isOverdue ? db.diffDays(today, l.dueDate) : 0;
                const pendingReq = db.renewalRequests.find(r => r.loanId === l.loanId && r.status === 'CHO_DUYET');
                return {
                    ...l,
                    isOverdue,
                    overdueDays,
                    estimatedFine: isOverdue ? overdueDays * db.settings.finePerDay : l.fineAmount,
                    hasPendingRenewal: Boolean(pendingReq),
                    canRequestRenew: l.status === 'DANG_MUON' && !isOverdue && l.renewCount < db.settings.maxRenewals && !pendingReq
                };
            });

        const myRenewals = db.renewalRequests.filter(r => r.cardId === cardId);

        return {
            reader,
            settings: db.settings,
            activeLoans: myLoans.filter(l => l.status === 'DANG_MUON'),
            historyLoans: myLoans.filter(l => l.status === 'DA_TRA'),
            renewalRequests: myRenewals,
            totalFine: myLoans.reduce((s, l) => s + l.estimatedFine, 0)
        };
    }

    getReports() {
        const today = db.getToday();
        const totalBooks = db.books.length;
        const totalCopies = db.copies.length;
        const availableCopies = db.copies.filter(c => c.status === 'SAN_SANG').length;
        const borrowedCopies = db.copies.filter(c => c.status === 'DANG_MUON').length;
        const maintenanceCopies = db.copies.filter(c => c.status === 'BAO_TRI').length;

        const activeReaders = db.readers.filter(r => r.status === 'HOAT_DONG').length;
        const activeLoans = db.loans.filter(l => l.status === 'DANG_MUON');
        const overdueLoans = activeLoans.filter(l => today > l.dueDate);
        const totalFinesCollected = db.loans.reduce((s, l) => s + (l.fineAmount || 0), 0);
        const totalImportCost = db.importSlips.reduce((s, p) => s + (p.totalCost || 0), 0);

        const byCategory = db.categories.map(cat => {
            const catBooks = db.books.filter(b => b.category === cat);
            const isbns = new Set(catBooks.map(b => b.isbn));
            const catCopies = db.copies.filter(c => isbns.has(c.isbn));
            return {
                category: cat,
                bookCount: catBooks.length,
                copyCount: catCopies.length,
                availableCount: catCopies.filter(c => c.status === 'SAN_SANG').length
            };
        });

        return {
            summary: {
                totalBooks,
                totalCopies,
                availableCopies,
                borrowedCopies,
                maintenanceCopies,
                totalReaders: db.readers.length,
                activeReaders,
                activeLoansCount: activeLoans.length,
                overdueLoansCount: overdueLoans.length,
                totalFinesCollected,
                totalImportSlips: db.importSlips.length,
                totalImportCost
            },
            byCategory,
            recentLoans: this.getLoans()
        };
    }
}

module.exports = new SystemController();