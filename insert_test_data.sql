# Insert data into the tables

USE berties_books;
INSERT INTO books (name, price) VALUES
('Brighton Rock', 20.25),
('Brave New World', 25.00),
('Animal Farm', 12.99),
('Bright Light', 7.49),
('You Are Here', 13.00);

INSERT INTO users (username, first_name, last_name, email, hashed_password) VALUES
('gold', 'Gold', 'User', 'gold@test.com', '[YOUR_GENERATED_HASH]');