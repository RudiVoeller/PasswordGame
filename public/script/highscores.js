async function fetchScoresOne() {
    const response = await fetch('/getScoresOne');
    const scores = await response.json();
    const tableBody = document.getElementById('Table1').querySelector('tbody');

    scores.forEach(score => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${score.username}</td>
            <td>${score.high_score_one}</td>
        `;
        tableBody.appendChild(row);
    });
}

async function fetchScoresTwo() {
    const response = await fetch('/getScoresTwo');
    const scores = await response.json();
    const tableBody = document.getElementById('Table2').querySelector('tbody');

    scores.forEach(score => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${score.username}</td>
            <td>${score.high_score_two}</td>
        `;
        tableBody.appendChild(row);
    });
}

function onSecondGame() {
    const token = localStorage.getItem('token');
    window.location.href = `/password_strength_sim?token=${encodeURIComponent(token)}`;
}
async function onReload() {
    const token = localStorage.getItem('token');
    window.location.href = `/highscores?token=${encodeURIComponent(token)}`;
}
async function onFirstGame() {
    const token = localStorage.getItem('token');
    window.location.href = `/good_bad_password?token=${encodeURIComponent(token)}`;
}

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
            //document.getElementById('highscore').textContent = data.record_two;
        })
        .catch(error => {
            console.error('Fehler beim Laden der Benutzerdaten:', error);
        });
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

fetchScoresOne();
fetchScoresTwo();
loadUserData();