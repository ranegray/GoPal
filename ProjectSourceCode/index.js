const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); 
const bodyParser = require('body-parser');
const session = require('express-session'); 
const FileStore = require('session-file-store')(session);
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { errors } = require('pg-promise');
const upload = multer();

const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    helpers: {
        eq: function (a, b) {
            return a === b;
        },
        formatDate: function(date) {
            return new Date(date).toLocaleDateString();
        },
        formatTime: function(time) {
            if (!time) return '';
            
            const timeParts = time.split(':');
            const hours = parseInt(timeParts[0]);
            const minutes = timeParts[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12; // Convert to 12-hour format
            
            return `${displayHours}:${minutes} ${ampm}`;
        }
    }
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
      store: new FileStore({
          path: './sessions',
          ttl: 86400 // 1 day in seconds
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

app.get('/home',auth, (req, res) => {
    res.render('pages/home',{user: req.session.user});
});

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
      
      res.render('pages/activity', { 
        activities: activities,
        user: req.session.user
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

app.get('/social',auth, (req, res) => {
    res.render('pages/social',{user: req.session.user});
});

app.get('/pal',auth, (req, res) => {
    res.render('pages/pal',{user: req.session.user});
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
        if (password) {
            const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#?!@$%^&*\-]).{8,}$/;
            if (!passwordRegex.test(password)) {
                messages.push({text: 'Invalid Password (8+ Characters, 1 Special, 1 Lowercase, 1 Uppercase, 1 Digit)', error: true});
            }
        }
        // Add valid fields to query params
        addQueryParam('phone', phone);
        addQueryParam('email', email && !duplicateEmail ? email : null);
        addQueryParam('birthday', birthday);
        addQueryParam('country', country);
        addQueryParam('username', username && !duplicateUsername ? username : null);
        addQueryParam('password', hashedPassword);
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
        const { profilePicture, fitnessLevel, displayName, profileVisibility } = req.body;
        const userId = req.session.user.user_id;
        
        const queryParams = [];
        const queryValues = [];
        const addQueryParam = (field, value) => {
            if (value) {
                queryParams.push(`${field} = $${queryParams.length + 1}`);
                queryValues.push(value);
            }
        };
        
        // Add fields to query params
        addQueryParam('display_name', displayName);
        addQueryParam('visibility', profileVisibility);
        addQueryParam('fitness_level', fitnessLevel);
        
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
