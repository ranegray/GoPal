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
const { getCharacterInfo, updateCharacter, awardXp } = require("./utils/character-utils.js");

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
    now: function() {
        return new Date();
    },
    formatMonth: function(date) {
    return date.toLocaleString('default', { month: 'long' });
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
    gt: function (a, b) {
      return a > b;
    },
    lt: function (a, b) {
      return a < b;
    },
    subtract: function (a, b) {
      return a - b;
    },
    divide: function (a, b) {
      return a / b;
    },
    multiply: function (a, b) {
      return a * b;
    },
    lookup: function (obj, key) {
      return obj[key];
    },
    floor: function (num) {
        return Math.floor(num);
    },
    getActivityIcon: function (activityName) {
      let svgIcon = "";
      // Use lowercase for case-insensitive matching
      switch (activityName.toLowerCase()) {
        case "running":
          svgIcon = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-run"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M4 17l5 1l.75 -1.5" /><path d="M15 21l0 -4l-4 -3l1 -6" /><path d="M7 12l0 -3l5 -1l3 3l3 1" /></svg>`;
          break;
        case "walking":
          svgIcon = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-walk"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M7 21l3 -4" /><path d="M16 21l-2 -4l-3 -3l1 -6" /><path d="M6 12l2 -3l4 -1l3 3l3 1" /></svg>`;
          break;
        case "cycling":
          svgIcon = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-bike"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M19 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M12 19l0 -4l-3 -3l5 -4l2 3l3 0" /><path d="M17 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>`;
          break;
        case "swimming":
          svgIcon = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-swimming"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M6 11l4 -2l3.5 3l-1.5 2" /><path d="M3 16.75a2.4 2.4 0 0 0 1 .25a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 1 -.25" /></svg>`;
          break;
        case "hiking":
          svgIcon = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-trekking"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M7 21l2 -4" /><path d="M13 21v-4l-3 -3l1 -6l3 4l3 2" /><path d="M10 14l-1.827 -1.218a2 2 0 0 1 -.831 -2.15l.28 -1.117a2 2 0 0 1 1.939 -1.515h1.439l4 1l3 -2" /><path d="M17 12v9" /><path d="M16 20h2" /></svg>`;
          break;
        case "skiing/snowboarding":
          svgIcon = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-ski-jumping"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 3a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" /><path d="M17 17.5l-5 -4.5v-6l5 4" /><path d="M7 17.5l5 -4.5" /><path d="M15.103 21.58l6.762 -14.502a2 2 0 0 0 -.968 -2.657" /><path d="M8.897 21.58l-6.762 -14.503a2 2 0 0 1 .968 -2.657" /><path d="M7 11l5 -4" /></svg>`;
          break;
        default:
          // Default icon if no match is found
          svgIcon = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`; // Example placeholder
      }
      // Return the SVG icon as a safe string
      return new Handlebars.SafeString(svgIcon);
    },
    timeAgo: function(dateStr, timeStr) {
        // Create a date from the activity date and time
        const date = new Date(dateStr);
        if (timeStr) {
          const [hours, minutes] = timeStr.split(':').map(Number);
          date.setHours(hours, minutes);
        }
        
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const diffWeek = Math.floor(diffDay / 7);
        const diffMonth = Math.floor(diffDay / 30);
        const diffYear = Math.floor(diffDay / 365);
        
        // Return appropriate time format
        if (diffSec < 60) return `${diffSec}s`;
        if (diffMin < 60) return `${diffMin}m`;
        if (diffHour < 24) return `${diffHour}h`;
        if (diffDay < 7) return `${diffDay}d`;
        if (diffWeek < 4) return `${diffWeek}w`;
        if (diffMonth < 12) return `${diffMonth}mo`;
        return `${diffYear}y`;
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

//START CHARACTER MIDDLEWARE
/// First, define the character middleware as a separate function
const characterMiddleware = async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.session || !req.session.user || !req.session.user.user_id) {
        // If not authenticated, skip character processing and continue
        return next();
      }
      
      const userId = req.session.user.user_id;
      
      // Get character information using your existing utility function
      const characterInfo = await getCharacterInfo(userId);
      
      // Determine the character image path based on customizations
      let imagePath = '../../extra_resources/character_assets/';
      let characterImage;
      const character = characterInfo.character;
      
      if (!character.hat_choice || character.hat_choice === 'none') {
        // No hat selected
        if (character.color_choice === 'default') {
          // No color selected either, use base monster
          characterImage = imagePath + 'basemonster.svg';
        } else {
          // Color selected but no hat
          characterImage = imagePath + `basemonster_${character.color_choice}.svg`;
        }
      } else {
        // Hat selected
        if (character.color_choice === 'default') {
          // Hat selected but no color, use default color with hat
          characterImage = imagePath + `monster_default_${character.hat_choice}.svg`;
        } else {
          // Both hat and color selected
          characterImage = imagePath + `monster_${character.color_choice}_${character.hat_choice}.svg`;
        }
      }
      
      // Make character data available to all views
      res.locals.character = character;
      res.locals.characterName = character.character_name;
      res.locals.characterImage = characterImage;
      res.locals.hatChoice = character.hat_choice || 'none';
      res.locals.colorChoice = character.color_choice || 'default';
      res.locals.evolutionStage = characterInfo.evolutionStage;
      res.locals.nextLevel = characterInfo.nextLevel;
      res.locals.xpToNextLevel = characterInfo.xpToNextLevel;
    } catch (err) {
      console.error('Error loading character data in middleware:', err);
      // Set defaults in case of error
      res.locals.characterName = "Your Pal";
      res.locals.characterImage = "../../extra_resources/character_assets/basemonster.svg";
      res.locals.hatChoice = 'none';
      res.locals.colorChoice = 'default';
    }
  
    // Continue to the next middleware/route handler
    next();
  };
  
  // Then apply the middleware globally, but without the auth dependency
  app.use(characterMiddleware);

