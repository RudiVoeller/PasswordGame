const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const app = express({strict: false});
const port = 3000;
const cors = require('cors');
const fs = require('fs');
const users = [];
const {createProxyMiddleware} = require('http-proxy-middleware'); //Just for development

const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}
app.use(bodyParser.json());
app.use(cors());

if (fs.existsSync('passwords.json')) {
    try {
        data = fs.readFileSync('passwords.json', 'utf8');
        console.log('Datei erfolgreich gelesen');
    } catch (err) {
        console.error('Fehler beim Lesen der Datei:', err);
    }
} else {
    console.error('Datei existiert nicht');
}
let passwords = JSON.parse(data);
let goodPasswords = passwords.goodPasswords;
let badPasswords = passwords.badPasswords;

// app.use('/', createProxyMiddleware({
//     target: 'http://localhost:63342', // Ziel-URL
//     changeOrigin: true,
//     onProxyRes: function (proxyRes, req, res) {
//         proxyRes.headers['Access-Control-Allow-Origin'] = '*';
//     }
// }));
// JWT Secret
const jwtSecret = 'your_jwt_secret_key';

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'your_email@gmail.com',
        pass: 'your_email_password'
    }
});

// User registration endpoint
app.post('/register', async (req, res) => {
    console.log("register")
    const {username, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({username, email, password: hashedPassword});
    res.status(201).send('User registered');
});

// User login endpoint
app.post('/login', async (req, res) => {
    console.log("login")
    const {email, password} = req.body;
    const user = users.find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({email: user.email}, jwtSecret, {expiresIn: '1h'});
        res.json({token});
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Password reset request endpoint
app.post('/forgot-password', (req, res) => {
    const {email} = req.body;
    const user = users.find(u => u.email === email);
    if (user) {
        const resetToken = jwt.sign({email: user.email}, jwtSecret, {expiresIn: '15m'});
        const resetLink = `http://localhost:${port}/reset-password?token=${resetToken}`;

        transporter.sendMail({
            to: user.email,
            subject: 'Password Reset',
            text: `Click here to reset your password: ${resetLink}`
        }, (error, info) => {
            if (error) {
                return res.status(500).send('Error sending email');
            }
            res.send('Password reset email sent');
        });
    } else {
        res.status(404).send('User not found');
    }
});

// Password reset endpoint
app.post('/reset-password', async (req, res) => {
    const {token, newPassword} = req.body;
    try {
        const decoded = jwt.verify(token, jwtSecret);
        const user = users.find(u => u.email === decoded.email);
        if (user) {
            user.password = await bcrypt.hash(newPassword, 10);
            res.send('Password reset successful');
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(400).send('Invalid or expired token');
    }
});


app.post('/passwords', (req, res) => {
    console.log("Generate Passwords")
    let usedPasswords = [];

    for (let i = 0; i < 10; i++) {
        var password = getRandomPassword(goodPasswords, badPasswords, usedPasswords);
        usedPasswords.push(password);
    }
    res.status(200).send(usedPasswords);


});

app.post('/solve', (req, res) => {
    console.log("Solve Passwords")
    var badPasswordsInput = req.body.passwordsBad;
    var goodPasswordsInput = req.body.passwordsGood;
    var points = 0;
    for (var i = 0; i < badPasswordsInput.length; i++) {
        if (badPasswords.includes(badPasswordsInput[i])) {
            points++;
        }
    }
    for (var i = 0; i < goodPasswordsInput.length; i++) {
        if (goodPasswords.includes(goodPasswordsInput[i])) {
            points++;
        }
    }
    res.status(200).send(points.toString());

});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

function getRandomItem(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

// Funktion, um ein zufälliges Passwort anzuzeigen
function getRandomPassword(goodPasswords, badPasswords, usedPasswords) {
    // 50% Chance, ein gutes oder schlechtes Passwort zu wählen
    const isGoodPassword = Math.random() < 0.5;
    const password = isGoodPassword ? getRandomItem(goodPasswords) : getRandomItem(badPasswords);
    if (password in usedPasswords) {
        return getRandomPassword(goodPasswords, badPasswords, usedPasswords);
    }
    return password
}

