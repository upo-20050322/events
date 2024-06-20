'use strict';

require('dotenv').config();

const express = require('express');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const passport = require('passport');
const SQLiteStore = require('connect-sqlite3')(session);
const userDAO = require('./server/models/userDAO');
const morgan = require('morgan');
const path = require('path');
const auth = require('./server/middleware/auth');
const authRouter = require('./server/routes/auth');
const usersRouter = require('./server/routes/users');
const eventsRouter = require('./server/routes/events');
const { notFound, handleServerError } = require('./server/middleware/handleServerError');

const app = express();


// Log
const logBuffer = [];
const LOG_BUFFER_SIZE = 100;

const handleLog = (message) => {
    logBuffer.push(message);
    if (logBuffer.length > LOG_BUFFER_SIZE) logBuffer.shift(); 
};
  
const originalLog = console.log;
console.log = function (...args) {
    const logMessage = args.join(' ');
    handleLog(`${new Date().toISOString()} - ${logMessage}`);
    originalLog.apply(console, args);
  };
  
const originalError = console.error;
console.error = function (...args) {
    const logMessage = args.join(' ');
    handleLog(`${new Date().toISOString()} - ${logMessage}`);
    originalError.apply(console, args);
};
  
const logger = (req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const logMessage = `${new Date().toISOString()} - ${req.method} ${req.originalUrl} ${res.statusCode} - ${res.get('Content-Length') || '-'}`;
        handleLog(logMessage);
    });
    next();
};

app.use(morgan('dev'));
app.use(logger);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File Upload
app.use(fileUpload());

// Passport
const initializePassport = require('./server/config/passport');
initializePassport(
    passport,
    async email => await userDAO.getUserByEmail(email),
    async id => await userDAO.getUserById(id)
)

// Session
app.use(session({
    store: new SQLiteStore({ db: process.env.DB_SOURCE, concurrentDB: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 3600000 * 2 // 2h
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Static Files
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/upload')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.get('/logs', auth.isAuthenticated, auth.isAdmin, (req, res) => res.json(logBuffer));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

// Error Handling
app.use(notFound);
app.use(handleServerError);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
