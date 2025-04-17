-- 
INSERT INTO users (username, password, email)
VALUES 
('alice', '$2a$10$WqFgxpgMB/DPZ2VHIpVrS.A4UOCxhcKnzFycusRoZ0IQzGW9X1jIy', 'alice@example.com'),
('bob', '$2a$10$WqFgxpgMB/DPZ2VHIpVrS.A4UOCxhcKnzFycusRoZ0IQzGW9X1jIy', 'bob@example.com'),
('charlie', '$2a$10$WqFgxpgMB/DPZ2VHIpVrS.A4UOCxhcKnzFycusRoZ0IQzGW9X1jIy', 'charlie@example.com'),
('david', '$2a$10$WqFgxpgMB/DPZ2VHIpVrS.A4UOCxhcKnzFycusRoZ0IQzGW9X1jIy', 'david@example.com');

INSERT INTO friends (user_id, friend_id, status)
VALUES 
(1, 2, 'pending'), -- Alice sent a request to Bob
(3, 1, 'pending'); -- Charlie sent a request to Alice

-- Accepted Friend Requests
INSERT INTO friends (user_id, friend_id, status, accepted_at)
VALUES 
(2, 3, 'accepted', NOW()), -- Bob and Charlie are friends
(4, 1, 'accepted', NOW()); -- David and Alice are friends

-- test to see activity
INSERT INTO activity_logs (user_id, activity_type_id, duration_minutes, distance_mi, notes)
VALUES (
  (SELECT user_id FROM users WHERE username = 'alice'),
  (SELECT activity_type_id FROM activity_types WHERE activity_name = 'Running'),
  45,
  5.2,
  'Morning run around the park'
);


--test achievement for alice
INSERT INTO user_achievements (user_id, achievement_id)
VALUES (
  (SELECT user_id FROM users WHERE username = 'alice'),
  (SELECT id FROM achievements WHERE code = 'COMPLETE_5_ACTIVITIES')
)
