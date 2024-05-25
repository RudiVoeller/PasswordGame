function getRandomItem(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

// Funktion, um ein zufälliges Passwort anzuzeigen
function getRandomPassword(goodPasswords, badPasswords, usedPasswords) {
    // 50% Chance, ein gutes oder schlechtes Passwort zu wählen
    const isGoodPassword = Math.random() < 0.5;
    const password = isGoodPassword ? getRandomItem(goodPasswords) : getRandomItem(badPasswords);
    const passwordType = isGoodPassword;
    if (password in usedPasswords) {
        return getRandomPassword(goodPasswords, badPasswords, usedPasswords);
    }
    return [password, passwordType]
}

// Passwörter beim Laden der Seite laden
createPasswords()

function createPasswords() {

    fetch('passwords.json')
        .then(response => response.json())
        .then(data => {

            let goodPasswords = data.goodPasswords;
            let badPasswords = data.badPasswords;
            let usedPasswords = []

            for (let i = 0; i < 10; i++) {
                var pw = document.createElement('label');
                var [password, passwordType] = getRandomPassword(goodPasswords, badPasswords, usedPasswords);
                pw.textContent = password;
                pw.addEventListener('dragstart', drag);
                pw.draggable = true;
                pw.className = "draggable"
                pw.setAttribute("good", passwordType)
                pw.id = "pw_" + i;
                document.getElementById('passwords').appendChild(pw);
                usedPasswords.push(password);
            }
        })
        .catch(error => {
            console.error('Fehler beim Laden der Passwortdaten:', error);
        });

}

function allowDrop(ev) {
    ev.preventDefault();
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

function onSolve() {
    var childrenBad = document.getElementById("bad-dropzone").children;
    var points = 0
    for (var i = 0; i < childrenBad.length; i++) {
        if (childrenBad[i].getAttribute("good") === "false") {
            points++
        }
    }
    var childrenGood = document.getElementById("good-dropzone").children;
    for (var i = 0; i < childrenGood.length; i++) {
        if (childrenGood[i].getAttribute("good") === "true") {
            ++points
        }
    }
    document.getElementById("points").innerHTML = points + " von 10 Punkten";

}