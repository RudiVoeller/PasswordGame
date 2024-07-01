
// Passwörter beim Laden der Seite laden
loadUserData();
createPassword()
var points = 0;
async function createPassword() {
    const response = await fetch('http://localhost:3000/passwords', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token: localStorage.getItem('token')})
    });
    if (response.ok) {

        let password = await response.text();
        console.log(password);
            var pw = document.createElement('label');
            pw.textContent = password.toString();
            pw.addEventListener('dragstart', drag);
            pw.draggable = true;
            pw.className = "draggable"
            pw.id = "pw";
            document.getElementById('passwords').appendChild(pw);

    } else {
        console.error('Fetching passwords failed');
    }
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    console.log(document.getElementById(data).textContent);
    solve(document.getElementById(data).textContent, ev.target.id === "good-dropzone");
    document.getElementById(data).remove();
    createPassword()
}

function onRestart() {
    var ele = document.getElementById('passwords');
    var eleGood = document.getElementById("good-dropzone");
    var eleBad = document.getElementById("bad-dropzone");

    while (ele.hasChildNodes()) {
        ele.removeChild(ele.firstChild);
    }
    while (eleGood.hasChildNodes()) {
        eleGood.removeChild(eleGood.firstChild);
    }
    while (eleBad.hasChildNodes()) {
        eleBad.removeChild(eleBad.firstChild);
    }
    document.getElementById('score').textContent = '';

    createPassword();
}

function allowDrop(ev) {
    ev.preventDefault();
}

async function solve(password, isGood) {


    const response = await fetch('http://localhost:3000/solve', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ password:password, isGood:isGood})
    });

    if (!response.ok) {
        throw new Error(`Fehler beim Senden der Daten: ${response.statusText}`);
      }

    const result = await response.json();

    if (result.correct) {
        points++;
        document.getElementById('userinfo').visible = false;
    }
    else {
        points = 0;
        document.getElementById('userinfo').visible = true;
    document.getElementById('userinfo').textContent = "Sichere Passwörter enthalten mindestens 8 Zeichen, Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen. Unsichere erkennt man an häufigen Wörtern, Zahlenreihen oder dem Namen des Benutzers.";
    }



    document.getElementById('current_score').textContent = points;
}

function onNextGame() {
    window.location.href = '/password_strength_sim';
}

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