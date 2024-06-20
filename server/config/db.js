'use strict';

const sqlite = require('sqlite3').verbose();

function initialize() {
    return new Promise((resolve, reject) => {
        let sql = `
            CREATE TABLE IF NOT EXISTS User (
                userId          INTEGER NOT NULL UNIQUE,
                firstName       TEXT NOT NULL,
                lastName        TEXT NOT NULL,
                email           TEXT NOT NULL UNIQUE,
                password        TEXT NOT NULL,
                role            TEXT NOT NULL,
                profilePicture  TEXT DEFAULT NULL,
                PRIMARY KEY(userId AUTOINCREMENT)
            );`;
        db.run(sql, function (err) {
            if (err) reject(err);

            sql = `
                CREATE TABLE IF NOT EXISTS Event (
                    eventId         INTEGER NOT NULL UNIQUE,
                    organizerId     INTEGER NOT NULL,
                    title           TEXT NOT NULL,
                    description     TEXT NOT NULL,
                    category        TEXT NOT NULL,
                    date            DATETIME NOT NULL,
                    latitude        REAL NOT NULL, 
                    longitude       REAL NOT NULL,
                    maxParticipants INTEGER DEFAULT NULL,
                    registrationCost NUMERIC NOT NULL,
                    FOREIGN KEY(organizerId) REFERENCES User(userId),
                    PRIMARY KEY(eventId AUTOINCREMENT)
                );`;
            db.run(sql, function (err) {
                if (err) reject(err);

                sql = `
                    CREATE TABLE IF NOT EXISTS EventImage (
                        imageId INTEGER UNIQUE NOT NULL,
                        eventId INTEGER NOT NULL,
                        path    TEXT NOT NULL,
                        FOREIGN KEY(eventId) REFERENCES Event(eventId),
                        PRIMARY KEY(imageId AUTOINCREMENT)
                    );`;
                db.run(sql, function (err) {
                    if (err) reject(err);

                    sql = `
                        CREATE TABLE IF NOT EXISTS EventRegistration (
                            registrationId INTEGER NOT NULL UNIQUE,
                            eventId        INTEGER NOT NULL,
                            userId         INTEGER NOT NULL,
                            quantity       INTEGER NOT NULL,
                            date           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY(eventId) REFERENCES Event(eventId),
                            FOREIGN KEY(userId) REFERENCES User(userId),
                            PRIMARY KEY(registrationId AUTOINCREMENT)
                        );`;
                    db.run(sql, function (err) {
                        if (err) reject(err);

                        resolve();
                    });
                });
            });
        });
    });
}

function closeDatabase() {
    db.close((err) => {
        if (err) console.error(err);
        else console.log('Database connection closed');
        
        process.exit(0);
    });
}

const db = new sqlite.Database(process.env.DB_SOURCE, async (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }

    db.configure('busyTimeout', 5000);

    await initialize();

    console.log(`Database connected at ${process.env.DB_SOURCE}`);
});

process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);

module.exports = db;
