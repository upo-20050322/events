'use strict';

const db = require('../config/db');

function updateField(fieldName, value, eventId) {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE Event SET ${fieldName} = ? WHERE eventId = ?;`;

        db.run(sql, [value, eventId], function (err) {
            if (err) return reject(err);
            else resolve(this.changes);
        });
    });
}


exports.addEvent = (organizerId, title, description, category, date, location, maxParticipants, registrationCost) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Event (organizerId, title, description, category, date, latitude, longitude, maxParticipants, registrationCost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        
        db.run(sql, [
                organizerId, 
                title, 
                description, 
                category,
                date, 
                location.latitude, 
                location.longitude, 
                maxParticipants, 
                registrationCost, 
            ],
            function (err) {
                if (err) reject(err); 
                else resolve(this.lastID);
            }
        );
    });
}

exports.updateEventTitle = (eventId, title) => updateField('title', title, eventId);

exports.updateEventDescription = (eventId, description) => updateField('description', description, eventId);

exports.updateEventCategory = (eventId, category) => updateField('category', category, eventId);

exports.updateEventDate = (eventId, date) => updateField('date', date, eventId);

exports.updateEventLocation = (eventId, location) => {
    return new Promise((resolve, reject) => {
        const sql = 
            `UPDATE Event 
            SET latitude = ?, longitude = ?
            WHERE eventId = ?;`;

        db.run(sql, [
            location.latitude, 
            location.longitude, 
            eventId
            ], 
            function (err) {
                if (err) reject(err); 
                else resolve(this.changes);
            }
        );
    });
}

exports.updateEventMaxParticipants = (eventId, maxParticipants) => updateField('maxParticipants', maxParticipants, eventId);

exports.updateEventRegistrationCost = (eventId, registrationCost) => updateField('registrationCost', registrationCost, eventId);

exports.deleteEvent = (eventId) => {
    return new Promise((resolve, reject) => {
        let sql = 
        `DELETE
        FROM EventImage
        WHERE eventId = ?;`;
        db.run(sql, [eventId], (err) => {
            if (err) reject(err); 

            sql =
                `DELETE
                FROM EventRegistration
                WHERE eventId = ?;`;
            db.run(sql, [eventId], (err) => {
                if (err) reject(err); 

                sql =
                    `DELETE
                    FROM Event
                    WHERE eventId = ?;`;
                db.run(sql, [eventId], function (err) {
                    if (err) reject(err);

                    resolve(this.changes);
                });
            });
        });
    });
}

exports.addImage = (eventId, path) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO EventImage (eventId, path) VALUES (?, ?);`;
        
        db.run(sql, [
            eventId, 
            path
            ], 
            function (err) {
                if (err) reject(err); 
                else resolve(this.lastID);
            }
        );
    });
}

exports.deleteImage = (eventId, path) => {
    return new Promise((resolve, reject) => {
        const sql = 
            `DELETE
            FROM EventImage
            WHERE eventId = ? AND path = ?;`;
        
        db.run(sql, [
            eventId, 
            path
            ], 
            function (err) {
                if (err) reject(err); 
                else resolve(this.changes);
            }
        );
    });
}

exports.getRegistration = (registrationId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 
            `SELECT EventRegistration.*, EventRegistration.date AS registrationDate, User.*, Event.*, 
                SUM(EventRegistration.quantity) AS registrationCount,
                GROUP_CONCAT(EventImage.path) AS imagePaths
            FROM EventRegistration
            JOIN User ON Event.organizerId = User.userId
            JOIN Event ON EventRegistration.eventId = Event.eventId
            LEFT JOIN EventImage ON Event.eventId = EventImage.eventId
            WHERE EventRegistration.registrationId = ? AND EventRegistration.userId = ?
            GROUP BY Event.eventId, EventRegistration.registrationId;`;
        
        db.get(sql, [registrationId, userId], (err, row)  => {
            if (err) return reject(err);
            if (!row) return resolve({ error: 'Registration not found' });

            resolve({
                registrationId: row.registrationId,
                event:          {
                                    eventId:            row.eventId,
                                    title:              row.title,
                                    description:        row.description,
                                    category:           row.category,
                                    date:               row.date,
                                    location:           { 
                                                            latitude:   row.latitude, 
                                                            longitude:  row.longitude
                                                        },
                                    maxParticipants:    row.maxParticipants,
                                    registrationCost:   row.registrationCost,
                                    registrationCount:  row.registrationCount || 0,
                                    organizer:          {
                                                            organizerId:    row.organizerId,
                                                            firstName:      row.firstName,
                                                            lastName:       row.lastName,
                                                            email:          row.email,
                                                            profilePicture: row.profilePicture
                                                        },
                                    imagePaths:         row.imagePaths ? row.imagePaths.split(',') : []
                                },
                quantity:       row.quantity,
                date:           row.registrationDate
            })
        });
    });
}

