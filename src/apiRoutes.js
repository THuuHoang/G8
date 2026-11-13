const express = require('express');
const router = express.Router();
const controller = require('./systemController');

const handle = (fn) => (req, res) => {
    try {
        const data = fn(req, res);
        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

router.post('/auth/login', handle(req => controller.login((req.body || {}).username, (req.body || {}).password)));
router.post('/auth/change-password', handle(req => controller.changePassword((req.body || {}).username, (req.body || {}).oldPassword, (req.body || {}).newPassword)));

router.get('/users', handle(() => controller.getUsers()));
router.post('/users', handle(req => controller.createUser(req.body || {})));
router.put('/users/:id', handle(req => controller.updateUserPermission(req.params.id, req.body || {})));
router.post('/users/:id/reset-password', handle(req => controller.resetUserPassword(req.params.id, (req.body || {}).newPassword)));

router.get('/settings', handle(() => controller.getSettings()));
router.post('/settings', handle(req => controller.updateSettings(req.body || {})));

router.get('/books', handle(req => controller.getBooks(req.query.q || '', req.query.category || '')));
router.post('/categories', handle(req => controller.addCategory((req.body || {}).name)));
router.post('/books', handle(req => controller.addBook(req.body || {})));
router.put('/books/:isbn', handle(req => controller.updateBook(decodeURIComponent(req.params.isbn), req.body || {})));
router.delete('/books/:isbn', handle(req => controller.deleteBook(decodeURIComponent(req.params.isbn))));

router.get('/imports', handle(() => controller.getImportSlips()));
router.post('/imports', handle(req => controller.createImportSlip(req.body || {})));

router.get('/copies', handle(req => controller.getCopies(req.query.q || '')));
router.put('/copies/:barcode', handle(req => controller.updateCopy(req.params.barcode, req.body || {})));

router.get('/readers', handle(() => controller.getReaders()));
router.post('/readers', handle(req => controller.createReaderCard(req.body || {})));
router.put('/readers/:cardId', handle(req => controller.updateReaderCard(req.params.cardId, req.body || {})));

router.get('/loans', handle(() => controller.getLoans()));
router.post('/loans/borrow', handle(req => controller.borrowBook(req.body || {})));
router.post('/loans/return', handle(req => controller.returnBook(req.body || {})));

router.get('/renewals', handle(() => controller.getRenewalRequests()));
router.post('/renewals', handle(req => controller.submitRenewalRequest(req.body || {})));
router.post('/renewals/:requestId/process', handle(req => controller.processRenewalRequest(req.params.requestId, Boolean((req.body || {}).approved))));

router.get('/readers/:cardId/portal', handle(req => controller.getReaderPortal(req.params.cardId)));
router.get('/reports', handle(() => controller.getReports()));

module.exports = router;