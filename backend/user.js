const fs = require('fs');
const path = require('path');

// Pfad zur JSON-Datei
const dataPath = path.join(__dirname, '..','database', 'users.json');   // Pfad zur JSON-Datei mit Benutzerdaten
                                                                        // später ersetzen durch Datenbankabfrage

// Funktion zum Lesen der JSON-Datei
function readUserData() {
    const data = fs.readFileSync(dataPath);
    return JSON.parse(data);
}

// Funktion zum Schreiben in die JSON-Datei
function writeUserData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Funktion zum Prüfen ob Benutzer existiert
function userExists(username, password) {
    //const users = readUserData();
    const user = readUserData().find(user => user.username === username && user.password === password);
    return user;
}

// Funktion zum Abrufen eines Benutzers
function getUser(username) {
    const usersData = readUserData();
    return usersData.users.find(user => user.username === username);
}

// Funktion zum Aktualisieren des Punktestands eines Benutzers
function updateUserPoints(username, points) {
    const usersData = readUserData();
    const user = usersData.users.find(user => user.username === username);
    if (user) {
        user.points = points;
        writeUserData(usersData);
    }
    return user;
}

module.exports = {
    readUserData,
    writeUserData,
    userExists,
    getUser,
    updateUserPoints
};
