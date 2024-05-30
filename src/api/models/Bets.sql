USE Users;

CREATE TABLE Bets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  bet_type VARCHAR(10),
  pick VARCHAR(255),
  outcome VARCHAR(1),
  spread INT,
  qty INT
);

SELECT * FROM Bets;

DELETE FROM Bets
WHERE id = 1;

ALTER TABLE Bets
ADD COLUMN api_event_id VARCHAR(255) NOT NULL;