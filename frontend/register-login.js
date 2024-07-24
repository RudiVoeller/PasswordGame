function onOpenRegister() {
    window.location.href = '/register';
}

function onOpenLogin() {
    window.location.href = '/login';
}

function checkPasswordPolicy(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
    }
    if (!hasUpperCase) {
        return 'Das Passwort muss mindestens einen Großbuchstaben enthalten.';
    }
    if (!hasLowerCase) {
        return 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten.';
    }
    if (!hasNumbers) {
        return 'Das Passwort muss mindestens eine Zahl enthalten.';
    }
    if (!hasSpecialChar) {
        return 'Das Passwort muss mindestens ein Sonderzeichen enthalten.';
    }
    return null;
}

function onRegister() {
    const username = document.getElementById("user-input").value;
    const password = document.getElementById("pass-input").value;
    const passwordRepeat = document.getElementById("pass-confirm-input").value;

    if (password !== passwordRepeat) {
        return alert('Passwörter stimmen nicht überein');
    }

    const passwordError = checkPasswordPolicy(password);
    if (passwordError) {
        return alert(passwordError);
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
                return response.text().then(message => {
                    throw new Error(message);
                });
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
            return response.text().then(message => {
                throw new Error(message);
            });
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