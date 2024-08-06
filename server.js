const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
// Datenbank Funktionen zugänglich machen
const dbHandler = require('./db_handler');

// Server Token
const ACCESS_TOKEN_SECRET = '3526cf47c19e869fb63bad0d75b150afe3201bdb0c717822dcc53e1cbcb148e9a7181b28586310806a6805a9cc18f364';
const blacklistedTokens = new Set();

// middleware Funktion zum Prüfen auf ein gültiges Token
const authenticateToken = (req, res, next) => {
    const token = req.query.token;
    if (token == null) return res.sendStatus(401); // Kein Token vorhanden

    if (blacklistedTokens.has(token)) {
       return  res.sendFile(`${publicPath}/index.html`)

    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Ungültiges Token
        req.user = user;
        next(); // Token ist gültig, weiter zur geschützten Route
    });
};

// Standardverzeichnis für öffentliche Dateien
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
// Sitzungseinrichtung
app.use(session({
    secret: '3526cf47c19e869fb63bad0d75b150afe3201bdb0c717822dcc53e1cbcb148e9a7181b28586310806a6805a9cc18f364',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 60 * 60 * 1000 // 60 Minuten
    }
}));

let goodPasswords = [];
let badPasswords = [];

async function loadPasswords() {
    try {
        goodPasswords = await dbHandler.getGoodPasswordsFromDB();
        badPasswords = await dbHandler.getBadPasswordsFromDB();
         } catch (error) {
        console.error('Fehler beim Laden der Passwörter:', error);
    }
}

// Lade Passwörter unabhängig vom Server-Start
loadPasswords();

let privatePath = path.join(__dirname, 'private')
let publicPath = path.join(__dirname, 'public')

// App routing - offen
app.get('/login', (req, res) => {
    res.sendFile(`${publicPath}/index.html`)
    console.log(req.url);
})
app.get('/register', (req, res) => {
    res.sendFile(`${publicPath}/register.html`)
    console.log(req.url);
})
// App routing - privat
app.get('/good_bad_password', authenticateToken, (req, res) => {
    req.session.points = 0
    res.sendFile(`${privatePath}/good_bad_password.html`)
    console.log(req.url);
})
app.get('/password_strength_sim', authenticateToken, (req, res) => {
    req.session.points2 = 0
    res.sendFile(`${privatePath}/password_strength_sim.html`)
    console.log(req.url);
})
app.get('/highscores', authenticateToken, (req, res) => {
    res.sendFile(`${privatePath}/highscores.html`)
    console.log(req.url);
})

