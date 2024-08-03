CREATE TABLE Tweets (
	id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(15) NOT NULL,
    user_id INT NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content VARCHAR(280),
    like_count INT DEFAULT 0,
    dislike_count INT DEFAULT 0,
    retweet_count INT DEFAULT 0,
    reply BOOLEAN DEFAULT false, 
    reply_to INT NULL,
    FOREIGN KEY (reply_to) REFERENCES Tweets(id),
    FOREIGN KEY (username) REFERENCES Users(username),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

DELETE FROM Tweets
WHERE id = 25;

SELECT * FROM Tweets;