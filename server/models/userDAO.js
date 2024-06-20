'use strict';

const db = require('../config/db');

function getUserByField(fieldName, value) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM User WHERE ${fieldName} = ?;`;

        db.get(sql, [value], (err, row) => {
            if (err) return reject(err);
            if (!row) return resolve({ error: 'No user found' });

            resolve({
                userId: row.userId,
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email,
                password: row.password,
                role: row.role,
                profilePicture: row.profilePicture
            });
        });
    });
}

function updateField(fieldName, value, userId) {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE User SET ${fieldName} = ? WHERE userId = ?;`;

        db.run(sql, [value, userId], function (err) {
            if (err) return reject(err);
            else resolve(this.changes);
        });
    });
}


exports.getUserByEmail = (email) => getUserByField('email', email);

exports.getUserById = (userId) => getUserByField('userId', userId);

exports.getUsers = (filter, offset, limit) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM User';
        const params = [];

        if (filter) {
            sql += ` WHERE CONCAT(firstName, ' ', lastName) LIKE ? OR email LIKE ? `;
            params.push(`%${filter}%`)
            params.push(`%${filter}%`)
        }

        sql += ' ORDER BY userId' 
        
        if (limit) {
            sql +=  ' LIMIT ?';
            params.push(limit);
        } 

        if (offset) {
            sql +=  ' OFFSET ?';
            params.push(offset);
        }

        db.all(sql, params, function (err, rows) {
            if (err) reject(err);
            if (!rows) return resolve({ error: 'No user found' });

            resolve(rows.map(row => {
                return {
                    userId:         row.userId,
                    firstName:      row.firstName,
                    lastName:       row.lastName,
                    email:          row.email,
                    role:           row.role,
                    profilePicture: row.profilePicture,
                }
            }));
        });
    });
}

exports.addUser = (firstName, lastName, email, password, role, profilePicture) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO User (firstName, lastName, email, password, role, profilePicture) VALUES (?, ?, ?, ?, ?, ?);`

        db.run(sql, [
                firstName,
                lastName,
                email,
                password,
                role, 
                profilePicture
            ],
            function (err) {
                if (err) reject(err); 
                else resolve(this.lastID);
            }
        );
    })
}

exports.updateFirstName = (userId, firstName) => updateField('firstName', firstName, userId);

exports.updateLastName = (userId, lastName) => updateField('lastName', lastName, userId);

exports.updateEmail = (userId, email) => updateField('email', email, userId);

exports.updatePassword = (userId, password) => updateField('password', password, userId);

exports.updateProfilePicture = (userId, profilePicture) => updateField('profilePicture', profilePicture, userId);

exports.deleteUser = (userId) => {
    return new Promise((resolve, reject) => {
        let sql = 
            `DELETE 
            FROM EventRegistration 
            WHERE userId = ?;`;
        db.run(sql, [userId], (err) => {
            if (err) reject(err);

            sql = 
                `DELETE
                FROM EventRegistration 
                WHERE eventId IN (
                    SELECT eventId 
                    FROM Event 
                    WHERE organizerId = ?
                );`;
            db.run(sql, [userId], (err) => {
                if (err) reject(err);

                sql = 
                    `DELETE 
                    FROM EventImage 
                    WHERE eventId IN (
                        SELECT eventId 
                        FROM Event 
                        WHERE organizerId = ?
                    );`;
                db.run(sql, [userId], (err) => {
                    if (err) reject(err);

                    sql = 
                        `DELETE 
                        FROM Event 
                        WHERE organizerId = ?;`;
                    db.run(sql, [userId], (err) => {
                        if (err) reject(err);

                        sql = 
                            `DELETE 
                            FROM User 
                            WHERE userId = ?;`;
                        db.run(sql, [userId], function (err) {
                            if (err) reject(err);

                            resolve(this.changes);
                        });
                    });
                });
            });
        });
    });
}