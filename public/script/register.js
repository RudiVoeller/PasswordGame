// Event für Login Button hinzufügen
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

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

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Serverantwort:', data);

        if (response.ok) {
            // Weiterleitung auf die neue Seite
            window.location.href = `/login`;
        } else {
            alert('Benutzer ist bereits vorhanden!')
            console.log('Fehlgeschlagene Registrierung:', data.message);
            errorMessage.textContent = 'Registrierung fehlgeschlagen: ' + data.message;
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Netzwerk- oder Serverfehler:', error);
        errorMessage.textContent = 'Registrierung fehlgeschlagen: Netzwerk- oder Serverfehler';
        errorMessage.style.display = 'block';
    }
});

// Event für Login Button hinzufügen
document.getElementById('btn_login').addEventListener('click', async function(event) {
    event.preventDefault();
    window.location.href = '/login';
})

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