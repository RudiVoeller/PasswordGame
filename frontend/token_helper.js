
// Funktion zum Abrufen des Tokens aus dem Speicher
function getToken() {
    return localStorage.getItem('accessToken');
}

// Funktion zum Überprüfen des Tokens und ggf. Erneuern
async function checkToken() {
    let token = getToken();
    if (!token) {
        console.error('No token found');
        return false;
    }
    const response = await fetch('/protected', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        const data = await response.json();
        console.log('Token is valid:', data);
        return true;
    } else if (response.status === 403) {
        // Token ist abgelaufen, versuche ihn zu erneuern
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            console.error('No refresh token found');
            return false;
        }

        const refreshResponse = await fetch('/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: refreshToken })
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            saveTokens(data.accessToken, refreshToken);
            return true;
        } else {
            console.error('Unable to refresh token');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return false;
        }
    } else {
        console.error('Token is invalid');
        return false;
    }
}

