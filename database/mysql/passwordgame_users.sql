-- Datenbank erstellen, falls diese noch nicht existiert
CREATE DATABASE IF NOT EXISTS passwordgame;

-- Datenbank verwenden
USE passwordgame;

-- Tabelle 'users' erstellen, falls diese noch nicht existiert
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    points INT DEFAULT 0,
    record INT DEFAULT 0
);

-- Standardwerte in die Tabelle 'users' einfügen
INSERT INTO users (username, email, password, points, record) VALUES
('john_doe', 'john@example.com', 'password123', 10, 50),
('jane_doe', 'jane@example.com', 'password456', 20, 70),
('alice', 'alice@example.com', 'password789', 15, 60),
('bob', 'bob@example.com', 'password101', 25, 80);