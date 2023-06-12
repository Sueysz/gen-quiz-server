-- Créer la base de données 'genquiz'
CREATE DATABASE genquiz;

-- Utiliser la base de données 'genquiz'
USE genquiz;

-- Créer la table 'users'
CREATE TABLE users (
   id INT NOT NULL AUTO_INCREMENT,
   username VARCHAR(45) NOT NULL,
   email VARCHAR(255) NOT NULL,
   password VARCHAR(255) NOT NULL,
   img VARCHAR(255) NOT NULL,
   PRIMARY KEY (id)
);

-- Créer la table 'quiz'
CREATE TABLE quiz (
   id INT NOT NULL AUTO_INCREMENT,
   color VARCHAR(255) NOT NULL,
   slug VARCHAR(255),
   questions TEXT,
   PRIMARY KEY (id)
);