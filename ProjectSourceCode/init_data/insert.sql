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
ON CONFLICT DO NOTHING;
-- Create a test user with a complete profile
-- The password will be the same as other test users in the system
-- Password: "test123" (same as alice, bob, etc.)
INSERT INTO users (
    username, 
    password, 
    email, 
    birthday, 
    country, 
    phone, 
    profile_photo_path, 
    bio, 
    display_name, 
    fitness_level, 
    visibility, 
    activities_completed_count
) VALUES (
    'testuser', 
    '$2a$10$GSWkXPYZ3Ky2GUlcJ9zGVumepyleDuVvuYeAEfSGeP3QysMXrELsa', 
    'testuser@example.com', 
    '1990-05-15', 
    'United States', 
    '555-123-4567', 
    NULL, 
    'Fitness enthusiast trying to stay active and improve my health. Love hiking on weekends and running with my dog on weekdays. Training for my first half-marathon this year!', 
    'TestRunner', 
    'intermediate', 
    'anyone', 
    8
);

-- Get user_id for our test user (this will fetch the correct ID regardless of existing users)
DO $$
DECLARE
    test_user_id INTEGER;
BEGIN
    SELECT user_id INTO test_user_id FROM users WHERE username = 'testuser';

    -- Create activity logs for test user (with varying dates for good testing)
    INSERT INTO activity_logs (
        user_id, 
        activity_type_id, 
        activity_date, 
        activity_time, 
        duration_minutes, 
        distance_mi, 
        notes
    ) VALUES
    -- Today
    (test_user_id, 1, CURRENT_DATE, '07:30:00', 45, 3.5, 'Morning run. Felt great today!'),
    -- Yesterday
    (test_user_id, 5, CURRENT_DATE - 1, '16:15:00', 60, 10.2, 'Evening bike ride along the river path.'),
    -- 2 days ago
    (test_user_id, 2, CURRENT_DATE - 2, '12:00:00', 30, 1.8, 'Lunchtime walk around the park.'),
    -- 3 days ago 
    (test_user_id, 3, CURRENT_DATE - 3, '09:45:00', 120, 5.3, 'Weekend hike at Boulder Creek. Beautiful weather!'),
    -- 5 days ago
    (test_user_id, 1, CURRENT_DATE - 5, '06:30:00', 35, 2.8, 'Morning run. Still working on increasing pace.'),
    -- 1 week ago
    (test_user_id, 4, CURRENT_DATE - 7, '14:00:00', 45, 0.8, 'Pool swim. Worked on technique.'),
    -- 10 days ago
    (test_user_id, 5, CURRENT_DATE - 10, '17:30:00', 75, 15.5, 'Long bike ride along mountain trails.'),
    -- 2 weeks ago
    (test_user_id, 6, CURRENT_DATE - 14, '10:00:00', 180, NULL, 'Great day snowboarding at Copper Mountain!');

    -- Create journal entries
    INSERT INTO journal_logs (
        user_id, 
        entry_date, 
        entry_time, 
        journal_entry
    ) VALUES
    (test_user_id, CURRENT_DATE, '08:30:00', 'Feeling motivated after my run today. Going to focus on nutrition this week to complement my training. Want to reach my goal of running a sub-50 minute 10K by the end of the month.'),
    (test_user_id, CURRENT_DATE - 3, '22:00:00', 'The hike today was challenging but worth it for the views! My fitness is definitely improving - I wasn''t nearly as tired as last time on this trail. Need to invest in better hiking boots though.'),
    (test_user_id, CURRENT_DATE - 7, '20:15:00', 'Swimming is still my weakest activity. Going to try to add one swim session per week to build endurance. The coach gave me some good tips on arm position that I need to practice.'),
    (test_user_id, CURRENT_DATE - 14, '19:30:00', 'What an amazing day on the slopes! First time snowboarding this season and I can tell my overall fitness has helped. Legs weren''t nearly as sore as usual. Planning another trip in two weeks.');

    -- Set up character customization
    INSERT INTO character_customizations (
        user_id,
        character_name,
        hat_choice,
        color_choice,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        'Runny',
        'propeller',
        'blue',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

    -- Add some achievements for the user
    INSERT INTO user_achievements (
        user_id,
        achievement_id,
        unlocked_at
    ) VALUES
    (test_user_id, 1, CURRENT_TIMESTAMP - INTERVAL '2 weeks'),  -- First Step achievement
    (test_user_id, 2, CURRENT_TIMESTAMP - INTERVAL '1 day');    -- Getting Started achievement (5 activities)

    -- Add some notifications
    INSERT INTO notifications (
        user_id,
        type,
        reference_id,
        title,
        message,
        is_read,
        created_at
    ) VALUES
    (test_user_id, 'ACHIEVEMENT', 2, 'Achievement Unlocked!', 'Getting Started: Complete 5 activities', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (test_user_id, 'SYSTEM', NULL, 'Welcome to GoPal!', 'Track your activities, customize your pal, and achieve your fitness goals!', TRUE, CURRENT_TIMESTAMP - INTERVAL '2 weeks');

    -- Add a friend connection
    INSERT INTO friends (
        user_id,
        friend_id,
        status,
        requested_at,
        accepted_at
    ) VALUES
    (test_user_id, 1, 'accepted', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '9 days');

END $$;
