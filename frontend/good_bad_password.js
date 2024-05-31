// Passwörter beim Laden der Seite laden
createPasswords()

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

    document.getElementById("points").innerHTML = points + " von 10 Punkten";


}