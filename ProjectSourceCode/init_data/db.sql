-- 
INSERT INTO users (username, password, email)
VALUES 
('alice', 'Gr4ndP@!', 'alice@example.com'),
('bob', 'Gr4ndP@!', 'bob@example.com'),
('charlie', 'Gr4ndP@!', 'charlie@example.com'),
('david', 'Gr4ndP@!', 'david@example.com');

INSERT INTO friends (user_id, friend_id, status)
VALUES 
(1, 2, 'pending'), -- Alice sent a request to Bob
(3, 1, 'pending'); -- Charlie sent a request to Alice

-- Accepted Friend Requests
INSERT INTO friends (user_id, friend_id, status, accepted_at)
VALUES 
(2, 3, 'accepted', NOW()), -- Bob and Charlie are friends
(4, 1, 'accepted', NOW()); -- David and Alice are friends