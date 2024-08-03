START TRANSACTION;

UPDATE Tweets SET dislike_count = dislike_count + 1 WHERE id = ?;

INSERT INTO Dislikes (user_id, post_id) VALUES (?, ?);

COMMIT;