exports.getEventRegistration = (eventId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 
            `SELECT EventRegistration.*
            FROM EventRegistration
            WHERE eventId = ? AND userId = ?
            ORDER BY date DESC;`;
        
        db.get(sql, [eventId, userId], (err, row)  => {
            if (err) return reject(err);
            if (!row) return resolve({ error: 'Registration not found' });

            resolve({
                registrationId: row.registrationId,
                quantity:       row.quantity,
                date:           row.date
            })
        });
    });
}

exports.getRegistrations = (userId, filter, offset, limit) => {
    return new Promise((resolve, reject) => {
        let sql = 
            `SELECT EventRegistration.*, User.*, Event.*,  Event.date AS eventDate,
                SUM(EventRegistration.quantity) AS registrationCount,
                GROUP_CONCAT(EventImage.path) AS imagePaths
            FROM EventRegistration
            JOIN User ON Event.organizerId = User.userId
            JOIN Event ON EventRegistration.eventId = Event.eventId
            LEFT JOIN EventImage ON Event.eventId = EventImage.eventId
            WHERE EventRegistration.userId = ? ${filter ? 'AND Event.title LIKE ?': ''}
            GROUP BY Event.eventId, EventRegistration.registrationId
            ORDER BY EventRegistration.date DESC`;
        
        const params = [userId];
    
        if (filter) params.push(`%${filter}%`);

        if (limit) {
            sql += ` LIMIT ?`;
            params.push(limit);
        }

        if (offset) {
            sql += ` OFFSET ?`;
            params.push(offset);
        }
        
        db.all(sql, params, (err, rows)  => {
            if (err) return reject(err);
            if (!rows) return resolve({ error: 'No registration found' });

            resolve(rows.map(row => {
                return {
                    registrationId: row.registrationId,
                    event:          {
                                        eventId:            row.eventId,
                                        title:              row.title,
                                        description:        row.description,
                                        category:           row.category,
                                        date:               row.date,
                                        location:           { 
                                                                latitude:   row.latitude, 
                                                                longitude:  row.longitude
                                                            },
                                        maxParticipants:    row.maxParticipants,
                                        registrationCost:   row.registrationCost,
                                        registrationCount:  row.registrationCount || 0,
                                        organizer:          {
                                                                organizerId:    row.organizerId,
                                                                firstName:      row.firstName,
                                                                lastName:       row.lastName,
                                                                email:          row.email,
                                                                profilePicture: row.profilePicture
                                                            },
                                        imagePaths:         row.imagePaths ? row.imagePaths.split(',') : []
                                    },
                    quantity:       row.quantity,
                    date:           row.eventDate,
                }
            }));
        });
    });
}

