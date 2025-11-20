# Insert data into the tables

USE berties_books;
INSERT INTO books (name, price) VALUES
('Brighton Rock', 20.25),
('Brave New World', 25.00),
('Animal Farm', 12.99),
('Bright Light', 7.49),
('You Are Here', 13.00);

INSERT INTO users (username, first_name, last_name, email, hashed_password) VALUES
('gold', 'Gold', 'User', 'gold@test.com', '$2b$10$2KbWvBLnBFiiSgcScDOAHu0qXoU5r8cIj./W2BAVWhvarvSTbThOe');