'use strict';

const userDAO = require('../models/userDAO');
const eventDAO = require('../models/eventDAO');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');

exports.addEvent = async (req, res, next) => {
    try {
        const { title, description, category, date, latitude, longitude, registrationCost } = req.body;
        const maxParticipants = (isNaN(req.body.maxParticipants) || req.body.maxParticipants < 0) ? null : req.body.maxParticipants;

        if (new Date(date).getTime() < Date.now()) {
            res.status(400);
            return next(new Error('Event date must be in the future'));
        }

        if (req.files && Object.keys(req.files).length !== 0 && req.files.images) {

            const images = (Array.isArray(req.files.images)) ? req.files.images : [req.files.images];
            const allowedExtensions = ['.jpg', '.jpeg', '.png'];

            if (images.length > 10) {
                res.status(400);
                return next(new Error('Only 10 images per event are allowed'));
            }

            for (const image of images) {
                const fileExtension = path.extname(image.name);

                if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
                    res.status(400);
                    return next(new Error('Only .jpg, .jpeg and .png files are allowed'));
                }
            }
        }

        const eventId = await eventDAO.addEvent(
            req.user.userId,
            title,
            description,
            category,
            date,
            { latitude, longitude },
            maxParticipants,
            registrationCost
        );

        if (!req.files || Object.keys(req.files).length === 0 || !req.files.images) return res.status(201).json({ eventId });

        const images = (Array.isArray(req.files.images)) ? req.files.images : [req.files.images];

        images.forEach(image => {
            const imagePath = '/events/' + uuid.v4() + path.extname(image.name);
            image.mv(path.join(__dirname, '/../../upload', imagePath), async (err) => {
                if (err) return next(err);
                
                await eventDAO.addImage(eventId, imagePath);
            });
        });

        res.status(201).json({ eventId });
    } catch (error) {
        res.status(400);
        return next(error);
    }
};

exports.updateEventTitle = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        if (isNaN(eventId)) {
            res.status(400);
            return next(new Error('Event Id is not valid'));
        }
    
        const event = await eventDAO.getEvent(eventId);
        if (event.error) {
            res.status(404);
            return next(new Error('Event not found'));
        }
    
        if (event.organizer.organizerId !== req.user.userId && req.user.role !== 'administrator') {
            res.status(403);
            return next(new Error('Forbidden'));
        }

        const title = req.body.title;
        await eventDAO.updateEventTitle(eventId, title);
        
        res.sendStatus(200);
    } catch (error) {
        res.status(400);
        return next(error);
    }
};

exports.updateEventDescription = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        if (isNaN(eventId)) {
            res.status(400);
            return next(new Error('Event Id is not valid'));
        }
    
        const event = await eventDAO.getEvent(eventId);
        if (event.error) {
            res.status(404);
            return next(new Error('Event not found'));
        }
    
        if (event.organizer.organizerId !== req.user.userId && req.user.role !== 'administrator') {
            res.status(403);
            return next(new Error('Forbidden'));
        }

        const description = req.body.description;
        await eventDAO.updateEventDescription(eventId, description);
        
        res.sendStatus(200);
    } catch (error) {
        res.status(400);
        return next(error);
    }
};

exports.updateEventCategory = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        if (isNaN(eventId)) {
            res.status(400);
            return next(new Error('Event Id is not valid'));
        }
    
        const event = await eventDAO.getEvent(eventId);
        if (event.error) {
            res.status(404);
            return next(new Error('Event not found'));
        }
    
        if (event.organizer.organizerId !== req.user.userId && req.user.role !== 'administrator') {
            res.status(403);
            return next(new Error('Forbidden'));
        }

        const category = req.body.category;
        await eventDAO.updateEventCategory(eventId, category);
        
        res.sendStatus(200);
    } catch (error) {
        res.status(400);
        return next(error);
    }
};

exports.updateEventDate = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        if (isNaN(eventId)) {
            res.status(400);
            return next(new Error('Event Id is not valid'));
        }
    
        const event = await eventDAO.getEvent(eventId);
        if (event.error) {
            res.status(404);
            return next(new Error('Event not found'));
        }
    
        if (event.organizer.organizerId !== req.user.userId && req.user.role !== 'administrator') {
            res.status(403);
            return next(new Error('Forbidden'));
        }

        const date = req.body.date;
        if (req.user.role !== 'administrator' && new Date(date).getTime() < Date.now() + 24 * 60 * 60 * 1000) {
            res.status(400);
            return next(new Error('Event date be at least 24 hours or more in the future from the current time'));
        }

        await eventDAO.updateEventDate(eventId, date);
        
        res.sendStatus(200);
    } catch (error) {
        res.status(400);
        return next(error);
    }
};

