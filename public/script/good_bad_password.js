var points = 0;

async function createPassword() {
    const response = await fetch('http://localhost:3000/passwords', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token: localStorage.getItem('token')})
    });
    if (response.ok) {

        let password = await response.text();
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

async function onLeaderboard() {
    const token = localStorage.getItem('token');
    window.location.href = `/highscores?token=${encodeURIComponent(token)}`;
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    console.log(document.getElementById(data).textContent);
    solve(document.getElementById(data).textContent, ev.target.id === "good-dropzone");
    document.getElementById(data).remove();
    createPassword()
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
        document.getElementById('userinfo').style.color = "green";
        document.getElementById('userinfo').textContent = "Richtige Antwort!";
    }
    else {
        document.getElementById('userinfo').style.color = "red";

        document.getElementById('userinfo').visible = true;
        document.getElementById('userinfo').textContent = "Leider falsch! Sichere Passwörter enthalten mindestens 8 Zeichen, Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen. Unsichere erkennt man an häufigen Wörtern, Zahlenreihen oder dem Namen des Benutzers.";
    }

    document.getElementById('current_score').textContent = result.points;
    loadUserData()

}

function onNextGame() {
    const token = localStorage.getItem('token');
    window.location.href = `/password_strength_sim?token=${encodeURIComponent(token)}`;
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
            console.log(data);
            document.getElementById('username').textContent = data.username;
            document.getElementById('highscore').textContent = data.record_one;
        })
        .catch(error => {
            console.error('Fehler beim Laden der Benutzerdaten:', error);
        });
}

async function onReload() {
    const token = localStorage.getItem('token');
    window.location.href = `/good_bad_password?token=${encodeURIComponent(token)}`;
}

// Logout
function onLogout() {

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

// Passwörter beim Laden der Seite laden
createPassword();
loadUserData();