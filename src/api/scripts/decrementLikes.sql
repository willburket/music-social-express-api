START TRANSACTION;

UPDATE Tweets SET like_count = like_count - 1 WHERE id = ?;

DELETE FROM Likes WHERE user_id = ? AND post_id = ?;

COMMIT;