exports.updateEventLocation = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        if (isNaN(eventId)) {
            res.status(400);
            return next(new Error('Event Id is not valid'));
        }
    
        const event = await eventDAO.getEvent(eventId);
        if (event.error) {
            res.status(404);
            return next(new Error('Event not found'));
        }
    
        if (event.organizer.organizerId !== req.user.userId && req.user.role !== 'administrator') {
            res.status(403);
            return next(new Error('Forbidden'));
        }

        const location = { latitude: req.body.latitude, longitude: req.body.longitude };
        await eventDAO.updateEventLocation(eventId, location);
        
        res.sendStatus(200);
    } catch (error) {
        res.status(400);
        return next(error);
    }
};

exports.updateEventMaxParticipants = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        if (isNaN(eventId)) {
            res.status(400);
            return next(new Error('Event Id is not valid'));
        }
    
        const event = await eventDAO.getEvent(eventId);
        if (event.error) {
            res.status(404);
            return next(new Error('Event not found'));
        }
    
        if (event.organizer.organizerId !== req.user.userId && req.user.role !== 'administrator') {
            res.status(403);
            return next(new Error('Forbidden'));
        }

        const maxParticipants = req.body.maxParticipants;
        if (maxParticipants !== null && (isNaN(maxParticipants) || Number(maxParticipants) < 0)) {
            res.status(400);
            return next(new Error('Max Participants must be a number greater than zero'));
        }

        if (maxParticipants !== null && maxParticipants < event.registrationCount) {
            res.status(400);
            return next(new Error(`Max Participants must be equal or greater than the registrations count for this event`));
        }

        await eventDAO.updateEventMaxParticipants(eventId, maxParticipants);
        
        res.sendStatus(200);
    } catch (error) {
        res.status(400);
        return next(error);
    }
};

exports.updateEventRegistrationCost = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        if (isNaN(eventId)) {
            res.status(400);
            return next(new Error('Event Id is not valid'));
        }
    
        const event = await eventDAO.getEvent(eventId);
        if (event.error) {
            res.status(404);
            return next(new Error('Event not found'));
        }
    
        if (event.organizer.organizerId !== req.user.userId && req.user.role !== 'administrator') {
            res.status(403);
            return next(new Error('Forbidden'));
        }

        const registrationCost = req.body.registrationCost;
        await eventDAO.updateEventRegistrationCost(eventId, registrationCost);
        
        res.sendStatus(200);
    } catch (error) {
        res.status(400);
        return next(error);
    }
};

exports.deleteEvent = async (req, res, next) => {
    
    try {
        const eventId = req.params.eventId;
        if (isNaN(eventId)) {
            res.status(400);
            return next(new Error('Event Id is not valid'));
        }
    
        const event = await eventDAO.getEvent(eventId);
        if (event.error) {
            res.status(404);
            return next(new Error('Event not found'));
        }
    
        if (event.organizer.organizerId !== req.user.userId && req.user.role !== 'administrator') {
            res.status(403);
            return next(new Error('Forbidden'));
        }

        event.imagePaths.forEach(imagePath => {
            fs.unlink(path.join(__dirname, '/../../upload', imagePath), (err) => {
                if (err) return next(err);
            });
        });

        await eventDAO.deleteEvent(eventId);
        res.sendStatus(200);

    } catch (error) {
        res.status(400);
        return next(error);
    }
};

exports.addEventImages = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        if (isNaN(eventId)) {
            res.status(400);
            return next(new Error('Event Id is not valid'));
        }

        const event = await eventDAO.getEvent(eventId);
        if (event.error) {
            res.status(404);
            return next(new Error('Event not found'));
        }

        if (event.organizer.organizerId !== req.user.userId && req.user.role !== 'administrator') {
            res.status(403);
            return next(new Error('Forbidden'));
        }

        if (!req.files || Object.keys(req.files).length === 0 || !req.files.images) {
            res.status(400);
            return next(new Error('No files were uploaded'));
        }

        const images = (Array.isArray(req.files.images)) ? req.files.images : [req.files.images];
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        
        if (images.length + event.imagePaths.length >= 10) {
            res.status(400);
            return next(new Error('Only 10 images per event are allowed'));
        }

        for (const image of images) {
            const fileExtension = path.extname(image.name);
            if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
                res.status(400);
                return next(new Error('Only .jpg, .jpeg and .png files are allowed'));
            }
        }

        images.forEach(image => {
            const imagePath = '/events/' + uuid.v4() + path.extname(image.name);
            image.mv(path.join(__dirname, '/../../upload', imagePath), async (err) => {
                if (err) return next(err);
                
                await eventDAO.addImage(eventId, imagePath);
            });
        });

        res.sendStatus(200);
    } catch (error) {
        res.status(400);
        return next(error);
    }
};

