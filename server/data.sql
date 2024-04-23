CREATE TABLE zadaci(
	id SERIAL PRIMARY KEY,
	user_email VARCHAR(255),
	title VARCHAR(30),
	progress INT,
	date VARCHAR(300)
);

CREATE TABLE users(
	email VARCHAR(255) PRIMARY KEY UNIQUE,
	hashed_password VARCHAR(255)
);

INSERT INTO zadaci(user_email, title, progress, date) 
VALUES ('jopa@mail.com', 'Kupi mliko', 10, '4.4.2024.');