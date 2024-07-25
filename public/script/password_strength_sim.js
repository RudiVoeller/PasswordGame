let password = "";
let currentCharset = "0123456789";
let digits = "0123456789";
let lower = "abcdefghijklmnopqrstuvwxyz";
let upper = lower.toUpperCase();
let symbol = "%+-/!,$_";
let passwordLength = 10;
let level = 1;

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
    //passwordDisplay.innerText = `Aktuelles Passwort: ${password}`;
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

    const combinations = Math.pow(charSetSize, passwordLength);
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
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ level})
    });

    if (!response.ok) {
        throw new Error(`Fehler beim Senden der Daten: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('..')
    if (response.ok && data) {
        document.getElementById('pw1value').textContent = data.passwords;
        document.getElementById('level').textContent = 'Level: ' + level
    }
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

    console.log(`länge ${solvetime.length} typ ${solvetime[0].length > 0}  >0 ${solvetime[0] >= 0}`)
    if (solvetime.length > 0 && solvetime[0].length > 0 && solvetime[0] >= 0) {
        
    } else {
        return alert('Bitte eine Zeit in Sekunden >= 0 eingeben.');
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
    if (result.points === 1) {
        document.getElementById('score').textContent = result.points + " Punkt";
        document.getElementById('current_score').textContent  = result.points
    } else {
        document.getElementById('score').textContent = result.points + " Punkte";
        document.getElementById('current_score').textContent  = result.points
    }

    if (result.korrekt === true){
        document.getElementById('userinfo').textContent = "Die Antwort war korrekt!";
        level +=1;
        getPSSPasswords();
    } else {
        level = 1;
        document.getElementById('userinfo').textContent = "Die Antwort war leider falsch. Die Stärke eines Passworts wird durch die Länge und den Zeichensatz bestimmt. Prüfe genau ob du alles korrekt eingestllt hast und versuche es erneut.";
    }
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
            document.getElementById('highscore').textContent = data.record_two;
        })
        .catch(error => {
            console.error('Fehler beim Laden der Benutzerdaten:', error);
        });
}

function onPrevGame() {
    const token = localStorage.getItem('token');
    window.location.href = `/good_bad_password?token=${encodeURIComponent(token)}`;
}
async function onReload() {
    const token = localStorage.getItem('token');
    window.location.href = `/password_strength_sim?token=${encodeURIComponent(token)}`;
}
async function onLeaderboard() {
    const token = localStorage.getItem('token');
    window.location.href = `/highscores?token=${encodeURIComponent(token)}`;
}


// Logout
function onLogout() {
    // Entferne den JWT aus dem localStorage
    //localStorage.removeItem('token');

    // Optional: Informiere den Server über den Logout
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: localStorage.getItem('token') })
    }).then(response => {
        if (response.ok) {
            // Weiterleitung zur Login-Seite oder Anzeige einer Logout-Bestätigung
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }).catch(error => {
        console.error('Fehler beim Logout:', error);
    });
}

generatePassword();     // Initiale Anzeige aktualisieren
loadUserData();         // Benutzerdaten laden
getPSSPasswords();        // Passwörter abrufen