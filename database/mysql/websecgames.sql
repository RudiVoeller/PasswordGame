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

-- Standardwerte in die Tabelle 'users' einfügen
INSERT INTO users (username, password, high_score_one, high_score_two) VALUES
('john_doe', 'password123', 10, 50),
('jane_doe', 'password456', 20, 70),
('alice',  'password789', 15, 60),
('bob',  'password101', 25, 80);