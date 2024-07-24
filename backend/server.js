const express = require('express');
const bodyParser = require('body-parser');
const app = express({strict: false});
const port = 3000;
const bcrypt = require('bcryptjs');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const users = require('./user');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());

// Sitzungseinrichtung
app.use(session({
    secret: '3526cf47c19e869fb63bad0d75b150afe3201bdb0c717822dcc53e1cbcb148e9a7181b28586310806a6805a9cc18f364',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 30 * 60 * 1000 // 30 Minuten
    } // auf true setzen, wenn https verwendet wird
}));

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
        res.redirect('/login'); // Zur Login-Seite umleiten, wenn nicht angemeldet
        //next();
    }
}

// Umleitung auf Startseite bei Aufruf von 'localhost:3000/'

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

app.get('/', requireLogin, (req, res) => {
    console.log('load game good_bad_password')
    res.sendFile(path.join(__dirname, '..', 'frontend', 'good_bad_password.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'register.html'));
});

// Geschützte Route -> Zugriff nur wenn Benutzer angemeldet, ansonsten umleitung auf ../login
app.get('/good_bad_password', requireLogin, (req, res) => {
    console.log('load game good_bad_password')
    req.session.user.points = 0;
    res.sendFile(path.join(__dirname, '..', 'frontend', 'good_bad_password.html'));
});
app.get('/password_strength_sim', requireLogin, (req, res) => {
    console.log('load game password_strength_sim');
    req.session.user.points2 = 0;
    res.sendFile(path.join(__dirname, '..', 'frontend', 'password_strength_sim.html'));
});
app.get('/guess_the_password', requireLogin, (req, res) => {
    console.log('load game guess_the_password')
    res.sendFile(path.join(__dirname, '..', 'frontend', 'guess_the_password.html'));
});

app.get('/highscore-page', requireLogin, (req, res) => {
    console.log('load game guess_the_password')
    res.sendFile(path.join(__dirname, '..', 'frontend', 'highscores.html'));
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
app.get('/highscores.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'good_bad_password.js'));
})

app.get('/guess_the_password.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'guess_the_password.js'));
})

app.get('/pw_game_2.jpeg', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'pw_game_2.jpeg'));
})
app.get('/Bild_1.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'Bild_1.jpg'));
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
                res.status(201).send({message: 'Benutzer erfolgreich erstellt', userId: userId});
            })
            .catch(err => {
                console.error(err);
                res.status(401).send({message: 'Fehler beim Erstellen des Benutzers'});
            });
    } catch (err) {
        console.error('Fehler beim Hashen des Passworts:', err);
        res.status(401).send('Fehler beim Registrieren des Benutzers');
    }
});

// User login endpoint
app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    try {
        const dbPassword = await users.getPasswordByUser(username);
        const match = await bcrypt.compare(password, dbPassword);
        if (match) {
            // Passwörter stimmen überein
            req.session.user = {username: username};
            req.session.loggedIn = true;
            res.redirect('/good_bad_password'); // Oder eine andere Seite, auf die der Benutzer nach dem Login weitergeleitet werden soll
            res.status(202).send('Erfolgreich angemeldet');
            console.log(`Erfolgreich angemeldet als ${username}`);
        } else {
            // Passwörter stimmen nicht überein
            console.log('Ungültige Anmeldeinformationen');
            res.status(401).send('Ungültige Anmeldeinformationen');
        }
    } catch (err) {
        console.error('Login-Fehler:', err);
        res.status(500).send('Fehler beim Anmelden des Benutzers');
    }
});

app.get('/highscores', async (req, res) => {
    try {
        const highScores = await getHighScores(); // Diese Funktion muss in user.js implementiert werden
        res.json(highScores);
    } catch (err) {
        console.error('Fehler beim Abrufen der Highscores:', err);
        res.status(500).send('Serverfehler beim Abrufen der Highscores');
    }
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
app.get('/userdata', async (req, res) => {
    if (req.session.loggedIn) {
        res.json({
            username: req.session.user.username,
            points: req.session.user.points,
            points2: req.session.user.points2,
            record_one: await users.getHighScoreOneByUsername(req.session.user.username),
            record_two: await users.getHighScoreTwoByUsername(req.session.user.username)
        });
    } else {
        res.status(401).json({message: 'Nicht angemeldet'});
    }
});

// Passwort Sortierer
app.post('/passwords', (req, res) => {
    let usedPasswords = [];

    var password = getRandomPassword(goodPasswords, badPasswords, usedPasswords);

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
            isCorrect = true;
            req.session.user.points += 1;
        }
    } else {
        if (badPasswords.includes(password)) {
            isCorrect = true;
            req.session.user.points += 1;
        }
    }

    // Rekord in Datenbank speichern    
   if (isCorrect) {
        users.getHSOneByUsername(req.session.user.username)
        .then(highscore => {
            if (highscore !== null) {
                console.log('Der aktuelle Highscore ist:', highscore);
                if (highscore < req.session.user.points) {
                    users.setHighScoreOne(req.session.user.username, req.session.user.points);
                }
            } else {
                console.log('Kein highscore gefunden.');
            }
            res.json({correct: isCorrect});
        })
   } else {
    users.getHSOneByUsername(req.session.user.username)
    .then(highscore => {
        if (highscore !== null) {
            console.log('Der aktuelle highscore ist:', highscore);
            if (highscore < req.session.user.points) {
                users.setHighScoreOne(req.session.user.username, req.session.user.points);
            }
            req.session.user.points = 0;
        } else {
            console.log('kein highscore gefunden.');
        }
        res.json({correct: isCorrect});
    })
   }
});

