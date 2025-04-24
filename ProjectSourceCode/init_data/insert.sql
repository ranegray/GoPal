-- Insert 25 users with the same hashed password ('password123')
-- The hash '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO' is for 'password123'
INSERT INTO users (username, password, email, birthday, country, phone, bio, display_name, fitness_level, visibility, activities_completed_count)
VALUES 
  ('alice', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'alice@example.com', '1990-03-15', 'United States', '555-123-4567', 'Fitness enthusiast and yoga instructor', 'Alice W.', 'advanced', 'anyone', 15),
  ('bob', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'bob@example.com', '1988-07-22', 'Canada', '555-234-5678', 'Marathon runner and outdoor sports fan', 'Bobby', 'advanced', 'anyone', 22),
  ('charlie', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'charlie@example.com', '1995-11-08', 'United Kingdom', '555-345-6789', 'Beginner trying to establish a fitness routine', 'Charles', 'beginner', 'friends', 8),
  ('david', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'david@example.com', '1992-05-30', 'Australia', '555-456-7890', 'Cycling enthusiast and nature lover', 'Dave', 'intermediate', 'anyone', 17),
  ('emma', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'emma@example.com', '1993-09-12', 'United States', '555-567-8901', 'Yoga and meditation practitioner', 'Em', 'intermediate', 'friends', 12),
  ('frank', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'frank@example.com', '1987-02-25', 'Germany', '555-678-9012', 'Weightlifter and nutrition enthusiast', 'Frankie', 'advanced', 'anyone', 25),
  ('grace', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'grace@example.com', '1997-06-18', 'France', '555-789-0123', 'Ballet dancer exploring other fitness options', 'Gracie', 'intermediate', 'anyone', 14),
  ('henry', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'henry@example.com', '1985-10-05', 'Spain', '555-890-1234', 'Trail runner and mountain biking enthusiast', 'Hank', 'professional', 'anyone', 30),
  ('isabel', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'isabel@example.com', '1994-04-29', 'Italy', '555-901-2345', 'Former gymnast getting back into fitness', 'Izzy', 'intermediate', 'friends', 9),
  ('james', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'james@example.com', '1991-08-14', 'Japan', '555-012-3456', 'Basketball player and coach', 'Jimmy', 'advanced', 'anyone', 19),
  ('karen', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'karen@example.com', '1996-12-07', 'South Korea', '555-123-4567', 'Hiking and outdoor adventure lover', 'Kare', 'beginner', 'private', 4),
  ('liam', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'liam@example.com', '1989-01-23', 'Brazil', '555-234-5678', 'Soccer player and fitness coach', 'Li', 'professional', 'anyone', 27),
  ('mia', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'mia@example.com', '1993-05-10', 'Mexico', '555-345-6789', 'CrossFit enthusiast and personal trainer', 'Mimi', 'advanced', 'anyone', 21),
  ('noah', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'noah@example.com', '1990-09-28', 'Argentina', '555-456-7890', 'Swimmer and water sports lover', 'No', 'intermediate', 'friends', 11),
  ('olivia', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'olivia@example.com', '1994-03-17', 'Chile', '555-567-8901', 'Pilates instructor and wellness coach', 'Liv', 'advanced', 'anyone', 18),
  ('paul', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'paul@example.com', '1986-07-02', 'Peru', '555-678-9012', 'Tennis player and sports enthusiast', 'Pauly', 'intermediate', 'anyone', 13),
  ('quinn', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'quinn@example.com', '1998-11-19', 'Colombia', '555-789-0123', 'Beginner runner working on first 5K', 'Q', 'beginner', 'friends', 6),
  ('ryan', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'ryan@example.com', '1992-04-05', 'Ecuador', '555-890-1234', 'Rock climber and outdoor adventurer', 'Ry', 'advanced', 'anyone', 20),
  ('sophia', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'sophia@example.com', '1995-08-21', 'Venezuela', '555-901-2345', 'Dance fitness instructor and choreographer', 'Sophie', 'professional', 'anyone', 29),
  ('thomas', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'thomas@example.com', '1988-12-14', 'Bolivia', '555-012-3456', 'Bodybuilder and protein shake enthusiast', 'Tommy', 'advanced', 'friends', 23),
  ('ursula', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'ursula@example.com', '1997-02-09', 'Paraguay', '555-123-4567', 'Yoga beginner exploring different styles', 'Ursa', 'beginner', 'private', 3),
  ('victor', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'victor@example.com', '1990-06-26', 'Uruguay', '555-234-5678', 'Marathon runner and endurance athlete', 'Vic', 'professional', 'anyone', 31),
  ('wendy', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'wendy@example.com', '1993-10-11', 'Guyana', '555-345-6789', 'Spin class addict and cycling enthusiast', 'Wen', 'intermediate', 'friends', 16),
  ('xavier', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'xavier@example.com', '1986-01-30', 'Suriname', '555-456-7890', 'CrossFit competitor and coach', 'X', 'professional', 'anyone', 28),
  ('yara', '$2a$10$B.2nvyDtgtboCLZ/SN2Meusv/ahvSLA5QHn2bqCm/POaAjmsCTPsO', 'yara@example.com', '1994-05-15', 'French Guiana', '555-567-8901', 'Martial arts practitioner focusing on fitness', 'YaYa', 'advanced', 'anyone', 24);

