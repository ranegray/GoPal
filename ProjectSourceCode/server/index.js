const express = require('express');
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session'); 
const FileStore = require('session-file-store')(session);
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { errors } = require('pg-promise');
const db = require('./db.js');
const fs = require("fs");

const { formatInTimeZone } = require('date-fns-tz');
const { getStatsForRange } = require("./utils/stat-utils.js");
const { getDateRange } = require("./utils/date-utils.js");
const { checkAndAwardAchievements } = require("./utils/achievement-utils.js");
const { createAchievementNotifications } = require("./utils/notification-utils.js");

const app = express();

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        const userId = req.session.user ? req.session.user.user_id : "unknown"; // Get user_id or fallback to "unknown"
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        cb(null, `${userId}_${timestamp}${extension}`); // Format: userId_timestamp.extension
    },
});
const upload = multer({ storage });

const hbs = handlebars.create({
  extname: "hbs",
  layoutsDir: path.join(__dirname, "../views/layouts"),
  partialsDir: path.join(__dirname, "../views/partials"),
  helpers: {
        eq: function (a, b) {
            return a === b;
        },
    formatDate: function (date) {
      return new Date(date).toLocaleDateString();
    },
    formatTime: function (time) {
      if (!time) return "";

      const timeParts = time.split(":");
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12; // Convert to 12-hour format

      return `${displayHours}:${minutes} ${ampm}`;
    },
    formatDuration: function (duration) {
      if (!duration) return "0h 0m";
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}h ${minutes}m`;
    },
    pluralize: function (count, singular, plural) {
      return count === 1 ? singular : plural;
    },
  },
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));
app.use(bodyParser.json());

app.use(
  session({
    store: new FileStore({
      path: './sessions',
      ttl: 86400, // 1 day in seconds
      logFn: function () {}, // Suppress logging
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
  })
);

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(express.static(path.join(__dirname, '..')));
app.use('/images', express.static(path.join(__dirname, '../extra_resources/images')));

//Authentication Middleware
const auth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

app.get('/login', (req, res) => {
    res.render('pages/login');
});

app.post('/login', async (req, res) => {
    try {
        var user = {};
        const email = req.body.email
        const username = req.body.username;
        user_data = await db.oneOrNone('select * from users where users.username = $1 LIMIT 1;', [username]);
        if (user_data) {
            user = user_data;
        } else {
            res.render('pages/login', { message: `Account with username does not exist` })
            return;
        }
        match = await bcrypt.compare(req.body.password, user_data.password);
        if (match) {
            req.session.user = user;
            req.session.save();
            res.redirect('/home')
            return;
        } else {
            res.render('pages/login', { message: `Incorrect Password` })
        }
    } catch (err) {
        console.error(err);
        res.render('pages/login')
    }
});

app.get('/register', (req, res) => {
    res.render('pages/register');
});

app.post('/register', async (req, res) => {
    try {
        const email = req.body.email
        const username = req.body.username;
        const hashed_password = await bcrypt.hash(req.body.password, 10);
        existing_username = await db.oneOrNone('select * from users where users.username = $1 LIMIT 1;', [username]);
        existing_email = await db.oneOrNone('select * from users where users.email = $1 LIMIT 1;', [email]);
        if (existing_username || existing_email) {
            res.render('pages/register',{message: "Username or email already registered"});
            return;
        }
        await db.none('INSERT INTO users(email, username, password) VALUES($1, $2, $3);', [email, username, hashed_password]);
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('pages/register');
    }
});

app.get('/',auth, (req, res) => {
    res.redirect('/home');
});

app.get('/logout', auth, (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
            }
            res.clearCookie('connect.sid', { path: '/' });
            res.redirect('/login');
        });
    } else {
        res.clearCookie('connect.sid', { path: '/' });
        res.redirect('/login');
    }
});

app.post('/delete-account', auth, async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        
        // Delete profile photo if it exists
        if (req.session.user.profile_photo_path) {
            const oldProfilePhotoFilePath = path.join(__dirname, "../", req.session.user.profile_photo_path);
            try {
                await fs.promises.unlink(oldProfilePhotoFilePath);
            } catch (err) {
                console.error("Error deleting profile photo:", err);
            }
        }
        
        // Delete user from database
        const query = `DELETE FROM users WHERE user_id = $1;`;
        await db.none(query, [userId]);
        
        // Destroy the session
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err);
            }
            res.redirect('/register');
        });
    } catch (err) {
        console.error('Error deleting user account:', err);
        res.render('pages/settings/account', { user: req.session.user });
    }
});

app.get('/home',auth, (req, res) => {
    const weatherTimeLimit = 5 * 60 * 1000; // 5 minutes in milliseconds
    const lastWeatherUpdate = req.session.weather?.timestamp || 0; 
    const timeSinceLastWeatherUpdate = Date.now() - lastWeatherUpdate; 
    if (!req.session.weather || timeSinceLastWeatherUpdate > weatherTimeLimit) { 
        //render w/o the weather data
        return res.render('pages/home', {user: req.session.user});
    } else{
        //render with the weather data
        res.render('pages/home', {
            user: req.session.user, 
            weather: req.session.weather.weather,
            airQuality: req.session.weather.airQuality
        });
    }
});

app.get('/activity', auth, async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      
      const activities = await db.any(
        `SELECT wl.*, at.activity_name 
        FROM activity_logs wl
        JOIN activity_types at ON wl.activity_type_id = at.activity_type_id
        WHERE wl.user_id = $1
        ORDER BY wl.activity_date DESC, wl.activity_time DESC, wl.created_at DESC`,
        [userId]
      );

      // Fetch user's unread notifications
      const notifications = await db.any(
        `SELECT * FROM notifications 
         WHERE user_id = $1 AND is_read = FALSE 
         ORDER BY created_at DESC LIMIT 10`,
        [userId]
        );

      // Can pass a string to getDateRange to get different ranges
      // For example: "week", "month", "year"
      const { startDate, endDate } = getDateRange("week");
      const stats = getStatsForRange(activities, startDate, endDate);
      
      res.render('pages/activity', { 
        activities: activities,
        user: req.session.user, 
        stats:  stats,
        notifications: notifications,
        hasNotifications: notifications.length > 0
      });
    } catch (err) {
      console.error('Error fetching activities:', err);
      res.render('pages/activity', { 
        activities: [],
        error: 'Error loading activities. Please try again.',
        user: req.session.user
      });
    }
  });

app.get("/settings/:tab?",auth, async (req, res) => {
    try{
        var user = {}
        const tab = req.params.tab;
        const allowedTabs = ["account", "profile", "pal-settings"];
        if (!tab){
            return res.redirect('/settings/account');
        }
        if (!allowedTabs.includes(tab)) {
            return res.status(404).send("Tab not found");
        }
        
        user = await db.one('SELECT * FROM users where user_id = $1;',[req.session.user.user_id]);
        if (user.birthday)
        {
            user.birthday = user.birthday.toISOString().split("T")[0];
        }
        res.render("pages/settings", { activeTab: tab, user: user });
    } catch(err) {
        console.error(err);
        res.render("pages/settings", { activeTab: 'account', user: req.session.user });
    }
});

app.get("/journal",auth, async (req, res) => {
    try{
        const userId = req.session.user.user_id;
        const journals = await db.any(
            `SELECT * FROM journal_logs
             WHERE user_id = $1
             ORDER BY entry_date DESC, entry_time DESC`,
             [userId]
        );
        
        const journalStats = require('./utils/stat-utils.js').getJournalStats(journals);

        res.render("pages/journal", {
            user: req.session.user, 
            journals: journals,
            journalStats: journalStats
        });
    } catch(err) {
        console.error(err);
        res.render("pages/journal", {user: req.session.user });
    }
});


app.post('/settings/account',auth, async (req, res) => {
    let messages = [];
    try {
        const { phone, email, birthday, country, username, password } = req.body;
        const userId = req.session.user.user_id;
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        const queryParams = [];
        const queryValues = [];
        const addQueryParam = (field, value) => {
            if (value) {
                queryParams.push(`${field} = $${queryParams.length + 1}`);
                queryValues.push(value);
            }
        };
        // Check for duplicate email and username
        let duplicateEmail, duplicateUsername;
        if (email) {
            duplicateEmail = await db.oneOrNone('SELECT * FROM users WHERE email = $1;', [email]);
            if (duplicateEmail) {
                messages.push({text: 'Email already in use', error: true});
            }
        }
        if (username) {
            duplicateUsername = await db.oneOrNone('SELECT * FROM users WHERE username = $1;', [username]);
            if (duplicateUsername) {
                messages.push({text: 'Username already in use', error: true});
            }
        }
        // Validate password
        let invalidPassword = false;
        if (password) {
            const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#?!@$%^&*\-]).{8,}$/;
            if (!passwordRegex.test(password)) {
                messages.push({text: 'Invalid Password (8+ Characters, 1 Special, 1 Lowercase, 1 Uppercase, 1 Digit)', error: true});
                invalidPassword = true;
            }
        }
        // Add valid fields to query params
        addQueryParam('phone', phone);
        addQueryParam('email', email && !duplicateEmail ? email : null);
        addQueryParam('birthday', birthday);
        addQueryParam('country', country);
        addQueryParam('username', username && !duplicateUsername ? username : null);
        addQueryParam('password', password && !invalidPassword ? hashedPassword : null);
        if (queryParams.length > 0) {
            const query = `UPDATE users SET ${queryParams.join(', ')} WHERE user_id = $${queryParams.length + 1}`;
            queryValues.push(userId);
            await db.none(query, queryValues);
            messages.push({text: 'Account settings updated successfully', error: false});
        }
        const user = await db.one('SELECT * FROM users WHERE user_id = $1;', [userId]);
        if (user.birthday) {
            user.birthday = user.birthday.toISOString().split('T')[0];
        }
        req.session.user = user;
        res.render('pages/settings', { activeTab: 'account', message: messages, user: req.session.user });
    } catch (err) {
        console.error(err);
        res.render('pages/settings', { activeTab: 'account', message: messages, user: req.session.user });
    }
});

app.post('/settings/profile',auth, upload.single('profilePicture'), async (req, res) => {
    let messages = [];
    try {
        const {fitnessLevel, displayName, profileVisibility, userBio} = req.body;
        const userId = req.session.user.user_id;
        const oldProfilePhotoFilePath = path.join(__dirname,"../" + req.session.user.profile_photo_path);
        const newProfilePhotoFilePath = req.file ? `/uploads/${req.file.filename}` : null;

        //Delete the old profile photo: if it exists and the user is uploading a new one
        if (req.session.user.profile_photo_path && newProfilePhotoFilePath) {
            try {
                await fs.promises.unlink(oldProfilePhotoFilePath);
            } catch (err) {
                console.error("Error deleting file:", err);
            }
        }

        //Helper function for adding fields to the query
        const queryParams = [];
        const queryValues = [];
        const addQueryParam = (field, value) => {
            if (value && !(req.session.user[field] == value)) {
                queryParams.push(`${field} = $${queryParams.length + 1}`);
                queryValues.push(value);
            }
        };

        // Add fields to query params
        addQueryParam('profile_photo_path', newProfilePhotoFilePath);
        addQueryParam('display_name', displayName);
        addQueryParam('visibility', profileVisibility);
        addQueryParam('fitness_level', fitnessLevel);
        addQueryParam('bio', userBio);
        
        if (queryParams.length > 0) {
            const query = `UPDATE users SET ${queryParams.join(', ')} WHERE user_id = $${queryParams.length + 1}`;
            queryValues.push(userId);
            await db.none(query, queryValues);
            messages.push({text: 'Profile settings updated successfully', error: false});
        }
        
        const user = await db.one('SELECT * FROM users WHERE user_id = $1;', [userId]);
        req.session.user = user;
        
        res.render('pages/settings', { activeTab: 'profile', message: messages, user: req.session.user });
    } catch (err) {
        console.error(err);
        res.render('pages/settings', { activeTab: 'profile', message: messages, user: req.session.user });
    }
});

// Submit a new activity
app.post('/api/activities', auth, async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const { 
            'activity-type': activityTypeName, 
            'activity-duration': durationMinutes, 
            'activity-distance': distanceMi, 
            'activity-date': activityDate,
            'activity-time': activityTime,
            'activity-notes': notes 
        } = req.body;
        
        // Get activity type ID from name
        const activityType = await db.oneOrNone('SELECT activity_type_id FROM activity_types WHERE activity_name ILIKE $1', [activityTypeName]);
        
        if (!activityType) {
            return res.status(400).redirect('/activity?error=Invalid activity type');
        }
        
        const activityTypeId = activityType.activity_type_id;
        
        // Use current date if no date provided
        const date = activityDate || new Date().toISOString().split('T')[0];
        
        // Use current time if no time provided
        const time = activityTime || new Date().toTimeString().split(' ')[0];

        // Insert the activity log
        await db.none(
            `INSERT INTO activity_logs 
            (user_id, activity_type_id, activity_date, activity_time, duration_minutes, distance_mi, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [userId, activityTypeId, date, time, durationMinutes, distanceMi, notes]
        );

        // TODO: Add success message once an activity is added

        const updateRes = await db.oneOrNone(
          'UPDATE users SET activities_completed_count = activities_completed_count + 1 WHERE user_id = $1 RETURNING activities_completed_count',
          [userId]
      );

      console.log(`User ${userId} activity count updated to: ${updateRes.activities_completed_count}`);

      const newlyUnlocked = await checkAndAwardAchievements(userId);
      
      if (newlyUnlocked.length > 0) {
        console.log(
          `User ${userId} unlocked achievements: ${newlyUnlocked.join(", ")}`
        );
        await createAchievementNotifications(userId, newlyUnlocked);
      }

        return res.redirect('/activity');
    } catch (err) {
        console.error('Error adding activity:', err);
        return res.redirect('/activity?error=Failed to add activity');
    }
});

