START TRANSACTION;

UPDATE Tweets SET dislike_count = dislike_count - 1 WHERE id = ?;

DELETE FROM Dislikes WHERE user_id = ? AND post_id = ?;

COMMIT;