-- Créer la base de données 'genquiz'
CREATE DATABASE genquiz;

CREATE TABLE `users` (
   `id` int PRIMARY KEY AUTO_INCREMENT,
   `username` varchar(255) NOT NULL,
   `email` varchar(255) NOT NULL,
   `password` varchar(255) NOT NULL
);

CREATE TABLE `quiz` (
   `id` int PRIMARY KEY AUTO_INCREMENT,
   `color` varchar(255) NOT NULL,
   `slug` varchar(255),
   `questions` json,
   `creator_id` int
);

CREATE TABLE `category` (
   `id` int PRIMARY KEY AUTO_INCREMENT,
   `name` varchar(255) NOT NULL
);

CREATE TABLE `history` (
   
);

CREATE TABLE `categories_quiz` (
   `id` int,
   `categories_id` int,
   `quiz_id` int
)ENGINE=INNODB;

CREATE TABLE `score` (
   `id` int,
   `user_id` int,
   `quiz_id` int,
   `score` int,
   `created_at` timeStamp
);

ALTER TABLE `categories_quiz` ADD FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id`);

ALTER TABLE `score` ADD FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id`);

ALTER TABLE `categories_quiz` ADD FOREIGN KEY (`categories_id`) REFERENCES `category` (`id`);

ALTER TABLE `quiz` ADD FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`);

ALTER TABLE `score` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);


CREATE TABLE score (
   id INT PRIMARY KEY AUTO_INCREMENT,
   user_id INT,
   quiz_id INT,
   score INT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (user_id) REFERENCES user(id),
   FOREIGN KEY (quiz_id) REFERENCES quiz(id)
);