-- Insert character customizations for users
INSERT INTO character_customizations (user_id, character_name, hat_choice, color_choice)
VALUES
  (1, 'Fitsy', 'crown', 'purple'),
  (2, 'RunBud', 'propeller', 'blue'),
  (3, 'Newbie', 'party', 'orange'),
  (4, 'RideOrDie', 'tophat', 'green'),
  (5, 'ZenZone', 'beanie', 'pink'),
  (6, 'IronFriend', 'crown', 'blue'),
  (7, 'Pirouette', 'party', 'pink'),
  (8, 'TrailBlazer', 'beanie', 'green'),
  (9, 'FlipFlop', 'propeller', 'orange'),
  (10, 'Hoopster', 'crown', 'blue'),
  (11, 'Trekkie', 'beanie', 'green'),
  (12, 'GoalKicker', 'party', 'blue'),
  (13, 'CrossFitCutie', 'propeller', 'orange'),
  (14, 'Aquaman', 'tophat', 'blue'),
  (15, 'CoreQueen', 'crown', 'pink'),
  (16, 'Smash', 'propeller', 'green'),
  (17, 'Runner5K', 'beanie', 'orange'),
  (18, 'Belayer', 'tophat', 'blue'),
  (19, 'DanceStar', 'party', 'pink'),
  (20, 'MuscleMan', 'crown', 'purple'),
  (21, 'Bendy', 'beanie', 'default'),
  (22, 'MileRunner', 'propeller', 'blue'),
  (23, 'SpinMaster', 'party', 'green'),
  (24, 'BarbellBro', 'tophat', 'purple'),
  (25, 'KickPunch', 'crown', 'red');

