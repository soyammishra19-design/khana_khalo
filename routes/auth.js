const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseFetch } = require('../supabase');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let users = await supabaseFetch(`users?email=eq.${encodeURIComponent(email)}&select=*`);
        if (users && users.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserReq = await supabaseFetch('users', {
            method: 'POST',
            body: JSON.stringify({ name, email, password: hashedPassword })
        });
        const user = newUserReq[0];

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { name: user.name, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let users = await supabaseFetch(`users?email=eq.${encodeURIComponent(email)}&select=*`);
        if (!users || users.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        let user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { name: user.name, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
