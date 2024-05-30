CREATE TABLE Followers (
    follower_id INT,
    followee_id INT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followee_id),
    FOREIGN KEY (follower_id) REFERENCES Users(id),
    FOREIGN KEY (followee_id) REFERENCES Users(id)
);

SELECT * FROM Followers;

DELETE FROM Followers
WHERE follower_id = 51;
