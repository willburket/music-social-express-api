CREATE TABLE Dislikes (
    user_id INT,
    post_id INT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (post_id) REFERENCES Tweets(id)
);

SELECT * FROM Dislikes;