-- Insert activities for users (multiple per user)
-- Activity types: 1=Running, 2=Walking, 3=Hiking, 4=Swimming, 5=Cycling, 6=Skiing/Snowboarding
INSERT INTO activity_logs (user_id, activity_type_id, activity_date, activity_time, duration_minutes, distance_mi, notes)
VALUES
  -- Alice's activities
  (1, 1, CURRENT_DATE - INTERVAL '2 days', '08:30:00', 45, 3.5, 'Morning run, felt great!'),
  (1, 2, CURRENT_DATE - INTERVAL '5 days', '18:00:00', 30, 1.8, 'Evening walk with dog'),
  (1, 5, CURRENT_DATE - INTERVAL '1 day', '17:00:00', 60, 12.4, 'Long bike ride around the lake'),
  (1, 1, CURRENT_DATE - INTERVAL '8 days', '09:00:00', 50, 4.0, 'Weekend run'),
  (1, 2, CURRENT_DATE - INTERVAL '10 days', '12:30:00', 25, 1.5, 'Lunch walk'),
  (1, 5, CURRENT_DATE - INTERVAL '12 days', '16:00:00', 70, 15.0, 'Cycling session'),
  (1, 1, CURRENT_DATE - INTERVAL '15 days', '07:00:00', 40, 3.0, 'Early morning jog'),
  (1, 3, CURRENT_DATE - INTERVAL '18 days', '10:00:00', 90, 4.5, 'Park hike'),
  (1, 4, CURRENT_DATE - INTERVAL '20 days', '19:00:00', 35, 0.8, 'Quick swim'),
  (1, 2, CURRENT_DATE - INTERVAL '22 days', '18:00:00', 30, 1.7, 'Walk after dinner'),
  (1, 1, CURRENT_DATE - INTERVAL '25 days', '08:00:00', 55, 4.5, 'Tempo run'),
  (1, 5, CURRENT_DATE - INTERVAL '28 days', '17:30:00', 50, 11.0, 'Bike commute'),
  (1, 2, CURRENT_DATE - INTERVAL '30 days', '13:00:00', 20, 1.0, 'Short walk break'),
  
  -- Bob's activities
  (2, 1, CURRENT_DATE - INTERVAL '1 day', '06:00:00', 60, 6.2, 'Training for marathon'),
  (2, 1, CURRENT_DATE - INTERVAL '3 days', '06:30:00', 75, 7.5, 'Hill training - tough but rewarding'),
  (2, 5, CURRENT_DATE - INTERVAL '5 days', '16:00:00', 90, 18, 'Long weekend ride'),
  (2, 3, CURRENT_DATE - INTERVAL '7 days', '09:00:00', 120, 5.5, 'Mountain hike with great views'),
  (2, 1, CURRENT_DATE - INTERVAL '9 days', '07:00:00', 65, 6.8, 'Steady run'),
  (2, 5, CURRENT_DATE - INTERVAL '11 days', '15:00:00', 80, 16.5, 'Afternoon cycle'),
  (2, 1, CURRENT_DATE - INTERVAL '14 days', '06:30:00', 70, 7.0, 'Morning marathon pace run'),
  (2, 3, CURRENT_DATE - INTERVAL '17 days', '10:30:00', 100, 5.0, 'Trail exploration'),
  (2, 2, CURRENT_DATE - INTERVAL '19 days', '19:00:00', 40, 2.0, 'Recovery walk'),
  (2, 1, CURRENT_DATE - INTERVAL '21 days', '06:00:00', 80, 8.0, 'Long interval run'),
  (2, 5, CURRENT_DATE - INTERVAL '24 days', '16:30:00', 100, 20.0, 'Extended bike ride'),
  (2, 1, CURRENT_DATE - INTERVAL '27 days', '07:00:00', 55, 5.8, 'Easy run'),
  (2, 3, CURRENT_DATE - INTERVAL '29 days', '09:30:00', 110, 5.2, 'Another hike'),
  (2, 2, CURRENT_DATE - INTERVAL '31 days', '18:30:00', 35, 1.9, 'Evening walk'),

  -- Charlie's activities
  (3, 2, CURRENT_DATE - INTERVAL '1 day', '12:00:00', 20, 1.2, 'Lunch break walk'),
  (3, 5, CURRENT_DATE - INTERVAL '4 days', '17:30:00', 30, 5, 'First time biking in months, taking it slow'),
  (3, 2, CURRENT_DATE - INTERVAL '6 days', '08:00:00', 25, 1.5, 'Morning walk'),
  (3, 1, CURRENT_DATE - INTERVAL '9 days', '18:00:00', 15, 0.8, 'Tried jogging'),
  (3, 2, CURRENT_DATE - INTERVAL '11 days', '12:15:00', 22, 1.3, 'Another lunch walk'),
  (3, 5, CURRENT_DATE - INTERVAL '13 days', '17:00:00', 35, 6.0, 'Getting more comfortable biking'),
  (3, 2, CURRENT_DATE - INTERVAL '16 days', '19:00:00', 30, 1.8, 'Evening stroll'),
  (3, 1, CURRENT_DATE - INTERVAL '19 days', '07:30:00', 20, 1.0, 'Short morning jog attempt'),
  (3, 2, CURRENT_DATE - INTERVAL '22 days', '08:30:00', 28, 1.6, 'Weekend walk'),
  (3, 5, CURRENT_DATE - INTERVAL '25 days', '16:30:00', 40, 7.5, 'Longer bike ride'),
  (3, 2, CURRENT_DATE - INTERVAL '28 days', '12:00:00', 18, 1.1, 'Quick walk'),
  (3, 1, CURRENT_DATE - INTERVAL '30 days', '18:30:00', 25, 1.2, 'Jogging again, felt better'),

  -- David's activities
  (4, 5, CURRENT_DATE - INTERVAL '1 day', '07:00:00', 45, 10, 'Morning ride before work'),
  (4, 5, CURRENT_DATE - INTERVAL '3 days', '07:30:00', 60, 13.5, 'Beautiful sunrise ride'),
  (4, 3, CURRENT_DATE - INTERVAL '6 days', '10:00:00', 150, 7, 'Weekend hike on new trail'),
  (4, 5, CURRENT_DATE - INTERVAL '8 days', '18:00:00', 50, 11.5, 'Evening cycle'),
  (4, 3, CURRENT_DATE - INTERVAL '10 days', '09:00:00', 130, 6.5, 'Another trail hike'),
  (4, 5, CURRENT_DATE - INTERVAL '12 days', '07:00:00', 55, 12.0, 'Consistent morning ride'),
  (4, 1, CURRENT_DATE - INTERVAL '15 days', '17:30:00', 30, 2.5, 'Quick run'),
  (4, 5, CURRENT_DATE - INTERVAL '17 days', '06:30:00', 65, 14.0, 'Longer sunrise ride'),
  (4, 3, CURRENT_DATE - INTERVAL '20 days', '11:00:00', 160, 7.5, 'Challenging hike'),
  (4, 5, CURRENT_DATE - INTERVAL '23 days', '18:30:00', 40, 9.0, 'Relaxing cycle'),
  (4, 2, CURRENT_DATE - INTERVAL '26 days', '12:00:00', 30, 1.8, 'Walk during lunch'),
  (4, 5, CURRENT_DATE - INTERVAL '29 days', '07:15:00', 50, 11.0, 'Pre-work ride'),

  -- Emma's activities
  (5, 2, CURRENT_DATE - INTERVAL '2 days', '07:00:00', 40, 2.5, 'Sunrise walk with meditation'),
  (5, 2, CURRENT_DATE - INTERVAL '4 days', '18:30:00', 35, 2.2, 'Evening stroll with podcast'),
  (5, 1, CURRENT_DATE - INTERVAL '7 days', '08:00:00', 30, 2.0, 'Light jog'),
  (5, 2, CURRENT_DATE - INTERVAL '9 days', '07:30:00', 45, 2.8, 'Morning meditation walk'),
  (5, 3, CURRENT_DATE - INTERVAL '12 days', '10:00:00', 70, 3.0, 'Gentle hike'),
  (5, 2, CURRENT_DATE - INTERVAL '14 days', '19:00:00', 38, 2.4, 'Walk listening to music'),
  (5, 1, CURRENT_DATE - INTERVAL '17 days', '08:30:00', 35, 2.3, 'Jog in the park'),
  (5, 2, CURRENT_DATE - INTERVAL '20 days', '07:00:00', 42, 2.6, 'Sunrise walk again'),
  (5, 4, CURRENT_DATE - INTERVAL '23 days', '16:00:00', 40, 0.9, 'Relaxing swim'),
  (5, 2, CURRENT_DATE - INTERVAL '26 days', '18:00:00', 33, 2.1, 'Post-work walk'),
  (5, 1, CURRENT_DATE - INTERVAL '29 days', '08:15:00', 32, 2.1, 'Morning jog'),
  (5, 2, CURRENT_DATE - INTERVAL '31 days', '12:30:00', 25, 1.5, 'Mindful walk'),

  -- Frank's activities
  (6, 1, CURRENT_DATE - INTERVAL '2 days', '06:30:00', 35, 4, 'Interval training'),
  (6, 1, CURRENT_DATE - INTERVAL '4 days', '06:30:00', 35, 4, 'Tempo run'),
  (6, 1, CURRENT_DATE - INTERVAL '6 days', '08:00:00', 70, 8, 'Long run weekend'),
  (6, 5, CURRENT_DATE - INTERVAL '9 days', '17:00:00', 60, 14.0, 'Cycling for cross-training'),
  (6, 1, CURRENT_DATE - INTERVAL '11 days', '06:00:00', 40, 4.5, 'Easy run'),
  (6, 1, CURRENT_DATE - INTERVAL '13 days', '06:30:00', 38, 4.2, 'Hill repeats'),
  (6, 2, CURRENT_DATE - INTERVAL '16 days', '19:00:00', 45, 2.5, 'Active recovery walk'),
  (6, 1, CURRENT_DATE - INTERVAL '18 days', '07:00:00', 75, 8.5, 'Weekend long run'),
  (6, 5, CURRENT_DATE - INTERVAL '21 days', '16:30:00', 65, 15.0, 'Another bike ride'),
  (6, 1, CURRENT_DATE - INTERVAL '24 days', '06:30:00', 36, 4.1, 'Morning interval session'),
  (6, 1, CURRENT_DATE - INTERVAL '27 days', '06:30:00', 37, 4.1, 'Consistent tempo'),
  (6, 2, CURRENT_DATE - INTERVAL '30 days', '18:00:00', 40, 2.2, 'Evening walk'),

  -- Grace's activities
  (7, 2, CURRENT_DATE - INTERVAL '1 day', '19:00:00', 40, 2.5, 'Evening walk in park'),
  (7, 4, CURRENT_DATE - INTERVAL '5 days', '16:00:00', 45, 1, 'Lap swimming practice'),
  (7, 1, CURRENT_DATE - INTERVAL '8 days', '08:00:00', 35, 2.8, 'Trying out running'),
  (7, 2, CURRENT_DATE - INTERVAL '10 days', '18:30:00', 42, 2.6, 'Walk by the river'),
  (7, 4, CURRENT_DATE - INTERVAL '13 days', '15:30:00', 50, 1.1, 'Longer swim session'),
  (7, 5, CURRENT_DATE - INTERVAL '16 days', '17:00:00', 40, 8.0, 'Casual bike ride'),
  (7, 2, CURRENT_DATE - INTERVAL '19 days', '19:30:00', 38, 2.4, 'Night walk'),
  (7, 1, CURRENT_DATE - INTERVAL '22 days', '08:30:00', 40, 3.0, 'Running again, felt good'),
  (7, 4, CURRENT_DATE - INTERVAL '25 days', '16:00:00', 48, 1.0, 'Swimming drills'),
  (7, 2, CURRENT_DATE - INTERVAL '28 days', '18:00:00', 40, 2.5, 'Park walk repeat'),
  (7, 5, CURRENT_DATE - INTERVAL '31 days', '10:00:00', 50, 10.0, 'Weekend cycling'),
  (7, 2, CURRENT_DATE - INTERVAL '33 days', '12:00:00', 30, 1.8, 'Lunch break walk'),
  
  -- Additional activities for other users
  (8, 3, CURRENT_DATE - INTERVAL '3 days', '09:00:00', 180, 8.5, 'Challenging mountain trail'),
  (9, 2, CURRENT_DATE - INTERVAL '2 days', '12:30:00', 25, 1.5, 'Campus walk during lunch'),
  (10, 1, CURRENT_DATE - INTERVAL '1 day', '17:00:00', 30, 3, 'After work run'),
  (11, 3, CURRENT_DATE - INTERVAL '6 days', '08:00:00', 120, 4.5, 'Nature hike with birdwatching'),
  (12, 1, CURRENT_DATE - INTERVAL '2 days', '06:00:00', 45, 5, 'Morning run before coaching'),
  (13, 5, CURRENT_DATE - INTERVAL '4 days', '17:30:00', 50, 12, 'Evening ride with sprint intervals'),
  (14, 4, CURRENT_DATE - INTERVAL '3 days', '06:30:00', 45, 1.5, 'Morning swim session'),
  (15, 2, CURRENT_DATE - INTERVAL '1 day', '19:00:00', 30, 1.8, 'Sunset walk on beach'),
  (16, 1, CURRENT_DATE - INTERVAL '2 days', '16:30:00', 35, 3.5, 'Quick run after work'),
  (17, 1, CURRENT_DATE - INTERVAL '5 days', '07:00:00', 20, 1.5, 'Starting couch to 5K program'),
  (18, 3, CURRENT_DATE - INTERVAL '8 days', '09:30:00', 240, 6, 'Rock climbing approach hike'),
  (19, 2, CURRENT_DATE - INTERVAL '3 days', '16:00:00', 45, 2.8, 'Dance choreography practice walk'),
  (20, 1, CURRENT_DATE - INTERVAL '4 days', '06:00:00', 30, 3, 'Morning cardio session'),
  (21, 2, CURRENT_DATE - INTERVAL '2 days', '18:30:00', 25, 1.5, 'Walking to yoga class'),
  (22, 1, CURRENT_DATE - INTERVAL '1 day', '05:30:00', 90, 10, 'Marathon training long run'),
  (23, 5, CURRENT_DATE - INTERVAL '3 days', '17:00:00', 60, 15, 'Post-work cycling session'),
  (24, 1, CURRENT_DATE - INTERVAL '2 days', '06:30:00', 45, 5.5, 'Fasted morning cardio'),
  (25, 2, CURRENT_DATE - INTERVAL '4 days', '19:00:00', 35, 2, 'Active recovery walk');