app.post('/login', async (req, res) => {
    // Benutzer authentifizieren
    const username = req.body.username;
    const password = req.body.password;
    const user = {username: username};
    try {
        const dbPassword = await dbHandler.getPasswordByUser(username)
        const match = await bcrypt.compare(password, dbPassword)
        if (match) {
            // Passwörter stimmen überein
            console.log(`Erfolgreich angemeldet als ${username}`)
            req.session.user = {username: username};
            const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET,  { expiresIn: '1h' })
            res.json({accessToken: accessToken, success: true})

        } else {
            // Passwörter stimmen nicht überein
            console.log('Ungültige Anmeldeinformationen')
            res.status(401).send('Ungültige Anmeldeinformationen')
        }
    } catch (err) {
        console.error('Login-Fehler:', err);
        res.status(500).send('Fehler beim Anmelden des Benutzers');
    }
})
app.post('/logout', async (req, res) => {
    console.log('/logout')
    const { token } = req.body;
    if (token) {
        blacklistedTokens.add(token);
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
})

app.post('/register', async (req, res) => {
    console.log("register")
    const username = req.body.username;
    const password = req.body.password;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Erstellen eines neuen Benutzerobjekts mit dem gehashten Passwort
        const newUser = {
            username: username,
            password: hashedPassword, // Verwenden des gehashten Passworts
            high_score_one: 0,
            high_score_two: 0
        };
        // Aufrufen der createUser Funktion aus db_handler.js
        dbHandler.createUser(newUser)
            .then(userId => {
                res.status(201).send({message: 'Benutzer erfolgreich erstellt'});
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
// Gibt Benutzerdaten (Name aktuellen Punktestand und Rekord an Client zurück)
app.get('/userdata', async (req, res) => {
    console.log('/userdata')
    if (req.session) {
        res.json({
            username: await req.session.user.username,
            points:  await req.session.points,
            points2: await req.session.points2,
            record_one: await dbHandler.getHighScoreOneByUsername(req.session.user.username),
            record_two: await dbHandler.getHighScoreTwoByUsername(req.session.user.username)
        });
    } else {
        res.status(401).json({message: 'Nicht angemeldet'});
    }
});

// Passwort Sortierer
app.post('/passwords', (req, res) => {
    var password = getRandomPassword(goodPasswords, badPasswords);
    res.status(200).send(password);
});
function getRandomItem(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}
// Funktion, um ein zufälliges Passwort anzuzeigen
function getRandomPassword(goodPasswords, badPasswords) {
    // 50% Chance, ein gutes oder schlechtes Passwort zu wählen
    const isGoodPassword = Math.random() < 0.5;
    return isGoodPassword ? getRandomItem(goodPasswords) : getRandomItem(badPasswords);

}
// Passwort Sortierer Punkte berechnen
app.post('/solve', async (req, res) => {
    console.log("Solve Passwords")
    const password = req.body.password;
    const isGood = req.body.isGood;

    // Prüfe, ob das Passwort korrekt ist
    if (isGood && await goodPasswords.includes(password)) {
        req.session.points = (req.session.points || 0) + 1; // Initialisiere, falls undefined
        console.log("Antwort ist korrekt");
        try {
            const highscore = await dbHandler.getHSOneByUsername(req.session.user.username);
            if (highscore !== null) {
                console.log('Der aktuelle Highscore ist:', highscore);
                if (highscore < req.session.points) {
                    await dbHandler.setHighScoreOne(req.session.user.username, req.session.points);
                }
                console.log('Session Punkte: ' + req.session.points);
            } else {
                console.log('Kein Highscore gefunden.');
            }
            // Rückmeldung an den Client senden
            res.json({ correct: true, points: req.session.points });
        } catch (error) {
            console.error('Fehler beim Abrufen oder Setzen des Highscores:', error);
            res.status(500).json({ error: 'Interner Serverfehler' });
        }
    } else if (!isGood && await badPasswords.includes(password)) {
        req.session.points = (req.session.points || 0) + 1; // Initialisiere, falls undefined
        console.log("Antwort ist korrekt");
        try {
            const highscore = await dbHandler.getHSOneByUsername(req.session.user.username);
            if (highscore !== null) {
                console.log('Der aktuelle Highscore ist:', highscore);
                if (highscore < req.session.points) {
                    await dbHandler.setHighScoreOne(req.session.user.username, req.session.points);
                }
                console.log('Session Punkte: ' + req.session.points);
            } else {
                console.log('Kein Highscore gefunden.');
            }
            // Rückmeldung an den Client senden
            res.json({ correct: true, points: req.session.points });
        } catch (error) {
            console.error('Fehler beim Abrufen oder Setzen des Highscores:', error);
            res.status(500).json({ error: 'Interner Serverfehler' });
        }
    } else {
        console.log("Antwort ist Falsch");
        req.session.points = (req.session.points || 0); // Initialisiere, falls undefined
        try {
            const highscore = await dbHandler.getHSOneByUsername(req.session.user.username);
            if (highscore !== null) {
                console.log('Der aktuelle Highscore ist:', highscore);
                if (highscore < req.session.points) {
                    await dbHandler.setHighScoreOne(req.session.user.username, req.session.points);
                    req.session.points = 0
                }
                console.log('Session Punkte: ' + req.session.points);
            } else {
                console.log('Kein Highscore gefunden.');
            }
            // Rückmeldung an den Client senden
            res.json({ correct: false, points: req.session.points });
        } catch (error) {
            console.error('Fehler beim Abrufen oder Setzen des Highscores:', error);
            res.status(500).json({ error: 'Interner Serverfehler' });
        }
    }
    console.log('Session Punkte: ' + req.session.points);

});
// Punkte an Client zurückgeben
app.post('/getScore', (req, res) => {
    console.log('get Score')
    if (req.session) {
        res.json({points: req.session.points, points2: req.session.points2});
    } else {
        res.json({points: 0, points2: 0});
    }
});
// Passwort Stärke Simulator
// Passwörter an Client zurückgeben
app.post('/getPSSPasswords', (req, res) => {
    var level = req.body.level;
    console.log(`/get PSSPasswords - Level ${level}`)
    const passwords = generateStrengthPasswords(level);
    res.json({passwords: passwords});
});

// Funktion zum erstellen der Passwörter für den PSS
function generateStrengthPasswords(level) {
    let passwords = "";
    let digits = "0123456789";
    let lower = "abcdefghijklmnopqrstuvwxyz";
    let upper = lower.toUpperCase();
    let symbol = "%+-/!,$_";
    let currentCharset = "";

    // Erstellt unterschiedliche passwörter aufgrund des aktuellen levels
    if (level === 1) {
        currentCharset = ""
        currentCharset += digits
        passwords = generateGenericPassword(currentCharset, 6)
    } else if (level === 2) {
        currentCharset = ""
        currentCharset += digits
        currentCharset += lower
        passwords = generateGenericPassword(currentCharset, 6)
    } else if (level === 3) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        passwords = generateGenericPassword(currentCharset, 8)
    } else if (level === 4) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        passwords = generateGenericPassword(currentCharset, 8)
    } else if (level === 5) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        passwords = generateGenericPassword(currentCharset, 9)
    } else if (level === 6) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        passwords = generateGenericPassword(currentCharset, 10)
    } else if (level === 7) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        currentCharset += symbol;
        passwords = generateGenericPassword(currentCharset, 6)
    } else if (level === 8) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        currentCharset += symbol;
        passwords = generateGenericPassword(currentCharset, 8)
    } else if (level === 9) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        currentCharset += symbol;
        passwords = generateGenericPassword(currentCharset, 10)
    } else if (level >= 10) {
        currentCharset = "";
        currentCharset += digits;
        currentCharset += lower;
        currentCharset += upper;
        currentCharset += symbol;
        passwords = generateGenericPassword(currentCharset, 12)
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
        // prüft ob die Zeit +- 10% genau berechnet wurde
        if (getPasswordCrackTime(passwords[i]) >= (solveTime[i] * 0.9) && getPasswordCrackTime(passwords[i]) <= (solveTime[i] * 1.1)) {
            korrekt = true
            req.session.points2 = (req.session.points2 || 0) + 1;
            // Rekord in Datenbank speichern
            dbHandler.getHSTwoByUsername(req.session.user.username)
            .then(highscore => {
                if (highscore !== null) {
                    console.log('Der aktuelle Highscore ist:', highscore);
                    if (highscore < req.session.points2) {
                        dbHandler.setHighScoreTwo(req.session.user.username, req.session.points2);
                    }
                } else {
                    console.log('kein highscore gefunden.');
                }
                res.json({points: req.session.points2, korrekt: korrekt});
            })
        } else {
            // Rekord in Datenbank speichern
            dbHandler.getHSTwoByUsername(req.session.user.username)
                .then(highscore => {
                    if (highscore !== null) {
                        console.log('Der aktuelle highscore ist:', highscore);
                        if (highscore < req.session.points2) {
                            dbHandler.setHighScoreTwo(req.session.user.username, req.session.points2);
                        }
                        req.session.points2 = 0;
                    } else {
                        console.log('kein highscore gefunden.');
                    }
                    res.json({points: req.session.points2, korrekt: korrekt});
                })
            }
        }
});
// Route zum Abrufen der Daten für das Highscore-Board für Spiel eins
app.get('/getScoresOne', async (req, res) => {
    const boardOne = await dbHandler.getLeaderboardOne()
    res.json(boardOne);
  })
  // Route zum Abrufen der Daten für das Highscore-Board für Spiel zwei
app.get('/getScoresTwo', async (req, res) => {
    const boardTwo = await dbHandler.getLeaderboardTwo()
    res.json(boardTwo);
  })

app.listen(3000, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:3000`);
});