exports.getRegistrationAdmin = (registrationId) => {
    return new Promise((resolve, reject) => {
        const sql = 
            `SELECT 
            EventRegistration.*,
            EventRegistration.date AS registrationDate,
            Organizer.*,
            User.firstName AS userFirstName,
            User.lastName AS userLastName,
            User.email AS userEmail,
            Event.*,
            SUM(EventRegistration.quantity) AS registrationCount,
            GROUP_CONCAT(EventImage.path) AS imagePaths
        FROM EventRegistration
        JOIN User AS User ON EventRegistration.userId = User.userId
        JOIN Event ON EventRegistration.eventId = Event.eventId
        JOIN User AS Organizer ON Event.organizerId = Organizer.userId
        LEFT JOIN EventImage ON Event.eventId = EventImage.eventId
        WHERE EventRegistration.registrationId = ?
        GROUP BY Event.eventId, EventRegistration.registrationId;`;
        
        db.get(sql, [registrationId], (err, row)  => {
            if (err) return reject(err);
            if (!row) return resolve({ error: 'Registration not found' });

            resolve({
                registrationId: row.registrationId,
                event:          {
                                    eventId:            row.eventId,
                                    title:              row.title,
                                    description:        row.description,
                                    category:           row.category,
                                    date:               row.date,
                                    location:           { 
                                                            latitude:   row.latitude, 
                                                            longitude:  row.longitude
                                                        },
                                    maxParticipants:    row.maxParticipants,
                                    registrationCost:   row.registrationCost,
                                    registrationCount:  row.registrationCount || 0,
                                    organizer:          {
                                                            organizerId:    row.organizerId,
                                                            firstName:      row.firstName,
                                                            lastName:       row.lastName,
                                                            email:          row.email,
                                                            profilePicture: row.profilePicture
                                                        },
                                    imagePaths:         row.imagePaths ? row.imagePaths.split(',') : []
                                },
                user:           {
                                    firstName:      row.userFirstName,
                                    lastName:       row.userLastName,
                                    email:          row.userEmail,
                                },
                quantity:       row.quantity,
                date:           row.registrationDate
            })
        });
    });
}

exports.getRegistrationsAdmin = (filter, offset, limit) => {
    return new Promise((resolve, reject) => {
        let sql = 
            `SELECT Event.*, User.*, EventRegistration.*, Event.date AS eventDate,
                SUM(EventRegistration.quantity) AS registrationCount,
                GROUP_CONCAT(EventImage.path) AS imagePaths
            FROM EventRegistration
            JOIN User ON Event.organizerId = User.userId
            JOIN Event ON EventRegistration.eventId = Event.eventId
            LEFT JOIN EventImage ON Event.eventId = EventImage.eventId 
            ${filter ? 'WHERE Event.title LIKE ? ': ''}
            GROUP BY Event.eventId, EventRegistration.registrationId
            ORDER BY EventRegistration.date DESC`;
        
        const params = [];
    
        if (filter) params.push(`%${filter}%`);
        if (limit) {
            sql += ` LIMIT ?`;
            params.push(limit);
        }
        if (offset) {
            sql += ` OFFSET ?`;
            params.push(offset);
        }
        
        db.all(sql, params, (err, rows)  => {
            if (err) return reject(err);
            if (!rows) return resolve({ error: 'No registration found' });
            
            resolve(rows.map(row => {
                return {
                    registrationId: row.registrationId,
                    event:          {
                                        eventId:            row.eventId,
                                        title:              row.title,
                                        description:        row.description,
                                        category:           row.category,
                                        date:               row.eventDate,
                                        location:           { 
                                                                latitude:   row.latitude, 
                                                                longitude:  row.longitude
                                                            },
                                        maxParticipants:    row.maxParticipants,
                                        registrationCost:   row.registrationCost,
                                        registrationCount:  row.registrationCount || 0,
                                        organizer:          {
                                                                organizerId:    row.organizerId,
                                                                firstName:      row.firstName,
                                                                lastName:       row.lastName,
                                                                email:          row.email,
                                                                profilePicture: row.profilePicture
                                                            },
                                        imagePaths:         row.imagePaths ? row.imagePaths.split(',') : []
                                    },
                    quantity:       row.quantity,
                    date:           row.date,
                }
            }));
        });
    });
}

