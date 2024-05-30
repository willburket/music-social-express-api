USE Users;

CREATE TABLE Betslips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  odds INT,
  wager INT,
  payout INT,
  outcome VARCHAR(1),
  bet_1_id INT,
  bet_1_odds INT, 
  bet_1_outcome VARCHAR(1),
  bet_2_id INT,
  bet_2_odds INT, 
  bet_2_outcome VARCHAR(1),
  bet_3_id INT,
  bet_3_odds INT, 
  bet_3_outcome VARCHAR(1),
  bet_4_id INT,
  bet_4_odds INT, 
  bet_4_outcome VARCHAR(1),
  bet_5_id INT,
  bet_5_odds INT, 
  bet_5_outcome VARCHAR(1),
  FOREIGN KEY (bet_1_id) REFERENCES Bets(id),
  FOREIGN KEY (bet_2_id) REFERENCES Bets(id),
  FOREIGN KEY (bet_3_id) REFERENCES Bets(id),
  FOREIGN KEY (bet_4_id) REFERENCES Bets(id),
  FOREIGN KEY (bet_5_id) REFERENCES Bets(id)
);

ALTER TABLE Betslips
MODIFY COLUMN payout DECIMAL(10, 3);

DELETE FROM Betslips
WHERE id >= 1;

SELECT * FROM Users.Betslips;