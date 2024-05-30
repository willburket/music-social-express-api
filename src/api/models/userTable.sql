USE Users;

SELECT * FROM Users;

DELETE FROM Users
WHERE id >= 54;

UPDATE Users
SET following_count = 1
WHERE id = 51;

ALTER TABLE Users
MODIFY registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE Users
ADD UNIQUE (username); 