-- Insert journal entries for users
INSERT INTO journal_logs (user_id, entry_date, entry_time, journal_title, journal_entry)
VALUES
  (1, CURRENT_DATE - INTERVAL '2 days', '21:00:00', 'Feeling Great Today', 'Had a fantastic run this morning. I can feel my endurance improving. Going to try for 4 miles next time!'),
  (1, CURRENT_DATE - INTERVAL '6 days', '22:00:00', 'Stretching Focus', 'Need to focus more on stretching before and after workouts. My hamstrings have been tight lately.'),
  (1, CURRENT_DATE - INTERVAL '10 days', '20:15:00', 'Nutrition and Performance', 'I''ve been tracking my nutrition more carefully this week and definitely notice a difference in my energy levels during workouts. After experimenting with different pre-workout meals, I''ve found that having a banana and some peanut butter about 30 minutes before exercising gives me sustained energy without feeling too full. Post-workout, I''ve been making protein smoothies with spinach, frozen berries, protein powder, and almond milk. My recovery seems to be improving, and I''m not as sore the next day. Going to continue refining my nutrition plan as I increase my training volume.'),
  (1, CURRENT_DATE - INTERVAL '15 days', '21:30:00', 'Finding My Why', 'I''ve been reflecting on my fitness journey and why I started in the first place. Initially, I just wanted to get in better shape, but now I realize it''s become about so much more. The mental clarity I get after a good workout is incredible - it helps me manage stress and improves my focus for the rest of the day. I love the sense of accomplishment when I hit a new goal, and I''m starting to appreciate the discipline that consistent training builds in other areas of my life. Looking back at my progress over the past few months makes me proud and motivated to keep going. My next goal is to sign up for that 10K in the spring - something I never would have considered before!'),
  (1, CURRENT_DATE - INTERVAL '21 days', '19:45:00', 'Cross-Training Benefits', 'Today was my third cycling session this week, and I''m really enjoying adding variety to my routine. Running has always been my primary exercise, but cross-training with cycling is helping me work different muscle groups and giving my joints a break from the impact. I noticed that my cardiovascular endurance transfers well between activities, but cycling requires a different kind of leg strength. The scenery on the lake trail was beautiful and made the 12 miles fly by. I''m thinking about adding swimming to my routine next month for a more complete cross-training program. Being outdoors and connecting with nature while exercising has become an important part of my routine - it transforms the workout from something I "have to do" into something I genuinely look forward to.'),
  (1, CURRENT_DATE - INTERVAL '28 days', '22:00:00', 'Overcoming Plateaus', 'After feeling stuck at the same performance level for almost three weeks, I finally broke through my plateau today! I''ve been frustrated with my 5K time hovering around the same mark despite consistent training. Instead of getting discouraged, I researched different training techniques and decided to incorporate interval training twice a week. Today was my fourth interval session, and I can already see improvements in my pace and endurance. I alternated between 1 minute at 85% effort and 2 minutes of active recovery for a total of 8 rounds, followed by a cool-down jog. It was challenging but exhilarating to push my limits. I also started using the breathing techniques I learned from that podcast, focusing on deeper belly breathing rather than shallow chest breathing. The combination seems to be working, and I''m excited to see how much I can improve with this new approach. Lesson learned: when you hit a plateau, change something in your routine rather than giving up!'),
  
  (2, CURRENT_DATE - INTERVAL '1 day', '20:30:00', 'Marathon Progress', 'Marathon training is going well. Today''s 10K was my best time yet. Need to work on nutrition for longer runs.'),
  (2, CURRENT_DATE - INTERVAL '7 days', '21:00:00', 'Recovery Thoughts', 'Recovery days are just as important as training days. Taking it easy tomorrow after today''s tough hike.'),
  
  (3, CURRENT_DATE - INTERVAL '3 days', '19:45:00', 'Walking Journey', 'Starting to enjoy these regular walks. Not as intimidating as running and still feeling the benefits.'),
  
  (4, CURRENT_DATE - INTERVAL '2 days', '22:00:00', 'New Cycling Route', 'New cycling route today was amazing. Found a great coffee shop at the halfway point for future rides.'),
  
  (5, CURRENT_DATE - INTERVAL '4 days', '20:00:00', 'Meditation Benefits', 'Finding that walking meditation is really helping with my stress levels. Will continue to incorporate it.'),
  
  (6, CURRENT_DATE - INTERVAL '3 days', '21:30:00', 'New PR!', 'Hit a new PR on my 5K today! All the interval training is paying off. Will celebrate with a protein-packed dinner.'),
  
  (7, CURRENT_DATE - INTERVAL '1 day', '22:15:00', 'Back to Swimming', 'Swimming felt great after so long. Need to work on my breathing technique though.'),
  
  (8, CURRENT_DATE - INTERVAL '3 days', '21:00:00', 'Mountain Adventure', 'The mountain trail today was challenging but worth every step. The views at the summit were breathtaking.'),
  
  (9, CURRENT_DATE - INTERVAL '5 days', '19:30:00', 'Starting Fresh', 'Getting back into fitness slowly. Today''s campus walk was a good start. Going to try adding some light jogging next week.'),
  
  (10, CURRENT_DATE - INTERVAL '2 days', '20:45:00', 'Basketball Training', 'Basketball drills are improving my cardio more than I expected. Going to incorporate more sport-specific workouts.'),
  
  (12, CURRENT_DATE - INTERVAL '4 days', '21:15:00', 'Coaching Ideas', 'Team looked good today. My own run this morning gave me some ideas for drills to implement with the squad.'),
  
  (14, CURRENT_DATE - INTERVAL '3 days', '19:00:00', 'Swimming Progress', 'New swimming technique is more efficient. Cut 2 minutes off my mile time today. Will continue focusing on form.'),
  
  (17, CURRENT_DATE - INTERVAL '6 days', '20:00:00', 'C25K Week 1 Done!', 'Week 1 of Couch to 5K complete! Feeling proud of myself for sticking with it even when it got tough.'),
  
  (22, CURRENT_DATE - INTERVAL '1 day', '19:30:00', 'Marathon Training Update', 'Marathon training: 16 weeks to go. Today''s long run felt good, need to test out new energy gels next weekend.');

