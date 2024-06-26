let password = "";
let currentCharset = "0123456789";
let digits = "0123456789";
let lower = "abcdefghijklmnopqrstuvwxyz";
let upper = lower.toUpperCase();
let symbol = "%+-/!,$_";
let passwordLength = 10;

function updateCharset() {
    const digitValue = document.getElementById("digitSlider").value;
    const lowerValue = document.getElementById("lowerSlider").value;
    const upperValue = document.getElementById("upperSlider").value;
    const symbolValue = document.getElementById("symbolSlider").value;
    const totalChars = parseInt(digitValue) + parseInt(lowerValue) + parseInt(upperValue) + parseInt(symbolValue);
    
    if (totalChars === 0) {
        alert("Bitte wählen Sie mindestens eine Art von Zeichen.");
        return;
    }

    let newCharset = "";
    if(parseInt(digitValue) == 1){
        newCharset += digits
    }
    if(parseInt(lowerValue) == 1){
        newCharset += lower
    }
    if(parseInt(upperValue) == 1){
        newCharset += upper
    }
    if(parseInt(symbolValue) == 1){
        newCharset += symbol
    }

    currentCharset = newCharset;
    generatePassword();
}

function updatePasswordLength() {
    passwordLength = document.getElementById("lengthSlider").value;
    document.getElementById("lengthValue").innerText = passwordLength;
    generatePassword();
}

function generatePassword() {
    password = Array.from({ length: passwordLength }, () => currentCharset[Math.floor(Math.random() * currentCharset.length)]).join('');
    updateDisplay();
}

function updateDisplay() {
    const passwordDisplay = document.getElementById("passwordDisplay");
    passwordDisplay.innerText = `Aktuelles Passwort: ${password}`;

    updateStrength();
}

function updateStrength() {
    const strengthBar = document.getElementById("strength-bar");
    const strengthDescription = document.getElementById("strength-description");

    const timeToCrack = calculateTimeToCrack(password, currentCharset);
    strengthBar.style.width = `${Math.min(timeToCrack / 1e6 * 100, 100)}%`;
    strengthBar.style.backgroundColor = getStrengthColor(timeToCrack);
    strengthDescription.innerHTML = "Zeit zum Knacken " + timeToCrack + " Sekunden <br>" + `Zeit zum Knacken: ${formatTime(timeToCrack)}`;
}

function calculateTimeToCrack(password, currentCharset) {
    const charSetSize = new Set(currentCharset).size;
    const attemptsPerSecond = 1e9; // 1 Milliarde Versuche pro Sekunde

    const combinations = Math.pow(charSetSize, password.length);
    const seconds = combinations / attemptsPerSecond;

    return Math.floor(seconds);
}

function getStrengthColor(timeToCrack) {
    if (timeToCrack < 1e2) return 'red';
    if (timeToCrack < 5e5) return 'orange';
    return 'green';
}

function formatTime(seconds) {
    const units = [
        { label: "Jahr", value: 60 * 60 * 24 * 365 },
        { label: "Tag", value: 60 * 60 * 24 },
        { label: "Stunde", value: 60 * 60 },
        { label: "Minute", value: 60 },
        { label: "Sekunde", value: 1 }
    ];

    let timeString = "";
    for (const unit of units) {
        if (seconds >= unit.value) {
            const count = Math.floor(seconds / unit.value);
            if (unit.label === "Jahr" || unit.label === "Tag") {
                timeString += `${count} ${unit.label}${count > 1 ? "e" : ""} `;
                seconds %= unit.value;
            } else {
                timeString += `${count} ${unit.label}${count > 1 ? "n" : ""} `;
                seconds %= unit.value;
            }
        }
    }
    return timeString.trim() || "weniger als eine Sekunde";
}

// Funktion zum abrufen der Passwörter für das aktuelle Spiel
async function getPSSPasswords() {
    const response = await fetch('/getPSSPasswords', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
        //body: JSON.stringify({ passwordsBad, passwordsGood})
    });

    if (!response.ok) {
        throw new Error(`Fehler beim Senden der Daten: ${response.statusText}`);
    }

    const data = await response.json();
    document.getElementById('pw1value').textContent = data[0];
    document.getElementById('pw2value').textContent = data[1];
    document.getElementById('pw3value').textContent = data[2];
    document.getElementById('pw4value').textContent = data[3];
    document.getElementById('pw5value').textContent = data[4];

    //document.getElementById('score').textContent = result.points + " von 10 Punkten"; 
    //document.getElementById('userinfo').textContent = "Automatisch generierter Text zur Verbesserung der Leistung des Spielers.";
}

async function onSolve() {
    let DOMpasswords = document.querySelectorAll('#playerEntries span');
    let DOMsolvetime = document.querySelectorAll('#playerEntries input');
    let passwords = [];
    let solvetime = [];

    for (let i = 0; i < DOMpasswords.length; i++) {
        passwords.push(DOMpasswords[i].textContent);
    }
    for (let i = 0; i < DOMsolvetime.length; i++) {
        solvetime.push(DOMsolvetime[i].value);
    }

    const response = await fetch('/solvePSS', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ passwords, solvetime})
    });

    if (!response.ok) {
        throw new Error(`Fehler beim Senden der Daten: ${response.statusText}`);
      }

    const result = await response.json();
    document.getElementById('score').textContent = result.points + " von 10 Punkten";

    document.getElementById('userinfo').textContent = "Automatisch generierter Text zur Verbesserung der Leistung des Spielers.";
}

// Funktionen für den Header
// Laden der Benutzerdaten
function loadUserData() {
    fetch('/userdata')
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Laden der Benutzerdaten');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('username').textContent = data.username;
            document.getElementById('highscore').textContent = data.record;
        })
        .catch(error => {
            console.error('Fehler beim Laden der Benutzerdaten:', error);
        });
}

function onNextGame() {
    window.location.href = '/guess_the_password';
}

// Logout
function onLogout() {
    fetch('/logout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Fehler beim Abmelden');
        }
        // Weiterleitung zur nächsten Seite
        window.location.href = '/';
    })
    .catch(error => {
        console.error('Abmeldefehler:', error);
        // Fehlerbehandlung hier, z.B. Fehlermeldung anzeigen
    });
}

generatePassword();     // Initiale Anzeige aktualisieren
loadUserData();         // Benutzerdaten laden
getPSSPasswords();        // Passwörter abrufen