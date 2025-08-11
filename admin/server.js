const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// ---------- CONFIGURE LOGIN CREDENTIALS ----------
const USER = 'admin';
const PASS = 'agri123'; // Change before deployment
const ALERT_EMAIL = 'navyasrimarepally74@gmail.com'; // Email to get alerts

// ---------- CONFIGURE EMAIL TRANSPORT ----------
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'navyasrimarepally4@gmail.com',        // Your Gmail
        pass: 'xuvspsrrbkuxmvzf'           // App password (not normal Gmail password)
    }
});

// ---------- SITE DIRECTORY ----------
const SITE_DIR = path.resolve('D:/landscape_site/site');

// ---------- MIDDLEWARE ----------
app.use(bodyParser.json());
app.use(session({
    secret: 'change_this_secret',
    resave: false,
    saveUninitialized: false
}));

// Prevent caching for protected pages
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// ---------- LOGIN PAGE ----------
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// ---------- LOGIN API ----------
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === USER && password === PASS) {
        req.session.loggedIn = true;

        // Send login alert
        transporter.sendMail({
            from: 'navyasrimarepally74@gmail.com',
            to: ALERT_EMAIL,
            subject: 'Admin Panel Login Alert',
            text: `Admin account logged in at ${new Date().toLocaleString()}`
        }, (err, info) => {
            if (err) {
                console.error('Error sending login alert:', err);
            } else {
                console.log('Login alert sent:', info.response);
            }
        });

        return res.json({ success: true });
    }

    res.json({ success: false, message: 'Invalid credentials' });
});


// ---------- AUTH MIDDLEWARE ----------
function requireLogin(req, res, next) {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    next();
}

// ---------- FILE FUNCTIONS ----------
function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getFiles(filePath, fileList);
        } else if (/\.(html|css|js)$/i.test(file)) {
            fileList.push(path.relative(SITE_DIR, filePath));
        }
    });
    return fileList;
}

// ---------- LIST FILES ----------
app.get('/files', requireLogin, (req, res) => {
    try {
        res.json(getFiles(SITE_DIR));
    } catch (err) {
        res.status(500).send('Error reading files');
    }
});

// ---------- GET FILE CONTENT ----------
app.get('/file/:name', requireLogin, (req, res) => {
    const filePath = path.resolve(SITE_DIR, req.params.name);
    if (!filePath.startsWith(SITE_DIR)) return res.status(403).send("Forbidden");

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading file');
        res.send(data);
    });
});

// ---------- SAVE FILE ----------
app.post('/file/:name', requireLogin, (req, res) => {
    const filePath = path.resolve(SITE_DIR, req.params.name);
    if (!filePath.startsWith(SITE_DIR)) return res.status(403).send("Forbidden");

    fs.writeFile(filePath, req.body.content, 'utf8', (err) => {
        if (err) return res.status(500).send('Error saving file');
        res.json({ success: true });
    });
});

// ---------- EDITOR PAGE ----------
app.get('/', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'editor.html'));
});

// ---------- LOGOUT ----------
app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Logout failed' });
            }
            res.json({ success: true, redirect: '/login' });
        });
    } else {
        res.json({ success: true, redirect: '/login' });
    }
});

// ---------- SERVER START ----------
app.listen(PORT, () => console.log(`Admin panel running on http://localhost:${PORT}`));