-- Insert achievements for users
INSERT INTO user_achievements (user_id, achievement_id)
VALUES
  -- Achievement 1: Complete first activity
  (1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1), (10, 1),
  (11, 1), (12, 1), (13, 1), (14, 1), (15, 1), (16, 1), (17, 1), (18, 1), (19, 1), (20, 1),
  (21, 1), (22, 1), (23, 1), (24, 1), (25, 1),
  
  -- Achievement 2: Complete 5 activities
  (1, 2), (2, 2), (4, 2), (6, 2), (8, 2), (10, 2), (12, 2), (13, 2), (15, 2),
  (18, 2), (19, 2), (20, 2), (22, 2), (24, 2), (25, 2),
  
  -- Achievement 3: Complete 10 activities
  (1, 3), (2, 3), (4, 3), (6, 3), (8, 3), (12, 3), (13, 3), (15, 3), (22, 3);

-- Insert notifications for users
INSERT INTO notifications (user_id, type, reference_id, title, message, is_read)
VALUES
  (1, 'ACHIEVEMENT', 3, 'Achievement Unlocked!', 'Activity Enthusiast: Complete 10 activities', FALSE),
  (1, 'FRIEND_REQUEST', 3, 'New Friend Request', 'Charlie wants to be your friend', FALSE),
  (1, 'FRIEND_REQUEST', 5, 'New Friend Request', 'Emma wants to be your friend', FALSE),
  
  (2, 'ACHIEVEMENT', 3, 'Achievement Unlocked!', 'Activity Enthusiast: Complete 10 activities', TRUE),
  (2, 'FRIEND_REQUEST', 6, 'New Friend Request', 'Frank wants to be your friend', FALSE),
  
  (3, 'ACHIEVEMENT', 1, 'Achievement Unlocked!', 'First Step: Complete your first activity', TRUE),
  (3, 'FRIEND_ACCEPTED', 2, 'Friend Request Accepted', 'Bob accepted your friend request', FALSE),
  
  (4, 'ACHIEVEMENT', 3, 'Achievement Unlocked!', 'Activity Enthusiast: Complete 10 activities', FALSE),
  (4, 'FRIEND_REQUEST', 8, 'New Friend Request', 'Henry wants to be your friend', FALSE),
  
  (5, 'ACHIEVEMENT', 2, 'Achievement Unlocked!', 'Getting Started: Complete 5 activities', TRUE),
  
  (6, 'ACHIEVEMENT', 3, 'Achievement Unlocked!', 'Activity Enthusiast: Complete 10 activities', FALSE);

