const express = require('express');
const bodyParser = require('body-parser');
const app = express({strict: false});
const port = 3000;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql = require('mysql2');

const users = require('./user');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());

// Sitzungseinrichtung
app.use(session({
    secret: 'geheimeSitzungsSchluessel', // ändere dies in einen geheimen Schlüssel
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 30 * 60 * 1000 // 1 Minute
    } // auf true setzen, wenn https verwendet wird
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
    }
    else
    {
        //console.log('weiterleitung abgebrochen, nutzer ist nicht angemeldet.')
        res.redirect('/login'); // Zur Login-Seite umleiten, wenn nicht angemeldet
        //next();
    }
}

// Umleitung auf Startseite bei Aufruf von 'localhost:3000/'
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'register.html'));
});

// Geschützte Route -> Zugriff nur wenn Benutzer angemeldet, ansonsten umleitung auf ../login
app.get('/good_bad_password', requireLogin, (req, res) => {
    console.log('load game good_bad_password')
    res.sendFile(path.join(__dirname, '..', 'frontend', 'good_bad_password.html'));
});
app.get('/password_strength_sim', requireLogin, (req, res) => {
    console.log('load game password_strength_sim')
    res.sendFile(path.join(__dirname, '..', 'frontend', 'password_strength_sim.html'));
});
app.get('/guess_the_password', requireLogin, (req, res) => {
    console.log('load game guess_the_password')
    res.sendFile(path.join(__dirname, '..', 'frontend', 'guess_the_password.html'));
});

// Rückgabe der Stylesheets
app.get('/register-login.css', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'register-login.css'));
  })
app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'style.css'));
  })

 // Rückgabe der client-js Dateien
 app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'script.js'));
})
app.get('/register-login.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'register-login.js'));
})
app.get('/password_strength_sim.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'password_strength_sim.js'));
})
app.get('/good_bad_password.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'good_bad_password.js'));
}) 
app.get('/guess_the_password.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'guess_the_password.js'));
})

app.get('/pw_game_2.jpeg', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'pw_game_2.jpeg'));
}) 

// User registration endpoint
app.post('/register', async (req, res) => {
    console.log("register")
    const {username, password} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Erstellen eines neuen Benutzerobjekts mit dem gehashten Passwort
        const newUser = {
            username: username,
            password: hashedPassword, // Verwenden des gehashten Passworts
            high_score_one: 0,
            high_score_two: 0
        };
        // Aufrufen der createUser Funktion aus user.js
        users.createUser(newUser)
            .then(userId => {
                res.status(201).json({ message: 'Benutzer erfolgreich erstellt', userId: userId });
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ message: 'Fehler beim Erstellen des Benutzers' });
            });
    } catch (err) {
        console.error('Fehler beim Hashen des Passworts:', err);
        res.status(500).send('Fehler beim Registrieren des Benutzers');
    }
});

// User login endpoint
app.post('/login', async (req, res) => {
    console.log('login');
    const { user: user, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    
    connection.query(query, [user, password], (err, results) => {
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
            console.log(`Erfolgreich angemeldet als ${user}`)
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
        res.redirect('/login');
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

// Passwort Sortierer
app.post('/passwords', (req, res) => {
    let usedPasswords = [];

        var password = getRandomPassword(goodPasswords, badPasswords, usedPasswords);

    // Punkte zurücksetzen
    if (req.session.user !== undefined){
        req.session.user.points = 0;
        console.log("Points: " + req.session.user.points)
    }
    res.status(200).send(password);
});

// Passwort Sortierer Punkte berechnen
app.post('/solve', (req, res) => {
    console.log("Solve Passwords")
    var password = req.body.password;
    var isGood = req.body.isGood;
    var isCorrect = false;

    if (isGood) {
        if (goodPasswords.includes(password)) {
            isCorrect=true;
        }
    }
    else
    {
        if (badPasswords.includes(password)) {
            isCorrect=true;
        }
    }
    console.log(isCorrect)
    // Punkte in aktueller Session speichern und an Client senden
   // if (isCorrect) {
    //    req.session.user.points += 1;
   // }
    //req.session.user.points = points;
    res.json({correct: isCorrect});
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

app.listen(port, '0.0.0.0',() => {
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

// Passwörter an Client zurückgeben
app.post('/getPSSPasswords', (req, res) => {
    console.log('get PSSPasswords')
    if (req.session.loggedIn){
        const passwords = generateStrengthPasswords(1);
        res.send(passwords);
    } else {
        res.end;
    }
});

// Funktion zum erstellen der Passwörter für den PSS
function generateStrengthPasswords(level){
    const passwords = [];
    let digits = "0123456789";
    let lower = "abcdefghijklmnopqrstuvwxyz";
    let upper = lower.toUpperCase();
    let symbol = "%+-/!,$_";
    let currentCharset = "";

    // Erstellt unterschiedliche passwörter aufgrund des aktuellen levels
    if (level == 1) {
        currentCharset = "";
        currentCharset += digits;
        passwords.push(generateGenericPassword(currentCharset, 6));
        currentCharset += lower;
        passwords.push(generateGenericPassword(currentCharset, 6));
        passwords.push(generateGenericPassword(currentCharset, 8));
        currentCharset += upper;
        passwords.push(generateGenericPassword(currentCharset, 8));
        passwords.push(generateGenericPassword(currentCharset, 10));
    }
    return passwords;
}
function generateGenericPassword(charset, length){
    let password = ''
    for (let i = 0; i < length; i++){
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}
// Ermittelt die Zeit in Sekunden die erforderlich ist um ein Passwort mittels Brute-Force zu knacken
function getPasswordCrackTime (password) {
    let digits = "0123456789";
    let lower = "abcdefghijklmnopqrstuvwxyz";
    let upper = lower.toUpperCase();
    let symbol = "%+-/!,$_";
    let currentCharset = "";
    // charset des passworts ermitteln
    for (let i = 0; i < password.length; i++){
        if (digits.includes(password[i])) {
            currentCharset += digits;
            digits = "";
        } else if (lower.includes(password[i])) {
            currentCharset += lower;
            lower = "";
        } else if (upper.includes(password[i])) {
            currentCharset += upper;
            upper = "";
        } else if (upper.includes(password[i])) {
            currentCharset += upper;
            upper = "";
        } else if (symbol.includes(password[i])) {
            currentCharset += symbol;
            symbol = "";
        }
    }
    const charSetSize = new Set(currentCharset).size;
    const attemptsPerSecond = 1e9; // 1 Milliarde Versuche pro Sekunde
    const combinations = Math.pow(charSetSize, password.length);
    const seconds = combinations / attemptsPerSecond;
    return Math.floor(seconds);
}

// Passwort-Stärke-Simulator Punkte berechnen
app.post('/solvePSS', (req, res) => {
    console.log("Solve PSS")
    let passwords = req.body.passwords;
    let solveTime = req.body.solvetime;
    let points = 0;

    for (let i = 0; i < passwords.length; i++) {
        // prüft ob die Zei +- 10% genau berechnet wurde
        if (getPasswordCrackTime(passwords[i]) >=  (solveTime[i]*0.9) && getPasswordCrackTime(passwords[i]) <=  (solveTime[i]*1.1)) {
            points += 2;
        }
    }

    // Punkte in aktueller Session speichern und an Client senden
    req.session.user.points += points;
    res.json({points: points});
});

