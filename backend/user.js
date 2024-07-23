// Importieren des MySQL-Moduls
const mysql = require('mysql2');

// Erstellen einer Verbindung zur Datenbank
const db = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'passwordgame'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Verbindung zur Datenbank erfolgreich hergestellt');
});

function getPasswordByUser(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT password FROM users WHERE username = ?';
        db.query(query, [username], (err, result) => {
            if (err) reject(err);
            // Stellt sicher, dass ein Ergebnis vorhanden ist, bevor versucht wird, das Passwort zu extrahieren
            if (result.length > 0) {
                resolve(result[0].password);
            } else {
                reject(new Error('Benutzer nicht gefunden'));
            }
        });
    });
}

async function createUser(userData) {
    const usernameExists = await checkUsernameExists(userData.username);
    if (usernameExists) {
        throw new Error('Benutzername bereits vergeben');
    }
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO users SET ?';
        db.query(query, userData, (err, result) => {
            if (err) reject(err);
            resolve(result.insertId);
        });
    });
}

async function getHighScoreOneByUsername(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT high_score_one FROM users WHERE username = ?';
        db.query(query, [username], (err, result) => {
            if (err) reject(err);
            // Stellt sicher, dass ein Ergebnis vorhanden ist, bevor versucht wird, das Passwort zu extrahieren
            if (result.length > 0) {
                resolve(result[0].high_score_one);
            } else {
                reject(new Error('Benutzer nicht gefunden'));
            }
        });
    });
}

async function getHighScoreTwoByUsername(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT high_score_two FROM users WHERE username = ?';
        db.query(query, [username], (err, result) => {
            if (err) {
                reject(err);
            } else if (result.length > 0) {
                resolve(result[0].high_score_two);
            } else {
                reject(new Error('Benutzer nicht gefunden'));
            }
        });
    });
}

function setHighScoreOne(username, newScore) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE users SET high_score_one = ? WHERE username = ?';
        db.query(query, [newScore, username], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve('High Score One erfolgreich aktualisiert');
            }
        });
    });
}

function setHighScoreTwo(username, newScore) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE users SET high_score_two = ? WHERE username = ?';
        db.query(query, [newScore, username], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve('High Score Two erfolgreich aktualisiert');
            }
        });
    });
}

function checkUsernameExists(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id FROM users WHERE username = ?';
        db.query(query, [username], (err, result) => {
            if (err) reject(err);
            resolve(result.length > 0);
        });
    });
}
async function getHighScores() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT username, high_score_one, high_score_two FROM users ORDER BY high_score_one DESC, high_score_two DESC';
        db.query(query, (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
}

// Exportieren der Funktionen
module.exports = { getPasswordByUser, createUser, getHighScoreOneByUsername, getHighScoreTwoByUsername, setHighScoreOne, setHighScoreTwo, getHighScores};