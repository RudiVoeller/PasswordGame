let password = "";
let currentCharset = "0123456789";
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
    newCharset += possibleChars.digits.substring(0, digitValue);
    newCharset += possibleChars.lower.substring(0, lowerValue);
    newCharset += possibleChars.upper.substring(0, upperValue);
    newCharset += possibleChars.symbols.substring(0, symbolValue);

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

    const timeToCrack = calculateTimeToCrack(password);
    strengthBar.style.width = `${Math.min(timeToCrack / 1e9 * 100, 100)}%`;
    strengthBar.style.backgroundColor = getStrengthColor(timeToCrack);
    strengthDescription.innerText = `Zeit zum Knacken: ${formatTime(timeToCrack)}`;
}

function calculateTimeToCrack(password) {
    const charSetSize = new Set(password).size;
    const attemptsPerSecond = 1e9; // 1 Milliarde Versuche pro Sekunde

    const combinations = Math.pow(charSetSize, password.length);
    const seconds = combinations / attemptsPerSecond;

    return seconds;
}

function getStrengthColor(timeToCrack) {
    if (timeToCrack < 1e3) return 'red';
    if (timeToCrack < 1e6) return 'orange';
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
            timeString += `${count} ${unit.label}${count > 1 ? "e" : ""} `;
            seconds %= unit.value;
        }
    }
    return timeString.trim() || "weniger als eine Sekunde";
}

generatePassword(); // Initiale Anzeige aktualisieren