// Punkte an Client zurückgeben
app.post('/getScore', (req, res) => {
    console.log('get Score')
    if (req.session.loggedIn) {
        res.json({points: req.session.user.points, points2: req.session.user.points2});
    } else {
        res.json({points: 0, points2: 0});
    }
});

app.listen(port, '0.0.0.0', () => {
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
    var level = req.body.level;
    console.log('get PSSPasswords')
    if (req.session.loggedIn) {
        const passwords = generateStrengthPasswords(level);
        res.send(passwords);
    } else {
        res.end;
    }
});

// Funktion zum erstellen der Passwörter für den PSS
function generateStrengthPasswords(level) {
    const passwords = [];
    let digits = "0123456789";
    let lower = "abcdefghijklmnopqrstuvwxyz";
    let upper = lower.toUpperCase();
    let symbol = "%+-/!,$_";
    let currentCharset = "";

    // Erstellt unterschiedliche passwörter aufgrund des aktuellen levels
    if (level === 1) {
        currentCharset = "";
        currentCharset += digits;
        passwords.push(generateGenericPassword(currentCharset, 6));
    } else if (level === 2) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        passwords.push(generateGenericPassword(currentCharset, 6));
    } else if (level === 3) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        passwords.push(generateGenericPassword(currentCharset, 8));
    } else if (level === 4) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        passwords.push(generateGenericPassword(currentCharset, 8));
    } else if (level === 5) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        passwords.push(generateGenericPassword(currentCharset, 9));
    } else if (level === 6) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        passwords.push(generateGenericPassword(currentCharset, 10));
    } else if (level === 7) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        currentCharset += symbol;
        passwords.push(generateGenericPassword(currentCharset, 6));
    } else if (level === 8) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        currentCharset += symbol;
        passwords.push(generateGenericPassword(currentCharset, 8));
    } else if (level === 9) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        currentCharset += symbol;
        passwords.push(generateGenericPassword(currentCharset, 10));
    } else if (level === 10) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        currentCharset += symbol;
        passwords.push(generateGenericPassword(currentCharset, 12));
    }
    return passwords;
}

function generateGenericPassword(charset, length) {
    let password = ''
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

// Ermittelt die Zeit in Sekunden die erforderlich ist um ein Passwort mittels Brute-Force zu knacken
function getPasswordCrackTime(password) {
    let digits = "0123456789";
    let lower = "abcdefghijklmnopqrstuvwxyz";
    let upper = lower.toUpperCase();
    let symbol = "%+-/!,$_";
    let currentCharset = "";
    // charset des passworts ermitteln
    for (let i = 0; i < password.length; i++) {
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
    let korrekt = false;

    for (let i = 0; i < passwords.length; i++) {
        // prüft ob die Zei +- 10% genau berechnet wurde
        if (getPasswordCrackTime(passwords[i]) >= (solveTime[i] * 0.9) && getPasswordCrackTime(passwords[i]) <= (solveTime[i] * 1.1)) {
            korrekt = true
            req.session.user.points2 += 1;
            // Rekord in Datenbank speichern
            users.getHSTwoByUsername(req.session.user.username)
            .then(highscore => {
                if (highscore !== null) {
                    console.log('Der aktuelle highscore ist:', highscore);
                    if (highscore < req.session.user.points2) {
                        users.setHighScoreTwo(req.session.user.username, req.session.user.points2);
                    }
                } else {
                    console.log('kein highscore gefunden.');
                }
                res.json({points: req.session.user.points2, korrekt: korrekt});
            })
        } else {
            // Rekord in Datenbank speichern    
            users.getHSTwoByUsername(req.session.user.username)
                .then(highscore => {
                    if (highscore !== null) {
                        console.log('Der aktuelle highscore ist:', highscore);
                        if (highscore < req.session.user.points2) {
                            users.setHighScoreTwo(req.session.user.username, req.session.user.points2);
                        }
                        req.session.user.points2 = 0;
                    } else {
                        console.log('kein highscore gefunden.');
                    }
                    res.json({points: req.session.user.points2, korrekt: korrekt});
                })
            }
        }
    // res.json({points: req.session.user.points2, korrekt: korrekt});
});

