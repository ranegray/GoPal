const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); 
const bodyParser = require('body-parser');
const session = require('express-session'); 
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

app.get('/activity',auth, (req, res) => {
    res.render('pages/activity',{user: req.session.user});
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

app.post('/settings/account', async (req, res) => {
    try{
        let messages = [];
        const phone = req.body.phone;
        let email = req.body.email;
        const birthday = req.body.birthday;
        const country = req.body.country;
        let username = req.body.username;
        let password = req.body.password;
        let hashed_password = await bcrypt.hash(password, 10);

        if (email){
            duplicateEmail = await db.oneOrNone('SELECT * FROM users WHERE email = $1;', [email]);
            if (duplicateEmail)
            {
                messages.push(`Email already in use`);
                email = null;
            }
        }

        if (username)
        {
            duplicateUsername = await db.oneOrNone('SELECT * FROM users WHERE username = $1;', [username]);
            if (duplicateUsername)
            {
                messages.push(`Username already in use`);
                username = null;
            }
        }

        if (password)
        {
            const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#?!@$%^&*\-]).{8,}$/;
            const isPasswordValid = passwordRegex.test(password);
            if (!isPasswordValid)
            {
                password = null;
                messages.push(`Invalid Password (8+ Characters, 1 Special, 1 Lowercase, 1 Uppercase, 1 Digit)`);
            }
        }

        let queryParams = [];
        let queryValues = [];

        if (phone) {
            queryParams.push("phone = $" + (queryParams.length + 1));
            queryValues.push(phone);
        }
        if (email) {
            queryParams.push("email = $" + (queryParams.length + 1));
            queryValues.push(email);
        }
        if (birthday) {
            queryParams.push("birthday = $" + (queryParams.length + 1));
            queryValues.push(birthday);
        }
        if (country) {
            queryParams.push("country = $" + (queryParams.length + 1));
            queryValues.push(country);
        }
        if (username) {
            queryParams.push("username = $" + (queryParams.length + 1));
            queryValues.push(username);
        }
        if (password) {
            queryParams.push("password = $" + (queryParams.length + 1));
            queryValues.push(hashed_password);
        }

        if (queryParams.length > 0) {
            let query = `UPDATE users SET ${queryParams.join(", ")} WHERE user_id = $${queryParams.length + 1}`;
            queryValues.push(req.session.user.user_id);

            await db.none(query, queryValues);
        }

        const user = await db.one('SELECT * FROM users where user_id = $1;',[req.session.user.user_id]);
        if (user.birthday)
        {
            user.birthday = user.birthday.toISOString().split("T")[0];
        }
        req.session.user = user;
        res.render('pages/settings', {activeTab: 'account', message: messages, user: req.session.user});
    }
    catch(err){
        console.error(err);
        res.render('pages/settings', {activeTab: 'account', message: messages, user: req.session.user});
    }
})

app.post('/settings/profile', upload.single('profilePicture'), async (req, res) => {
    try{
        let messages = [];
        const profilePicture = req.body.profilePicture;
        const fitnessLevel = req.body.fitnessLevel;
        const displayName = req.body.displayName;
        const visibility = req.body.profileVisibility;
        
        let queryParams = [];
        let queryValues = [];
        
        if (displayName) {
            queryParams.push("display_name = $" + (queryParams.length + 1));
            queryValues.push(displayName);
        }
        
        if (visibility) {
            queryParams.push("\"visibility\" = $" + (queryParams.length + 1));
            queryValues.push(visibility);
        }

        if (fitnessLevel) {
            queryParams.push("\"fitness_level\" = $" + (queryParams.length + 1));
            queryValues.push(fitnessLevel);
        }

        if (queryParams.length > 0) {
            let query = `UPDATE users SET ${queryParams.join(", ")} WHERE user_id = $${queryParams.length + 1}`;
            queryValues.push(req.session.user.user_id);

            await db.none(query, queryValues);
        }

        const user = await db.one('SELECT * FROM users where user_id = $1;',[req.session.user.user_id]);
        req.session.user = user;

        res.render('pages/settings', {activeTab: 'profile', message: messages, user: req.session.user});
    } catch(err) {
        console.error(err);
        res.render('pages/settings', {activeTab: 'profile', message: messages, user: req.session.user});
    }
})


//Ensure App is Listening For Requests
app.listen(3000);
