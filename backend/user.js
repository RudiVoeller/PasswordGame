// Importieren des MySQL-Moduls
const mysql = require('mysql');

// Erstellen einer Verbindung zur Datenbank
const db = mysql.createConnection({
    host: 'localhost',
    user: 'meinBenutzername',
    password: 'meinPasswort',
    database: 'passwordgame'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Verbindung zur Datenbank erfolgreich hergestellt');
});

// Funktion, um einen Benutzer anhand der ID zu holen
function getUserById(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) reject(err);
            resolve(result[0]);
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

function getHighScoresById(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT high_score_one, high_score_two FROM users WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) reject(err);
            resolve(result[0]);
        });
    });
}

function updateHighScore(id, scoreName, newScore) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE users SET ${mysql.escapeId(scoreName)} = ? WHERE id = ?`;
        db.query(query, [newScore, id], (err, result) => {
            if (err) reject(err);
            resolve(result.affectedRows);
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

// Exportieren der Funktionen
module.exports = { getUserById, createUser, getHighScoresById, updateHighScore, checkUsernameExists };