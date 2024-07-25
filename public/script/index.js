// Event für Login Button hinzufügen
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('user-input').value;
    const password = document.getElementById('pass-input').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Serverantwort:', data);

        if (response.ok && data.accessToken) {
            console.log('Token empfangen:', data.accessToken);
            // Token im localStorage speichern oder eine andere Speicherungsmethode verwenden
            localStorage.setItem('token', data.accessToken); // Beispiel
            // Weiterleitung auf die neue Seite
            const token = localStorage.getItem('token');
            window.location.href = `/good_bad_password?token=${encodeURIComponent(token)}`;
        } else {
            console.log('Fehlgeschlagene Anmeldung:', data.message);
            errorMessage.textContent = 'Anmeldung fehlgeschlagen: ' + data.message;
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Netzwerk- oder Serverfehler:', error);
        errorMessage.textContent = 'Anmeldung fehlgeschlagen: Netzwerk- oder Serverfehler';
        errorMessage.style.display = 'block';
    }
});

// Event für Register Button hinzufügen
document.getElementById('btn_register').addEventListener('click', async function(event) {
    event.preventDefault();
    window.location.href = '/register';
})