// Journal entry api
app.post('/api/journal', auth, async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const { 'journal-entry': journalEntry } = req.body;
      const { 'journal-title': journalTitle } = req.body;
  
      // Validate that a journal entry was provided
      if (!journalEntry || !journalTitle) {
        console.error('No journal entry provided');
        return res.status(400).redirect('/journal');
      }

      // Set the timezone to MST (need api to get local timezone, maybe later)
      const mountainTimeZone = 'America/Denver'; 
      const now = new Date();
      
      const currentDate = formatInTimeZone(now, mountainTimeZone, 'yyyy-MM-dd');
      const currentTime = formatInTimeZone(now, mountainTimeZone, 'HH:mm:ss');
  
      // Insert the journal entry into the journal_logs table
      await db.none(
        `INSERT INTO journal_logs (user_id, journal_entry, entry_date, entry_time, journal_title) VALUES ($1, $2, $3, $4, $5)`,
        [userId, journalEntry, currentDate, currentTime, journalTitle]
      );
  
      return res.status(201).redirect('/journal');

    } catch (err) {
      console.error('Error logging journal entry:', err);
      return res.status(500).redirect('/journal');
    }
  });



// Delete an activity
app.post('/api/activities/:id', auth, async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const activityId = req.params.id;
      
      // Ensure the activity belongs to the user
      const activity = await db.oneOrNone(
        'SELECT * FROM activity_logs WHERE activity_id = $1 AND user_id = $2',
        [activityId, userId]
      );
      
      if (!activity) {
        return res.status(404).redirect('/activity?error=Activity not found');
      }
      
      await db.none('DELETE FROM activity_logs WHERE activity_id = $1', [activityId]);
      
      // Redirect back to activities page
      res.redirect('/activity?success=Activity deleted');
    } catch (err) {
      console.error('Error deleting activity:', err);
      res.redirect('/activity?error=Error deleting activity');
    }
  });