exports.deleteEventImage = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        if (isNaN(eventId)) {
            res.status(400);
            return next(new Error('Event Id is not valid'));
        }

        const event = await eventDAO.getEvent(eventId);
        if (event.error) {
            res.status(404);
            return next(new Error('Event not found'));
        }

        if (event.organizer.organizerId !== req.user.userId && req.user.role !== 'administrator') {
            res.status(403);
            return next(new Error('Forbidden'));
        }

        const imagePath = req.body.imageUrl;
        if (!event.imagePaths.includes(imagePath)) {
            res.status(404);
            return next(new Error('Event Image not found'));
        }

        fs.unlink(path.join(__dirname, '/../../upload', imagePath), async (err) => {
            if (err) return next(err);

            await eventDAO.deleteImage(eventId, imagePath);
        });

        res.sendStatus(200);
    } catch (error) {
        res.status(400);
        return next(error);
    }
};

exports.addEventRegistration = async (req, res, next) => {
    const user = req.user;
    const eventId = req.params.eventId;
    const quantity = Number(req.body.quantity || req.query.quantity);

    if (isNaN(eventId)) {
        res.status(400);
        return next(new Error('Event Id is not valid'));
    }

    if (isNaN(quantity) || quantity < 1) {
        res.status(400);
        return next(new Error('Quantity is not valid'));
    }

    const event = await eventDAO.getEvent(eventId);
    if (event.error) {
        res.status(404);
        return next(new Error('Event not found'));
    }

    if (new Date(event.date).getTime() <= Date.now()) {
        res.status(400);
        return next(new Error('Event already took place'));
    }

    if (event.maxParticipants && event.registrationCount + quantity > event.maxParticipants) {
        res.status(400);
        return next(new Error('Max Participants reached for this event'));
    }

    try {
        const registrationId = await eventDAO.addRegistration(event.eventId, user.userId, quantity, new Date().toISOString());
        res.status(200).json({ registrationId });
    } catch (error) {
        res.status(400);
        return next(error);
    }
}

exports.deleteEventRegistration = async (req, res, next) => {
    const user = req.user;
    const registrationId = req.params.registrationId;

    if (isNaN(registrationId)) {
        res.status(400);
        return next(new Error('Event Id is not valid'));
    }

    const registration = await eventDAO.getRegistration(registrationId, req.user.userId);
    if (registration.error) {
        res.status(404);
        return next(new Error('Registration not found'));
    }

    if (new Date(registration.event.date).getTime() - Date.now() <= 24 * 60 * 60 * 1000) {
        res.status(400);
        return next(new Error('Registrations can be deleted until 24 hours before the event'));
    }

    try {
        await eventDAO.deleteRegistration(registrationId, user.userId);
        res.sendStatus(200);
    } catch (error) {
        res.status(400);
        return next(error);
    }
}

exports.getRegistration = async (req, res, next) => {
    try {
        const registrationId = req.params.registrationId;
        if (isNaN(registrationId)) {
            res.status(400);
            return next(new Error('Registration Id is not valid'));
        }
    
        const registration = await eventDAO.getRegistration(registrationId, req.user.userId);
        if (registration.error) {
            res.status(404);
            return next(new Error('Registration not found'));
        }
    
        res.status(200).json(registration);
    } catch (error) {
        res.status(400);
        return next(error);
    }
}

exports.getEventRegistration = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        if (isNaN(eventId)) {
            res.status(400);
            return next(new Error('Event Id is not valid'));
        }
    
        const registration = await eventDAO.getEventRegistration(eventId, req.user.userId);
        if (registration.error) {
            res.status(404);
            return next(new Error('Registration not found'));
        }
    
        res.status(200).json(registration);
    } catch (error) {
        res.status(400);
        return next(error);
    }
}

