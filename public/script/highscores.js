async function fetchHighScores() {
    try {
        const response = await fetch('/highscores');
        const highScores = await response.json();

        document.getElementById('highscore-list').innerHTML = highScores

    } catch (err) {
        console.error('Fehler beim Abrufen der Highscores:', err);
    }
}

fetchHighScores();