// Add endpoints to fetch notifications
app.get('/api/notifications', auth, async (req, res) => {
  try {
      const userId = req.session.user.user_id;
      const notifications = await db.any(
          'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
          [userId]
      );
      res.json(notifications);
  } catch (err) {
      console.error('Error fetching notifications:', err);
      res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notifications as read
app.post('/api/notifications/read', auth, async (req, res) => {
  try {
      const userId = req.session.user.user_id;
      const { id } = req.body;
      
      if (id) {
          await db.none('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [id, userId]);
      } else {
          await db.none('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [userId]);
      }
      
      res.json({ success: true });
  } catch (err) {
      console.error('Error marking notifications read:', err);
      res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Endpoint for testing testing framework
app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });

app.post('/api/friends/request', auth, async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const { friendUsername } = req.body;

        // Find the friend ID from the username
        const friend = await db.oneOrNone('SELECT user_id FROM users WHERE username = $1', [friendUsername]);

        if (!friend) {
            return res.status(404).json({ error: 'User not found' });
        }

        const friendId = friend.user_id;

        // Check if the request already exists or if they are already friends
        const existingRequest = await db.oneOrNone(`
            SELECT * FROM friends 
            WHERE (user_id = $1 AND friend_id = $2) 
               OR (user_id = $2 AND friend_id = $1)`,
            [userId, friendId]);

        if (existingRequest) {
            return res.status(400).json({ error: 'Friend request already exists or users are already friends' });
        }

        // Insert the friend request
        await db.none(`
            INSERT INTO friends (user_id, friend_id, status) 
            VALUES ($1, $2, 'pending')`,
            [userId, friendId]);

        return res.json({ success: true, message: 'Friend request sent' });
    } catch (err) {
        console.error('Error sending friend request:', err);
        return res.status(500).json({ error: 'Failed to send friend request' });
    }
});

app.get('/social/recent', auth, async (req, res) => {
    try {
        const { user_id } = req.session.user;
        const tab = 'recent';
        

        // Fetch the user from the database
        const user = await db.one('SELECT * FROM users WHERE user_id = $1;', [user_id]);

        // Get the list of friend IDs where the friendship is accepted
        const friends = await db.any(`
            SELECT friend_id AS id FROM friends 
            WHERE user_id = $1 AND status = 'accepted'
            UNION
            SELECT user_id AS id FROM friends 
            WHERE friend_id = $1 AND status = 'accepted'
        `, [user_id]);

        // Extract friend IDs from result
        const friendIds = friends.map(friend => friend.id);

        let activities = [];
        let achievements = [];

        if (friends.length > 0) {
            // Fetch recent activities from friends
            activities = await db.any(`
                SELECT al.activity_id, al.user_id, u.username, u.profile_photo_path, al.activity_type_id, at.activity_name, al.activity_date, al.activity_time, al.duration_minutes, al.distance_mi, al.notes
                FROM activity_logs al
                JOIN users u ON al.user_id = u.user_id
                JOIN activity_types at ON al.activity_type_id = at.activity_type_id
                WHERE al.user_id IN ($1:csv)
                ORDER BY al.created_at DESC
                LIMIT 5
            `, [friendIds]);

            achievements = await db.any(`
                SELECT 
                    ua.user_id,
                    u.username,
                    u.profile_photo_path,
                    a.name AS achievement_name,
                    a.description,
                    a.code,
                    ua.unlocked_at
                FROM user_achievements ua
                JOIN users u ON ua.user_id = u.user_id
                JOIN achievements a ON ua.achievement_id = a.id
                WHERE ua.user_id IN ($1:csv)
                ORDER BY ua.unlocked_at DESC
                LIMIT 5;
        `, [friendIds]);
        }

        res.render("pages/social", { activeTab: tab, user, activities, achievements});
    } catch (err) {
        console.error('Error fetching friend activities:', err);
        return res.status(500).json({ error: 'Failed to fetch friend activities' });
    }
});

app.get("/social/friends", auth, async (req, res) => {
    try {
        const { user_id } = req.session.user;
        const tab = 'friends';

        // Fetch the user from the database
        const user = await db.one('SELECT * FROM users WHERE user_id = $1;', [user_id]);

        // Fetch the friends list
        const friends = await db.any(`
            SELECT u.user_id, u.username, u.display_name, u.profile_photo_path, 'incoming' AS request_type, 1 AS sort_order
            FROM friends f
            JOIN users u ON u.user_id = f.user_id
            WHERE f.friend_id = $1 AND f.status = 'pending'

            UNION

            SELECT u.user_id, u.username, u.display_name, u.profile_photo_path, 'accepted' AS request_type, 2 AS sort_order
            FROM friends f
            JOIN users u ON u.user_id = f.friend_id
            WHERE f.user_id = $1 AND f.status = 'accepted'

            UNION

            SELECT u.user_id, u.username, u.display_name, u.profile_photo_path, 'accepted' AS request_type, 2 AS sort_order
            FROM friends f
            JOIN users u ON u.user_id = f.user_id
            WHERE f.friend_id = $1 AND f.status = 'accepted'

            UNION

            SELECT u.user_id, u.username, u.display_name, u.profile_photo_path, 'outgoing' AS request_type, 3 AS sort_order
            FROM friends f
            JOIN users u ON u.user_id = f.friend_id
            WHERE f.user_id = $1 AND f.status = 'pending'

            ORDER BY sort_order, username;
        `, [user_id]);

        res.render("pages/social", { activeTab: tab, user, friends });
    } catch (err) {
        console.error("Error fetching user or friends data:", err);
        res.render("pages/social", { activeTab: 'account', user: req.session.user });
    }
});

app.post("/search/:username", auth, async (req, res) => {
    try {
        const { user_id } = req.session.user;
        const { username } = req.params;

        // Check if the user exists in the database
        const user = await db.oneOrNone("SELECT user_id FROM users WHERE username = $1;", [username]);

        if (!user) {
            return res.json({ message: `User "${username}" not found.` });
        }

        if(user_id == user.user_id){
            return res.json({ message: `User "${username}" not found.` });
        }

        // Check if a friend request already exists
        const existingRequest = await db.oneOrNone(`
            SELECT * FROM friends 
            WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1);
        `, [user_id, user.user_id]);

        if (existingRequest) {
            return res.json({ message: `Friend request already sent or user is already your friend.` });
        }

        // Insert a new friend request (pending)
        await db.none(`
            INSERT INTO friends (user_id, friend_id, status) 
            VALUES ($1, $2, 'pending');
        `, [user_id, user.user_id]);

        res.json({ message: `Friend request sent to ${username}.` });
    } catch (err) {
        console.error("Error searching or adding user:", err);
        res.status(500).json({ message: "Error processing the friend request." });
    }
});
app.post("/accept-friend/:friendId", auth, async (req, res) => {
    try {
        const { user_id } = req.session.user;
        const { friendId } = req.params;

        // Update the friendship status to accepted
        await db.none(`
            UPDATE friends 
            SET status = 'accepted', accepted_at = NOW()
            WHERE user_id = $1 AND friend_id = $2
        `, [friendId, user_id]);

        res.json({ message: "Friend request accepted." });
    } catch (err) {
        console.error("Error accepting friend request:", err);
        res.status(500).json({ message: "Failed to accept friend request." });
    }
});
app.post("/decline-friend/:friendId", auth, async (req, res) => {
    try {
        const { user_id } = req.session.user;
        const { friendId } = req.params;

        // Delete the friendship record
        await db.none(`
            DELETE FROM friends 
            WHERE user_id = $1 AND friend_id = $2
        `, [friendId, user_id]);

        res.json({ message: "Friend request declined." });
    } catch (err) {
        console.error("Error declining friend request:", err);
        res.status(500).json({ message: "Failed to decline friend request." });
    }
});

// CHARACTER WORK
// Route to get character customization data
app.get('/api/character', auth, async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      
      // Query the database for the user's character
      const result = await db.oneOrNone(
        'SELECT character_name, hat_choice, color_choice FROM character_customizations WHERE user_id = $1',
        [userId]
      );
      
      if (!result) {
        // No character exists yet, return default values
        return res.json({
          character: {
            characterName: 'Unnamed Pal',
            hatChoice: '',
            colorChoice: 'default'
            }
        });
      }
      
      // Return the found character data
      res.json({
        character: {
            characterName: result.character_name,
            hatChoice: result.hat_choice || '',
            colorChoice: result.color_choice || 'default'
        }
      });
    } catch (error) {
      console.error('Error fetching character data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Route to save character customization data
  app.post('/api/character', auth, async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const { characterName, hatChoice, colorChoice } = req.body;
      
      console.log('Saving character:', { characterName, hatChoice, colorChoice });
      
      // Check if the user already has a character
      const exists = await db.oneOrNone(
        'SELECT 1 FROM character_customizations WHERE user_id = $1',
        [userId]
      );
      
      if (!exists) {
        // Insert new character data
        await db.none(
          `INSERT INTO character_customizations 
          (user_id, character_name, hat_choice, color_choice) 
          VALUES ($1, $2, $3, $4)`,
          [userId, characterName, hatChoice, colorChoice]
        );
      } else {
        // Update existing character data
        await db.none(
          `UPDATE character_customizations 
          SET character_name = $1, hat_choice = $2, color_choice = $3, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $4`,
          [characterName, hatChoice, colorChoice, userId]
        );
      }
      
      res.json({ success: true, message: 'Character saved successfully!' });
    } catch (error) {
      console.error('Error saving character data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Update the pal route to fetch character data from the database
  app.get('/pal', auth, async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      
      // Query the database for the user's character
      const result = await db.oneOrNone(
        'SELECT character_name, hat_choice, color_choice FROM character_customizations WHERE user_id = $1',
        [userId]
      );
      
      let characterData = {
        characterName: 'Unnamed Pal',
        hatChoice: 'none',
        colorChoice: 'default'
      };
      
      if (result) {
        characterData = {
          characterName: result.character_name,
          hatChoice: result.hat_choice || 'none',
          colorChoice: result.color_choice || 'default'
        };
      }
      
      // Determine the character image path based on customizations
      // TODO: Work on a way to connect this imagePath to characterCustomization imagePath
      let imagePath = '../../extra_resources/character_assets/';
      let characterImage;
      if (characterData.hatChoice === 'none') {
        // No hat selected
        if (characterData.colorChoice === 'default') {
          // No color selected either, use base monster
          characterImage = imagePath + 'basemonster.jpeg';
        } else {
          // Color selected but no hat
          characterImage = imagePath + `basemonster_${characterData.colorChoice}.jpeg`;
        }
      } else {
        // Hat selected
        if (characterData.colorChoice === 'default') {
          // Hat selected but no color, use default color with hat
          characterImage = imagePath + `monster_default_${characterData.hatChoice}.jpeg`;
        } else {
          // Both hat and color selected
          characterImage = imagePath + `monster_${characterData.colorChoice}_${characterData.hatChoice}.jpeg`;
        }
      }
      
      // Render the pal page with the character data
      res.render('pages/pal', {
        user: req.session.user,
        characterName: characterData.characterName,
        characterImage: characterImage,
        hatChoice: characterData.hatChoice,
        colorChoice: characterData.colorChoice
      });
    } catch (error) {
      console.error('Error rendering pal page:', error);
      res.status(500).send('Internal server error');
    }
  });

  
// fetch OpenWeatherMap data:
app.get('/weatherAPI', auth, async (req, res) => {
    const { lat, lon} = req.query;
    // Handling no user coordinates first.
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Location not provided; cannot return weather data.' });
    }

    try {
        const OpenWeatherMap_API = process.env.WEATHER_API_KEY;

        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OpenWeatherMap_API}&units=imperial`;
        const weatherResponse = await fetch(weatherURL);
        if (!weatherResponse.ok) {
            throw new Error('Error fetching weather data');
        }
        const weatherData = await weatherResponse.json();

        const airQualityURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OpenWeatherMap_API}`;
        const airQualityResponse = await fetch(airQualityURL);
        if (!airQualityResponse.ok) {
            throw new Error('Error fetching air quality data');
        }
        const airQualityData = await airQualityResponse.json();

        const airQuality = airQualityData.list && airQualityData.list[0] ? airQualityData.list[0].main.aqi : "N/A";

        req.session.weather = {
            weather: weatherData,
            airQuality: airQuality,
            timestamp: Date.now()
        };
        req.session.save(err => {
            if (err) {
                console.error('Error saving session:', err);
            }
            res.redirect('/home?weatherAttempted=true');
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.redirect('/home?weatherAttempted=true');
    }
});

app.post('/user-profile-content', auth, async (req, res) => {
try {
    const { userId } = req.body;
    
    // Get the user profile
    const user = await db.oneOrNone(`
        SELECT user_id, username, display_name, profile_photo_path, fitness_level, bio, visibility
        FROM users WHERE user_id = $1
        `, [userId]);
    
    if (!user) {
        return res.send('<div class="p-4 text-red-500">User not found</div>');
    }

    const isFriend = await db.oneOrNone(`
        SELECT 1 FROM friends 
        WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
          AND status = 'accepted'
      `, [req.session.user.user_id, userId]);
      
    if (user.visibility === 'private' || (user.visibility === 'friends' && !isFriend)) {
    return res.send('<div class="p-4 text-red-500">Not authorized to view this profile</div>');
    }
    
    // Get recent activities
    const activities = await db.any(`
        SELECT al.*, at.activity_name
        FROM activity_logs al
        JOIN activity_types at ON al.activity_type_id = at.activity_type_id
        WHERE al.user_id = $1
        ORDER BY al.activity_date DESC, al.created_at DESC
        LIMIT 5
        `, [userId]);
    
    // Render the friend profile content partial
    res.render('partials/user-profile-content', {
    layout: false,
    user: user,
    activities: activities
    });
} catch (error) {
    console.error('Error fetching profile:', error);
    res.send('<div class="p-4 text-red-500">Error loading profile. Please try again.</div>');
}
});

//Ensure App is Listening For Requests
module.exports = app.listen(3000);
