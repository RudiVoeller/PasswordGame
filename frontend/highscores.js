async function fetchHighScores() {
    try {
        const response = await fetch('/highscores');
        const highScores = await response.json();
        const highScoresContainer = document.getElementById('highscore-list');
        highScores.forEach(score => {
            const scoreElement = document.createElement('div');
            scoreElement.textContent = `Benutzer: ${score.username}, High Score 1: ${score.high_score_one}, High Score 2: ${score.high_score_two}`;
            highScoresContainer.appendChild(scoreElement);
        });
    } catch (err) {
        console.error('Fehler beim Abrufen der Highscores:', err);
    }
}

window.onload = fetchHighScores;