exports.addRegistration = (eventId, userId, quantity, date) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO EventRegistration (eventId, userId, quantity, date) VALUES (?, ?, ?, ?);`;
        
        db.run(sql, [
                eventId, 
                userId, 
                quantity,
                date
            ], 
            function (err) {
                if (err) reject(err); 
                else resolve(this.lastID);
            }
        );
    });
}

exports.deleteRegistration = (registrationId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 
            `DELETE
            FROM EventRegistration
            WHERE registrationId = ? AND userId = ?;`;
        
        db.run(sql, [
            registrationId, 
            userId
            ], 
            function (err) {
                if (err) reject(err); 
                else resolve(this.changes);
            }
        );
    });
}

exports.deleteRegistrationAdmin = (registrationId) => {
    return new Promise((resolve, reject) => {
        const sql = 
            `DELETE
            FROM EventRegistration
            WHERE registrationId = ?;`;
        
        db.run(sql, [ registrationId ], function (err) {
                if (err) reject(err); 
                else resolve(this.changes);
            }
        );
    });
}

exports.getOrganizerEvent = (eventId, organizerId) => {
    return new Promise((resolve, reject) => {
        let sql = 
            `SELECT Event.*,
                SUM(EventRegistration.quantity) AS registrationCount
            FROM Event
            LEFT JOIN EventRegistration ON Event.eventId = EventRegistration.eventId
            WHERE Event.eventId = ? AND Event.organizerId = ?
            GROUP BY Event.eventId;`;

        db.get(sql, [eventId, organizerId], (err, eventRow) => {
            if (err) return reject(err);
            if (!eventRow) return resolve({ error: 'No event found' });

            sql = 
                `SELECT EventRegistration.*, User.*
                FROM EventRegistration
                JOIN User ON EventRegistration.userId = User.userId
                WHERE EventRegistration.eventId = ?
                ORDER BY EventRegistration.date ASC;`;

            db.all(sql, [eventId], (err, registrationRows) => {
                if (err) return reject(err);

                sql = 
                    `SELECT *
                    FROM EventImage
                    WHERE eventId = ?;`;

                db.all(sql, [eventId], (err, imageRows) => {
                    if (err) return reject(err);
            
                    resolve({
                        eventId:            eventRow.eventId,
                        title:              eventRow.title,
                        description:        eventRow.description,
                        category:           eventRow.category,
                        date:               eventRow.date,
                        location:           { 
                                                latitude:   eventRow.latitude, 
                                                longitude:  eventRow.longitude
                                            },
                        maxParticipants:    eventRow.maxParticipants,
                        registrationCost:   eventRow.registrationCost,
                        registrationCount:  eventRow.registrationCount || 0,
                        imagePaths:         imageRows.length ? imageRows.map(row => row.path) : [],
                        registrations:      registrationRows.map(row => {
                                                return {
                                                    registrationId: row.registrationId,
                                                    quantity:       row.quantity,
                                                    date:           row.date,
                                                    user:           {
                                                                        userId:    row.userId, 
                                                                        firstName: row.firstName,
                                                                        lastName:  row.lastName,
                                                                        email:     row.email
                                                                    }
                                                }
                                            })
                    });
                });
            });
        });
    });
}

exports.getEvent = (eventId) => {
    return new Promise((resolve, reject) => {
        let sql = 
            `SELECT Event.*, User.*,
                SUM(EventRegistration.quantity) AS registrationCount
            FROM Event
            JOIN User ON Event.organizerId = User.userId
            LEFT JOIN EventRegistration ON Event.eventId = EventRegistration.eventId
            WHERE Event.eventId = ?
            GROUP BY Event.eventId
            ORDER BY Event.date ASC;`;

        db.get(sql, [eventId], (err, eventRow) => {
            if (err) return reject(err);
            if (!eventRow) return resolve({ error: 'No event found' });

            sql = 'SELECT * FROM EventImage WHERE eventId = ?;'

            db.all(sql, [eventId], (err, imageRows) => {
                if (err) return reject(err);

                resolve({
                    eventId:            eventRow.eventId,
                    title:              eventRow.title,
                    description:        eventRow.description,
                    category:           eventRow.category,
                    date:               eventRow.date,
                    location:           { 
                                            latitude:   eventRow.latitude, 
                                            longitude:  eventRow.longitude
                                        },
                    maxParticipants:    eventRow.maxParticipants,
                    registrationCost:   eventRow.registrationCost,
                    registrationCount:  eventRow.registrationCount || 0,
                    organizer:          {
                                            organizerId:    eventRow.organizerId,
                                            firstName:      eventRow.firstName,
                                            lastName:       eventRow.lastName,
                                            email:          eventRow.email,
                                            profilePicture: eventRow.profilePicture
                                        },
                    imagePaths:         imageRows.length ? imageRows.map(row => row.path) : []
                });
            });
        });
    });
}

exports.getEvents = (filters, offset, limit, orderBy) => {
    return new Promise((resolve, reject) => {
        const conditions = [];
        const params = [];

        let sql = 
            `SELECT Event.*, User.*, GROUP_CONCAT(EventImage.path) AS imagePaths,
                COALESCE(SUM(EventRegistration.quantity), 0) AS registrationCount`;

        if (filters && filters.latitude && filters.longitude && filters.radius) {
            sql += `, ((Event.latitude - ?) * (Event.latitude - ?) + (Event.longitude - ?) * (Event.longitude - ?)) AS distance`;
            const { latitude, longitude } = filters;
            params.push(latitude, latitude, longitude, longitude);
        }

        sql += 
            ` FROM Event
            JOIN User ON Event.organizerId = User.userId
            LEFT JOIN EventRegistration ON Event.eventId = EventRegistration.eventId
            LEFT JOIN EventImage ON Event.eventId = EventImage.eventId`;

        if (filters) {
            if (filters.title) {
                conditions.push(`Event.title LIKE ?`);
                params.push(`%${filters.title}%`);
            }

            if (filters.category) {
                conditions.push(`Event.category = ?`);
                params.push(filters.category);
            }

            if (filters.date) {
                conditions.push(`Event.date >= ?`);
                params.push(filters.date);
            }

            if (filters.latitude && filters.longitude && filters.radius) {
                const { radius } = filters;
                const radiusInDegrees = radius / 111.12; 
                conditions.push(`distance <= ? * ?`);
                params.push(radiusInDegrees, radiusInDegrees);
            }

            if (filters.registrationCost) {
                conditions.push(`Event.registrationCost <= ?`);
                params.push(filters.registrationCost);
            }

            if (filters.organizerId) {
                conditions.push(`Event.organizerId = ?`);
                params.push(filters.organizerId);
            }

            if (filters.organizer) {
                conditions.push(`(CONCAT(User.firstName, ' ', User.lastName) LIKE ? OR User.email LIKE ?)`);
                params.push(`%${filters.organizer}%`);
                params.push(`%${filters.organizer}%`);
            }

            if (filters.userId) {
                conditions.push(`EventRegistration.userId = ?`);
                params.push(filters.userId);
            }
        }

        if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;

        sql += ` GROUP BY Event.eventId`;

        const validOrderFields = ['Event.eventId', 'Event.date', 'Event.registrationCost', 'registrationCount', 'distance'];
        const defaultOrder = 'Event.date ASC';
        let orderClause = defaultOrder;

        if (orderBy && validOrderFields.includes(orderBy.field)) {
            orderClause = `${orderBy.field} ${orderBy.direction === 'DESC' ? 'DESC' : 'ASC'}`;
        }

        sql += ` ORDER BY ${orderClause}`;

        if (limit) {
            sql += ` LIMIT ?`;
            params.push(limit);
        }

        if (offset) {
            sql += ` OFFSET ?`;
            params.push(offset);
        }

        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            if (!rows) return resolve({ error: 'No event found' });

            const events = rows.map(row => {
                return {
                    eventId:            row.eventId,
                    title:              row.title,
                    category:           row.category,
                    description:        row.description,
                    date:               row.date,
                    location:           { 
                                            latitude: row.latitude, 
                                            longitude: row.longitude
                                        },
                    maxParticipants:    row.maxParticipants,
                    registrationCost:   row.registrationCost,
                    registrationCount:  row.registrationCount || 0,
                    organizer:          {
                                            organizerId:    row.organizerId,
                                            firstName:      row.firstName,
                                            lastName:       row.lastName,
                                            email:          row.email,
                                            profilePicture: row.profilePicture
                                        },
                    imagePaths:         row.imagePaths ? row.imagePaths.split(',') : []
                };
            });

            resolve(events);
        });
    });
}
