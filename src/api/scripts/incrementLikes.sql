START TRANSACTION;

UPDATE Tweets SET like_count = like_count + 1 WHERE id = ?;

INSERT INTO Likes (user_id, post_id) VALUES (?, ?);

COMMIT;