const express = require('express');
const bodyParser = require('body-parser');
const app = express({strict: false});
const port = 3000;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const {createProxyMiddleware} = require('http-proxy-middleware'); //Just for development
const mysql = require('mysql2');

const users = require('./user');

const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());

// Sitzungseinrichtung
app.use(session({
    secret: 'geheimeSitzungsSchluessel', // ändere dies in einen geheimen Schlüssel
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false } // auf true setzen, wenn https verwendet wird
}));

// MySQL Verbindungsdetails
// -> Vorher muss MySQL auf dem Server installiert werden und die Datenbank sowie die Tabellen mittels Skript hinzugefügt werden
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'passwordgame'
};

// MySQL Verbindung erstellen
const connection = mysql.createConnection(dbConfig);

// Verbindung herstellen
connection.connect(err => {
    if (err) {
        console.error('Fehler bei der Verbindung zur SQL-Datenbank:', err);
        return;
    }
    console.log('Verbindung zur Datenbank erfolgreich');
});

// Statische Dateien aus dem 'public'-Verzeichnis bereitstellen
app.use(express.static(path.join(__dirname, '..', 'public')));

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

// Middleware zur Überprüfung der Session für geschützte Routen
// Verhindert das Seiten angesteuert werden könne wenn der Benutzer nicht angemeldet ist.
function requireLogin(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        //console.log('weiterleitung abgebrochen, nutzer ist nicht angemeldet.')
        res.redirect('/'); // Zur Login-Seite umleiten, wenn nicht angemeldet
        //next();
    }
}
const jwtSecret = 'your_jwt_secret_key';

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'your_email@gmail.com',
        pass: 'your_email_password'
    }
});

// Umleitung auf Startseite bei Aufruf von 'localhost:3000/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'register.html'));
});

// Geschützte Route -> Zugriff nur wenn Benutzer angemeldet, ansonsten umleitung auf ../login
app.get('/good_bad_password', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'good_bad_password.html'));
});
app.get('/password_strength_sim', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'password_strength_sim.html'));
});

// Rückgabe der Stylesheets
app.get('/login.css', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.css'));
  })
app.get('/password_strength_sim.css', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'password_strength_sim.css'));
  })
  app.get('/good_bad_password.css', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'good_bad_password.css'));
  })

 // Rückgabe der client-js Dateien
app.get('/register-login.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'register-login.js'));
  })
app.get('/password_strength_sim.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'password_strength_sim.js'));
  })
app.get('/good_bad_password.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'good_bad_password.js'));
  }) 

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
    console.log('login');
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    
    connection.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Fehler beim Abrufen der Benutzerdaten:', err);
            res.status(500).send('Fehler beim Abrufen der Benutzerdaten');
            return;
        }

        if (results.length > 0) {
            // Benutzer gefunden
            // Benutzerdaten in session speichern
            req.session.user = results[0]
            req.session.loggedIn = true;
            // Weiterleitung zum ersten Spiel
            res.redirect('/good_bad_password')
            console.log(`Erfolgreich angemeldet als ${email}`)
        } else {
            // Benutzer nicht gefunden
            console.log('Ungültige Anmeldeinformationen')
            res.status(401).send('Ungültige Anmeldeinformationen');
        }
    });
});

app.post('/logout', (req, res) => {
    console.log("Logout")
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Abmeldefehler');
        }
        res.redirect('/');
    });
});

// Gibt Benutzerdaten (Name aktuellen Punktestand und Rekord an Client zurück)
app.get('/userdata', (req, res) => {
    console.log('get userdata')
    if (req.session.loggedIn) {
        res.json({username: req.session.user.username, points: req.session.user.points,  record: req.session.user.record});
    } else {
        res.status(401).json({ message: 'Nicht angemeldet' });
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

// Passwort Sortierer
app.post('/passwords', (req, res) => {
    console.log("Generate Passwords")
    let usedPasswords = [];

    for (let i = 0; i < 10; i++) {
        var password = getRandomPassword(goodPasswords, badPasswords, usedPasswords);
        usedPasswords.push(password);
    }
    // Punkte zurücksetzen
    req.session.user.points = 0;
    res.status(200).send(usedPasswords);
});

// Passwort Sortierer Punkte berechnen
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
    // Punkte in aktueller Session speichern und an Client senden
    req.session.user.points = points;
    res.json({points: points});
});

// Punkte an Client zurückgeben
app.post('/getScore', (req, res) => {
    console.log('get Score')
    if (req.session.loggedIn){
        res.json({points: req.session.user.points});
    } else {
        res.json({points: 0});
    }
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

