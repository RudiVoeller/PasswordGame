function onOpenRegister() {
    window.location.href = '/register';
}

function onOpenLogin() {
    window.location.href = '/';
}

function onOpenForgotPassword() {
    window.location.href = '/';
}

function onLogin() {
    const email = document.getElementById("user-input").value;
    const password = document.getElementById("pass-input").value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
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
        // Fehlerbehandlung hier, z.B. Fehlermeldung anzeigen
    });
}

async function onLogout() {
    fetch('/logout');
    window.location.href = '/';
}