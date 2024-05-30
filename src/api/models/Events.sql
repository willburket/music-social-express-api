USE Users;

CREATE TABLE Events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  api_id VARCHAR(255) NOT NULL,
  league VARCHAR(100),
  home VARCHAR(100),
  away VARCHAR(100),
  home_score INT,
  away_score INT,
  start_time VARCHAR(100)
);

SELECT * FROM Users.Events;