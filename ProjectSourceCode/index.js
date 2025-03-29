const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); 
const bodyParser = require('body-parser');
const session = require('express-session'); 
const bcrypt = require('bcryptjs');

const hbs = handlebars.create({
  extname: "hbs",
  layoutsDir: __dirname + "/views/layouts",
  partialsDir: __dirname + "/views/partials",
  helpers: {
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
      if (!duration) return "";
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}h ${minutes}m`;
    },
    pluralize: function (count, singular, plural) {
      return count === 1 ? singular : plural;
    },
  },
});

const dbConfig = {
    host: 'db', // the database server
    port: 5432, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

db.connect()
    .then(obj => {
        console.log('Database connection successful');
        obj.done();
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
    })
);

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(express.static(path.join(__dirname)));
app.use('/images', express.static(path.join(__dirname, 'extra_resources/images')));

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
        var user = {user_id: null};
        const email = req.body.email
        const username = req.body.username;
        user_data = await db.oneOrNone('select * from users where users.username = $1 LIMIT 1;', [username]);
        if (user_data) {
            user.user_id = user_data.user_id;
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

app.get('/home',auth, (req, res) => {
    res.render('pages/home');
});

function getCurrentWeekRange() {
    // Get current date
    const now = new Date();
    
    // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    const currentDay = now.getDay();
    
    // Calculate days to subtract to get to Sunday (start of week)
    const daysToSubtract = currentDay;
    
    // Create a new date object for the start of the week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0); // Set to beginning of the day
    
    // Create a new date object for the end of the week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // Set to end of the day
    
    return {
      startDate: startOfWeek,
      endDate: endOfWeek
    };
  }

  // Function to get weekly statistics
  function getWeeklyStats(workoutData) {
    const weekRange = getCurrentWeekRange();
    
    // Filter workouts that fall within the current week
    const weeklyWorkouts = workoutData.filter(workout => {
      const workoutDate = new Date(workout.workout_date);
      return workoutDate >= weekRange.startDate && workoutDate <= weekRange.endDate;
    });
    
    // Calculate statistics based on filtered data
    const totalDistance = weeklyWorkouts.reduce((sum, workout) => {
        if (workout.distance_mi) {
            return sum + parseFloat(workout.distance_mi);
        }
        return sum;
    }, 0);
    const totalDuration = weeklyWorkouts.reduce((sum, workout) => sum + (workout.duration_minutes || 0), 0);
    
    return {
      weekStart: weekRange.startDate.toLocaleDateString(),
      weekEnd: weekRange.endDate.toLocaleDateString(),
      workoutCount: weeklyWorkouts.length,
      totalDistance: totalDistance,
      totalDuration: totalDuration,
      workouts: weeklyWorkouts
    };
  }

app.get('/activity', auth, async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      
      const activities = await db.any(
        `SELECT wl.*, at.activity_name 
        FROM workout_logs wl
        JOIN activity_types at ON wl.activity_type_id = at.activity_type_id
        WHERE wl.user_id = $1
        ORDER BY wl.workout_date DESC, wl.workout_time DESC, wl.created_at DESC`,
        [userId]
      );

      const weeklyStats = getWeeklyStats(activities);
      
      res.render('pages/activity', { 
        activities: activities, 
        weeklyStats: weeklyStats
      });
    } catch (err) {
      console.error('Error fetching activities:', err);
      res.render('pages/activity', { 
        activities: [],
        error: 'Error loading activities. Please try again.' 
      });
    }
  });

app.get('/social',auth, (req, res) => {
    res.render('pages/social');
});

app.get('/pal',auth, (req, res) => {
    res.render('pages/pal');
});

app.get('/settings',auth, (req, res) => {
    res.render('pages/settings');
});

// Submit a new activity
app.post('/api/activities', auth, async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const { 
            'activity-type': activityTypeName, 
            'activity-duration': durationMinutes, 
            'activity-distance': distanceMi, 
            'activity-date': workoutDate,
            'activity-time': workoutTime,
            'activity-notes': notes 
        } = req.body;
        
        // Get activity type ID from name
        const activityType = await db.oneOrNone('SELECT activity_type_id FROM activity_types WHERE activity_name ILIKE $1', [activityTypeName]);
        
        if (!activityType) {
            return res.status(400).redirect('/activity?error=Invalid activity type');
        }
        
        const activityTypeId = activityType.activity_type_id;
        
        // Use current date if no date provided
        const date = workoutDate || new Date().toISOString().split('T')[0];
        
        // Use current time if no time provided
        const time = workoutTime || new Date().toTimeString().split(' ')[0];

        // Insert the workout log
        await db.none(
            `INSERT INTO workout_logs 
            (user_id, activity_type_id, workout_date, workout_time, duration_minutes, distance_mi, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [userId, activityTypeId, date, time, durationMinutes, distanceMi, notes]
        );

        return res.redirect('/activity');
    } catch (err) {
        console.error('Error adding activity:', err);
        return res.redirect('/activity?error=Failed to add activity');
    }
});

// Delete an activity
app.post('/api/activities/:id', auth, async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const workoutId = req.params.id;
      
      // Ensure the workout belongs to the user
      const workout = await db.oneOrNone(
        'SELECT * FROM workout_logs WHERE workout_id = $1 AND user_id = $2',
        [workoutId, userId]
      );
      
      if (!workout) {
        return res.status(404).redirect('/activity?error=Activity not found');
      }
      
      await db.none('DELETE FROM workout_logs WHERE workout_id = $1', [workoutId]);
      
      // Redirect back to activities page
      res.redirect('/activity?success=Activity deleted');
    } catch (err) {
      console.error('Error deleting activity:', err);
      res.redirect('/activity?error=Error deleting activity');
    }
  });

//Ensure App is Listening For Requests
app.listen(3000);
