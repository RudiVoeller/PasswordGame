// Passwörter beim Laden der Seite laden
createPasswords()

// Benutzerdaten laden
loadUserData();

async function createPasswords() {

    const response = await fetch('http://localhost:3000/passwords', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token: localStorage.getItem('token')})
    });

    if (response.ok) {
        let passwords = await response.json();
        for (var i = 0; i < passwords.length; i++) {
            var pw = document.createElement('label');
            pw.textContent = passwords.at(i);
            pw.addEventListener('dragstart', drag);
            pw.draggable = true;
            pw.className = "draggable"
            pw.id = "pw_" + i;
            document.getElementById('passwords').appendChild(pw);
        }
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
    ev.target.appendChild(document.getElementById(data));
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
    document.getElementById("points").innerHTML = "";

    createPasswords();
}

function onNextGame() {
    window.location.href = '/password_strength_sim';
}

function allowDrop(ev) {
    ev.preventDefault();
}

async function onSolve() {
    var childrenBad = document.getElementById("bad-dropzone").children;
    var passwordsBad = [];
    var passwordsGood = [];
    for (var i = 0; i < childrenBad.length; i++) {
        passwordsBad.push(childrenBad[i].textContent);
    }
    var childrenGood = document.getElementById("good-dropzone").children;
    for (var i = 0; i < childrenGood.length; i++) {
        passwordsGood.push(childrenGood[i].textContent);
    }
    const response = await fetch('http://localhost:3000/solve', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ passwordsBad, passwordsGood})
    });
    console.log(response.body);
    let points = 0;
    if (response.ok) {
        points = await response.json();
    }
    else {
        console.error('Solving passwords failed');
    }

    document.getElementById("score").innerHTML = points + " von 10 Punkten";
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
            document.getElementById('points').textContent = data.points;
        })
        .catch(error => {
            console.error('Fehler beim Laden der Benutzerdaten:', error);
        });
}

window.onload = () => {
    checkToken().then(isValid => {
        if (!isValid) {
            // Weiterleitung zur Login-Seite oder Anzeige einer Meldung
            console.log('Redirecting to login page...');
        }
    });
};