//END CHARACTER MIDDLEWARE


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

app.get('/home', auth, async (req, res) => {
  try {
      const userId = req.session.user.user_id;
      
      // 1. Get weather data (already in your code)
      const weatherTimeLimit = 5 * 60 * 1000; // 5 minutes in milliseconds
      const lastWeatherUpdate = req.session.weather?.timestamp || 0; 
      const timeSinceLastWeatherUpdate = Date.now() - lastWeatherUpdate;
      let weather = null;
      let airQuality = null;
      
      if (req.session.weather && timeSinceLastWeatherUpdate <= weatherTimeLimit) {
          weather = req.session.weather.weather;
          airQuality = req.session.weather.airQuality;
      }

      // 2. Get character data
      let characterName = 'Unnamed Pal';
      let characterImage = '../../extra_resources/character_assets/basemonster.svg';
      
      const characterData = await db.oneOrNone(
          'SELECT character_name, hat_choice, color_choice FROM character_customizations WHERE user_id = $1',
          [userId]
      );
      
      if (characterData) {
          characterName = characterData.character_name;
          
          // Determine character image path based on customizations
          let imagePath = '../../extra_resources/character_assets/';
          
          if (characterData.hat_choice === 'none' || characterData.hat_choice === '') {
              // No hat selected
              if (characterData.color_choice === 'default') {
                  // No color selected either, use base monster
                  characterImage = imagePath + 'basemonster.jpeg';
              } else {
                  // Color selected but no hat
                  characterImage = imagePath + `basemonster_${characterData.color_choice}.svg`;
              }
          } else {
              // Hat selected
              if (characterData.color_choice === 'default') {
                  // Hat selected but no color, use default color with hat
                  characterImage = imagePath + `monster_default_${characterData.hat_choice}.svg`;
              } else {
                  // Both hat and color selected
                  characterImage = imagePath + `monster_${characterData.color_choice}_${characterData.hat_choice}.svg`;
              }
          }
      }

      // 3. Get activity stats and recent activities
      const activities = await db.any(
          `SELECT wl.*, at.activity_name 
          FROM activity_logs wl
          JOIN activity_types at ON wl.activity_type_id = at.activity_type_id
          WHERE wl.user_id = $1
          ORDER BY wl.activity_date DESC, wl.activity_time DESC, wl.created_at DESC`,
          [userId]
      );
      
      // Get monthly stats
      const { startDate, endDate } = require('./utils/date-utils').getDateRange("month");
      const stats = require('./utils/stat-utils').getStatsForRange(activities, startDate, endDate);

      // 4. Get achievements
      const achievementsData = await db.any(
          `SELECT a.id, a.name, a.description, a.criteria_type, a.criteria_value, 
              CASE WHEN ua.id IS NOT NULL THEN true ELSE false END as unlocked
          FROM achievements a
          LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
          ORDER BY a.criteria_value ASC`,
          [userId]
      );
      
      // Format achievements with progress information
      const achievements = achievementsData.map(achievement => {
          const result = {
              id: achievement.id,
              name: achievement.name,
              description: achievement.description,
              unlocked: achievement.unlocked
          };
          
          // Add progress for non-unlocked achievements
          if (!achievement.unlocked && achievement.criteria_type === 'ACTIVITY_COUNT') {
              // Get the current count
              const current = req.session.user.activities_completed_count || 0;
              const target = achievement.criteria_value;
              
              result.progress = Math.min(Math.round((current / target) * 100), 99); // Cap at 99% until unlocked
              result.current = current;
              result.target = target;
          }
          
          return result;
      });

      // 5. Get notifications
      const notifications = await db.any(
          `SELECT * FROM notifications 
          WHERE user_id = $1 AND is_read = FALSE 
          ORDER BY created_at DESC LIMIT 10`,
          [userId]
      );

      // 6. Get friend activities (if available)
      let friendActivities = [];
      
      // Get the list of friend IDs where the friendship is accepted
      const friends = await db.any(`
          SELECT friend_id AS id FROM friends 
          WHERE user_id = $1 AND status = 'accepted'
          UNION
          SELECT user_id AS id FROM friends 
          WHERE friend_id = $1 AND status = 'accepted'
      `, [userId]);

      if (friends.length > 0) {
          // Extract friend IDs from result
          const friendIds = friends.map(friend => friend.id);
          
        // Fetch recent activities from friends
        const rawFriendActivities = await db.any(`
            SELECT al.activity_id, al.user_id, u.username, u.display_name, u.profile_photo_path,
                al.activity_type_id, at.activity_name, al.duration_minutes, al.distance_mi,
                al.activity_date, al.activity_time, -- Select activity_date and activity_time
                al.created_at -- Keep created_at just in case, or for sorting
            FROM activity_logs al
            JOIN users u ON al.user_id = u.user_id
            JOIN activity_types at ON al.activity_type_id = at.activity_type_id
            WHERE al.user_id IN ($1:csv)
            ORDER BY al.activity_date DESC, al.activity_time DESC
            LIMIT 5
        `, [friendIds]);

        // Format friend activities
        friendActivities = rawFriendActivities.map(activity => {
            const now = new Date();
            // Combine activity_date and activity_time into a single Date object
            const activityDateTimeString = `${activity.activity_date.toISOString().split('T')[0]}T${activity.activity_time}`;
            const activityTime = new Date(activityDateTimeString); 
            
            const timeDiff = Math.floor((now - activityTime) / (1000 * 60)); // minutes

            let timeAgo;
            if (timeDiff < 1) { // Handle cases less than a minute
                timeAgo = 'just now';
            } else if (timeDiff < 60) {
                timeAgo = `${timeDiff} minute${timeDiff !== 1 ? 's' : ''} ago`;
            } else if (timeDiff < 1440) { // less than a day
                const hours = Math.floor(timeDiff / 60);
                timeAgo = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
            } else {
                const days = Math.floor(timeDiff / 1440);
                timeAgo = `${days} day${days !== 1 ? 's' : ''} ago`;
            }

            return {
                activity_id: activity.activity_id,
                username: activity.username,
                display_name: activity.display_name || activity.username,
                profile_photo_path: activity.profile_photo_path || `https://avatar.iran.liara.run/username?username=${activity.username}`,
                activity_description: `completed a ${activity.distance_mi ? activity.distance_mi + ' mile ' : ''}${activity.activity_name.toLowerCase()}!`, // Added check for distance
                time_ago: timeAgo
            };
        });
      }

      // Render the dashboard with all the data
      res.render('pages/home', {
          user: req.session.user,
          characterName,
          characterImage,
          stats,
          weather,
          airQuality,
          achievements,
          notifications,
          hasNotifications: notifications.length > 0,
          friendActivities
      });
  } catch (err) {
      console.error('Error loading dashboard:', err);
      res.render('pages/home', {
          user: req.session.user,
          error: 'Error loading dashboard data. Please try again.'
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
        const allowedTabs = ["account", "profile", "pal-settings", "alert-settings"];
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


        // Fetch user's unread notifications
        const notifications = await db.any(
            `SELECT * FROM notifications 
            WHERE user_id = $1 AND is_read = FALSE 
            ORDER BY created_at DESC LIMIT 10`,
            [req.session.user.user_id]
        );

        res.render("pages/settings", { activeTab: tab, user: user, notifications, hasNotifications: notifications.length > 0});
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

        // Fetch user's unread notifications
        const notifications = await db.any(
            `SELECT * FROM notifications 
            WHERE user_id = $1 AND is_read = FALSE 
            ORDER BY created_at DESC LIMIT 10`,
            [userId]
        );

        res.render("pages/journal", {
            user: req.session.user, 
            journals: journals,
            journalStats: journalStats,
            notifications,
            hasNotifications: notifications.length > 0
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

        awardXp(userId, 10,  "You are the GOAT");
        
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
app.post('/api/journal/:id', auth, async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const entryId = req.params.id;
        
        // Ensure the journal entry belongs to the user
        const journalEntry = await db.oneOrNone(
        'SELECT * FROM journal_logs WHERE entry_id = $1 AND user_id = $2',
        [entryId, userId]
        );
        
        if (!journalEntry) {
        return res.status(404).redirect('/journal?error=Journal entry not found');
        }
        
        await db.none('DELETE FROM journal_logs WHERE entry_id = $1', [entryId]);
        
        // Redirect back to activities page
        res.redirect('/journal?success=Journal entry deleted');
    } catch (err) {
        console.error('Error deleting journal entry:', err);
        res.redirect('/journal?error=Error deleting journal entry');
    }
  });

// Delete a journal entry
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
            // Fetch recent activities from friends
            activities = await db.any(`
                SELECT al.activity_id, al.user_id, u.username, u.display_name, u.profile_photo_path, al.activity_type_id, at.activity_name, al.activity_date, al.activity_time, al.duration_minutes, al.distance_mi, al.notes,
                       al.created_at 
                FROM activity_logs al
                JOIN users u ON al.user_id = u.user_id
                JOIN activity_types at ON al.activity_type_id = at.activity_type_id
                WHERE al.user_id IN ($1:csv)
                ORDER BY al.activity_date DESC, al.activity_time DESC
                LIMIT 10
            `, [friendIds]);

            achievements = await db.any(`
                SELECT 
                    ua.user_id,
                    u.username,
                    u.display_name,
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

        // Fetch user's unread notifications
        const notifications = await db.any(
            `SELECT * FROM notifications 
            WHERE user_id = $1 AND is_read = FALSE 
            ORDER BY created_at DESC LIMIT 10`,
            [user_id]
        );

        console.log(activities);

        res.render("pages/social", { activeTab: tab, user, activities, achievements, notifications, hasNotifications: notifications.length > 0});
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

        // Fetch user's unread notifications
        const notifications = await db.any(
            `SELECT * FROM notifications 
            WHERE user_id = $1 AND is_read = FALSE 
            ORDER BY created_at DESC LIMIT 10`,
            [user_id]
        );

        res.render("pages/social", { activeTab: tab, user, friends, notifications, hasNotifications: notifications.length > 0});
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
app.post('/comment/:activityId', auth, async (req, res) => {
    try {
      const { user_id, username } = req.session.user;  // who is commenting
      const { activityId } = req.params;
      const { comment } = req.body;  // comment text sent from client
  
      // Find the activity to know who posted it
      const activity = await db.one(`
        SELECT al.user_id AS owner_id, at.activity_name
        FROM activity_logs al
        JOIN activity_types at ON al.activity_type_id = at.activity_type_id
        WHERE al.activity_id = $1
      `, [activityId]);
  
      // Insert into notifications
      await db.none(`
        INSERT INTO notifications (user_id, type, reference_id, title, message)
        VALUES ($1, 'comment', $2, $3, $4)
      `, [
        activity.owner_id,         // send to the original poster
        activityId,                // link to the activity
        `New comment on ${activity.activity_name}`,  // title
        `${username} commented: "${comment}"`        // message
      ]);
  
      res.json({ success: true });
    } catch (err) {
      console.error('Error sending notification:', err);
      res.status(500).json({ success: false });
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
  
  app.get('/pal', auth, async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      
      // Get user's unread notifications
      const notifications = await db.any(
        `SELECT * FROM notifications 
         WHERE user_id = $1 AND is_read = FALSE 
         ORDER BY created_at DESC LIMIT 10`,
        [userId]
      );
      
      // Character data is already in res.locals, no need to fetch it again
      
      res.render('pages/pal', {
        user: req.session.user,
        notifications: notifications,
        hasNotifications: notifications.length > 0,
        error: req.query.error,
        success: req.query.success
        // No need to pass character data - it's already in res.locals
      });
    } catch (error) {
      console.error('Error rendering pal page:', error);
      res.status(500).send('Internal server error');
    }
  });
  //END CHARACTER WORK

  
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
// Start the server and store the instance
const server = app.listen(3000, () => {
    console.log("Database connection successful"); // Your existing log
    console.log("Server listening on port 3000"); // Optional log
  });
  
  // Export both the app and the server instance
module.exports = { app, server };
  // --- End of changes ---
