# Create database script for Berties books

# Create the database
CREATE DATABASE IF NOT EXISTS berties_books;
USE berties_books;

DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS books;


# Create the tables
CREATE TABLE IF NOT EXISTS books (
    id     INT AUTO_INCREMENT,
    name   VARCHAR(50),
    price  DECIMAL(5, 2) UNSIGNED,
    PRIMARY KEY(id));

CREATE TABLE IF NOT EXISTS users (
    user_id          INT AUTO_INCREMENT,
    username         VARCHAR(50) UNIQUE NOT NULL,
    first_name       VARCHAR(50) NOT NULL,
    last_name        VARCHAR(50) NOT NULL,
    email            VARCHAR(100) UNIQUE NOT NULL,
    hashed_password  VARCHAR(100) NOT NULL, 
    PRIMARY KEY(user_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
    log_id      INT AUTO_INCREMENT,
    username    VARCHAR(50) NOT NULL,
    status      VARCHAR(20) NOT NULL,
    attempt_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(log_id)
);