exports.getRegistrations = async (req, res, next) => {
    try {
        const registrations = await eventDAO.getRegistrations(req.user.userId, req.body.filter, req.body.offset, req.body.limit);
        if (registrations.error) {
            res.status(404);
            return next(new Error('No registrations found'));
        }
    
        res.status(200).json(registrations);
    } catch (error) {
        res.status(400);
        return next(error);
    }
}

exports.getRegistrationAdmin = async (req, res, next) => {
    try {
        const registrationId = req.params.registrationId;
        if (isNaN(registrationId)) {
            res.status(400);
            return next(new Error('Registration Id is not valid'));
        }
    
        const registration = await eventDAO.getRegistrationAdmin(registrationId);
        if (registration.error) {
            res.status(404);
            return next(new Error('Registration not found'));
        }
    
        res.status(200).json(registration);
    } catch (error) {
        res.status(400);
        return next(error);
    }
}

exports.getRegistrationsAdmin = async (req, res, next) => {
    try {
        const registrations = await eventDAO.getRegistrationsAdmin(req.body.filter, req.body.offset, req.body.limit);
        if (registrations.error) {
            res.status(404);
            return next(new Error('No registrations found'));
        }
    
        res.status(200).json(registrations);
    } catch (error) {
        res.status(400);
        return next(error);
    }
}

exports.deleteEventRegistrationAdmin = async (req, res, next) => {
    const registrationId = req.params.registrationId;

    if (isNaN(registrationId)) {
        res.status(400);
        return next(new Error('Event Id is not valid'));
    }

    const registration = await eventDAO.getRegistrationAdmin(registrationId);
    if (registration.error) {
        res.status(404);
        return next(new Error('Registration not found'));
    }

    try {
        await eventDAO.deleteRegistrationAdmin(registrationId);
        res.sendStatus(200);
    } catch (error) {
        res.status(400);
        return next(error);
    }
}

exports.getOrganizerEvent = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        if (isNaN(eventId)) {
            res.status(400);
            return next(new Error('Event Id is not valid'));
        }
    
        const event = await eventDAO.getOrganizerEvent(eventId, req.user.role === 'administrator' ? (await eventDAO.getEvent(eventId)).organizer.organizerId : req.user.userId);
        if (event.error) {
            res.status(404);
            return next(new Error('Event not found'));
        }
    
        res.status(200).json(event);
    } catch (error) {
        res.status(400);
        return next(error);
    }
}

exports.getOrganizerEvents = async (req, res, next) => {
    req.body.filters = { organizerId: req.user.userId }
    if (req.body.filter) req.body.filters.title = req.body.filter;
    req.body.orderBy = {
        field: 'Event.date',
        direction: 'DESC'
    }
    return this.getFilteredEvents(req, res, next);
}

exports.getEvent = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        if (isNaN(eventId)) {
            res.status(400);
            return next(new Error('Event Id is not valid'));
        }
    
        const event = await eventDAO.getEvent(eventId);
        if (event.error) {
            res.status(404);
            return next(new Error('Event not found'));
        }
    
        res.status(200).json(event);
    } catch (error) {
        res.status(400);
        return next(error);
    }
}

exports.getFilteredEvents = async (req, res, next) => {
    try {
        if (req.body.filters && req.body.filters.userId) {
            const userId = Number(req.body.filters.userId);
            if (isNaN(userId)) {
                res.status(400);
                return next(new Error('User Id is not valid'));
            }

            if (!req.isAuthenticated() && (req.user.userId !== userId || req.user.role !== 'administrator')) {
                res.status(401);
                return next(new Error('Unauthorized'));
            }
        }

        if (req.body.filters && req.body.filters.organizerId) {
            const organizerId = req.body.filters.organizerId;
            if (isNaN(organizerId)) {
                res.status(400);
                return next(new Error('Organizer Id is not valid'));
            }

            const organizer = await userDAO.getUserById(organizerId);
            if (organizer.error || (organizer.role !== 'organizer' && organizer.role !== 'administrator')) {
                res.status(404);
                return next(new Error('Organizer not found'));
            }
        }

        const events = await eventDAO.getEvents(req.body.filters, req.body.offset, req.body.limit, req.body.orderBy);
        if (events.error) {
            res.status(404);
            return next(new Error('No event found'));
        }
    
        res.status(200).json(events);
    } catch (error) {
        res.status(400);
        return next(error);
    }
} 
