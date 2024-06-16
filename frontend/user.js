function loadUserData() {
    fetch('/userdata')
        .then(response => {
            if (!response.ok) {
                throw new Error('Fehler beim Laden der Benutzerdaten');
            }
            return response.json();
        })
        .then(data => {
            // Daten erfolgreich geladen, verarbeiten und anzeigen
            document.getElementById('username').textContent = data.username;
            document.getElementById('points').textContent = data.points;
        })
        .catch(error => {
            console.error('Fehler beim Laden der Benutzerdaten:', error);
        });
}