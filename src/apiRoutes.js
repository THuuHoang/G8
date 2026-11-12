const express = require('express');
const router = express.Router();
const controller = require('./systemController');

router.post('/login', (req, res) => controller.login(req, res));
router.get('/system-summary', (req, res) => controller.getSummary(req, res));
router.post('/dau-sach', (req, res) => controller.addDauSach(req, res));
router.post('/nhap-kho', (req, res) => controller.nhapKhoBarcode(req, res));
router.post('/ban-doc', (req, res) => controller.createBanDoc(req, res));
router.post('/phieu-muon', (req, res) => controller.lapPhieuMuon(req, res));
router.post('/tra-sach', (req, res) => controller.traSach(req, res));

module.exports = router;