function onOpenRegister() {
    window.location.href = '/register';
}

function onOpenLogin() {
    window.location.href = '/login';
}

function onRegister() {
    const username = document.getElementById("user-input").value;
    const password = document.getElementById("pass-input").value;
    const passwordRepeat = document.getElementById("pass-confirm-input").value;

    if (password !== passwordRepeat) {
        return alert('Passwörter stimmen nicht überein');
    }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Registrieren');
            }
            // Weiterleitung zur nächsten Seite
            window.location.href = '/login';
        })
        .catch(error => {
            console.error('Registrierungsfehler:', error);
            alert("Fehler: " + error.message); // Popup-Fenster anzeigen

            // Fehlerbehandlung hier, z.B. Fehlermeldung anzeigen
        });
}

function onLogin() {
    const username = document.getElementById("user-input").value;
    const password = document.getElementById("pass-input").value;
    console.log(username)
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Fehler beim Anmelden');
        }
        // Weiterleitung zur nächsten Seite
        window.location.href = '/good_bad_password';
    })
    .catch(error => {
        console.error('Anmeldefehler:', error);
        alert("Fehler: " + error.message); // Popup-Fenster anzeigen
        // Fehlerbehandlung hier, z.B. Fehlermeldung anzeigen
    });
}

async function onLogout() {
    fetch('/logout');
    window.location.href = '/';
}