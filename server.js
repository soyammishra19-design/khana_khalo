const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(process.cwd())); // Use current working directory for static files

// Root & Health Check Routing
app.get('/alive', (req, res) => res.send('Backend is alive!'));

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html'), (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(404).send('Index file not found or other error.');
        }
    });
});

// Routes
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/auth', require('./routes/auth'));

const os = require('os');
app.get('/api/device-ip', (req, res) => {
    const ifaces = os.networkInterfaces();
    let possibleIps = [];
    for (const name of Object.keys(ifaces)) {
        for (const iface of ifaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                possibleIps.push({ name, ip: iface.address });
            }
        }
    }
    // 1. Try to find a Wi-Fi adapter specifically
    let bestIp = possibleIps.find(i => i.name.toLowerCase().includes('wi-fi') || i.name.toLowerCase().includes('wireless'))?.ip;
    // 2. Fallback to standard 192.168.* home network space
    if (!bestIp) {
        bestIp = possibleIps.find(i => i.ip.startsWith('192.168.'))?.ip;
    }
    // 3. Fallback to any interface that isn't a WSL/Hyper-V virtual switch
    if (!bestIp && possibleIps.length > 0) {
        const filtered = possibleIps.filter(i => !i.name.toLowerCase().includes('vethernet') && !i.name.toLowerCase().includes('wsl'));
        bestIp = filtered.length > 0 ? filtered[0].ip : possibleIps[0].ip;
    }
    res.json({ ip: bestIp || 'localhost' });
});

const fs = require('fs');
app.get('/api/debug-files', (req, res) => {
    res.json({
        dirname: __dirname,
        cwd: process.cwd(),
        files: fs.readdirSync(__dirname)
    });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
}
module.exports = app;
