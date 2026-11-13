const express = require('express');
const path = require('path');
const apiRoutes = require('./src/apiRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1', apiRoutes);

app.use('/api/v1', (req, res) => {
    res.status(404).json({ success: false, message: `Không tìm thấy API: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
    res.status(400).json({ success: false, message: err.message || 'Dữ liệu gửi lên không hợp lệ.' });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`LOI: Cong ${PORT} dang bi chiem. Hay chay lenh: taskkill /F /IM node.exe`);
    } else {
        console.error('LOI KHOI DONG SERVER:', err.message);
    }
});