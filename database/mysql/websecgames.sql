-- Datenbank erstellen, falls diese noch nicht existiert
CREATE DATABASE IF NOT EXISTS passwordgame;

-- Datenbank verwenden
USE passwordgame;

-- Tabelle 'users' erstellen, falls diese noch nicht existiert
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    high_score_one INT DEFAULT 0,
    high_score_two INT DEFAULT 0
);