-- Insert friend relationships (both pending and accepted)
INSERT INTO friends (user_id, friend_id, status)
VALUES 
  -- Pending requests
  (3, 1, 'pending'), -- Charlie wants to be friends with Alice
  (5, 1, 'pending'), -- Emma wants to be friends with Alice
  (6, 2, 'pending'), -- Frank wants to be friends with Bob
  (8, 4, 'pending'), -- Henry wants to be friends with David
  (10, 9, 'pending'), -- James wants to be friends with Isabel
  (13, 12, 'pending'), -- Mia wants to be friends with Liam
  (15, 14, 'pending'), -- Olivia wants to be friends with Noah
  (17, 16, 'pending'), -- Quinn wants to be friends with Paul
  (19, 18, 'pending'), -- Sophia wants to be friends with Ryan
  (21, 20, 'pending'), -- Ursula wants to be friends with Thomas
  (23, 22, 'pending'), -- Wendy wants to be friends with Victor
  (25, 24, 'pending'); -- Yara wants to be friends with Xavier

-- Insert accepted friend relationships
INSERT INTO friends (user_id, friend_id, status, accepted_at)
VALUES 
  -- Accepted requests
  (1, 4, 'accepted', NOW() - INTERVAL '10 days'), -- Alice and David are friends
  (2, 3, 'accepted', NOW() - INTERVAL '15 days'), -- Bob and Charlie are friends
  (5, 6, 'accepted', NOW() - INTERVAL '7 days'), -- Emma and Frank are friends
  (7, 8, 'accepted', NOW() - INTERVAL '20 days'), -- Grace and Henry are friends
  (9, 10, 'accepted', NOW() - INTERVAL '5 days'), -- Isabel and James are friends
  (11, 12, 'accepted', NOW() - INTERVAL '12 days'), -- Karen and Liam are friends
  (13, 14, 'accepted', NOW() - INTERVAL '8 days'), -- Mia and Noah are friends
  (15, 16, 'accepted', NOW() - INTERVAL '6 days'), -- Olivia and Paul are friends
  (17, 18, 'accepted', NOW() - INTERVAL '18 days'), -- Quinn and Ryan are friends
  (19, 20, 'accepted', NOW() - INTERVAL '14 days'), -- Sophia and Thomas are friends
  (21, 22, 'accepted', NOW() - INTERVAL '3 days'), -- Ursula and Victor are friends
  (23, 24, 'accepted', NOW() - INTERVAL '9 days'); -- Wendy and Xavier are friends

