USE Users;

SELECT * FROM Users;

DELETE FROM Users
WHERE id >= 58;

UPDATE Users
SET winnings = 0
WHERE id >= 0;


ALTER TABLE Users 
ADD COLUMN winnings INT;

ALTER TABLE Users
MODIFY COLUMN winnings DECIMAL(10, 2) DEFAULT 0.00;


UPDATE Users
SET following_count = 1
WHERE id = 51;

ALTER TABLE Users
MODIFY registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE Users
ADD UNIQUE (username); 