-- Insert comments on activities to make the social feed look lively
INSERT INTO activity_comments (activity_id, user_id, comment_text, created_at)
VALUES
  -- Comments on Alice's activities
  (1, 2, 'Looking strong, Alice! That morning run looks amazing! 🏃‍♀️', NOW() - INTERVAL '1 day'),
  (1, 3, 'Your consistency is so inspiring. Any tips for a beginner?', NOW() - INTERVAL '12 hours'),
  (1, 5, 'Love that route by the lake! We should run together sometime!', NOW() - INTERVAL '6 hours'),
  (3, 2, 'That lake view is breathtaking! Is this the north shore trail?', NOW() - INTERVAL '18 hours'),
  
  -- Comments on Bob's activities
  (14, 1, 'Marathon training looking solid, Bob! Keep crushing it! 💪', NOW() - INTERVAL '20 hours'),
  (14, 5, 'Those hill repeats are paying off! Your pace is impressive!', NOW() - INTERVAL '10 hours'),
  (16, 3, 'This is the trail you told me about? Looks challenging but fun!', NOW() - INTERVAL '2 days'),
  
  -- Comments on Charlie's activities
  (28, 1, 'Great job on your consistency, Charlie! The hardest part is starting!', NOW() - INTERVAL '3 days'),
  (30, 2, 'Way to go on your first bike ride! The first mile is the hardest.', NOW() - INTERVAL '2 days'),
  (30, 5, 'Love seeing your progress! Have you tried the riverside path yet?', NOW() - INTERVAL '1 day'),
  
  -- Comments on Emma's activities
  (41, 1, 'Your mindfulness walks have inspired me to try it! So peaceful.', NOW() - INTERVAL '3 days'),
  (41, 2, 'That sunrise view is incredible! Is this the hilltop path?', NOW() - INTERVAL '2 days'),
  (43, 3, 'I need to try meditation with my walks too! You always look so zen!', NOW() - INTERVAL '15 hours'),
  (45, 1, 'How early do you have to go to catch that perfect morning light?', NOW() - INTERVAL '8 hours');
