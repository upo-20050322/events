'use strict';

const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const auth = require('../middleware/auth');
const { checkSchema } = require('express-validator');
const eventSchema = require('../validation/eventSchema');
const handleValidationErrors = require('../middleware/handleValidationErrors');
const querySchema = require('../validation/querySchema');

// Public Routes

router.post('/filter', 
    checkSchema(querySchema),
    handleValidationErrors,
    eventsController.getFilteredEvents
);

router.get('/event/:eventId', 
    eventsController.getEvent
);


// Organizers only

router.post('/new', 
    auth.isAuthenticated, 
    auth.isOrganizer, 
    checkSchema(eventSchema), 
    handleValidationErrors,
    eventsController.addEvent
);

router.put('/update/title/:eventId', 
    auth.isAuthenticated, 
    auth.isOrganizer, 
    checkSchema({ title: eventSchema.title }), 
    handleValidationErrors,
    eventsController.updateEventTitle
);

router.put('/update/description/:eventId', 
    auth.isAuthenticated, 
    auth.isOrganizer, 
    checkSchema({ description: eventSchema.description }), 
    handleValidationErrors,
    eventsController.updateEventDescription
);

router.put('/update/category/:eventId', 
    auth.isAuthenticated, 
    auth.isOrganizer, 
    checkSchema({ category: eventSchema.category }), 
    handleValidationErrors,
    eventsController.updateEventCategory
);

router.put('/update/date/:eventId', 
    auth.isAuthenticated, 
    auth.isOrganizer, 
    checkSchema({ date: eventSchema.date }), 
    handleValidationErrors,
    eventsController.updateEventDate
);

router.put('/update/location/:eventId', 
    auth.isAuthenticated, 
    auth.isOrganizer, 
    checkSchema({ latitude: eventSchema.latitude, longitude: eventSchema.longitude }), 
    handleValidationErrors,
    eventsController.updateEventLocation
);

router.put('/update/max-participants/:eventId', 
    auth.isAuthenticated, 
    auth.isOrganizer, 
    eventsController.updateEventMaxParticipants
);

router.put('/update/registration-cost/:eventId', 
    auth.isAuthenticated, 
    auth.isOrganizer, 
    checkSchema({ registrationCost: eventSchema.registrationCost }), 
    handleValidationErrors,
    eventsController.updateEventRegistrationCost
);

router.post('/images/:eventId', 
    auth.isAuthenticated, 
    auth.isOrganizer, 
    eventsController.addEventImages
);

router.delete('/images/:eventId', 
    auth.isAuthenticated, 
    auth.isOrganizer, 
    eventsController.deleteEventImage
);

router.delete('/delete/:eventId', 
    auth.isAuthenticated, 
    auth.isOrganizer, 
    eventsController.deleteEvent
);

router.get('/organizer/:eventId', 
    auth.isAuthenticated,
    auth.isOrganizer,
    eventsController.getOrganizerEvent
);

router.post('/organizer', 
    auth.isAuthenticated,
    auth.isOrganizer,
    eventsController.getOrganizerEvents
);


// Participants only

router.post('/register/:eventId', 
    auth.isAuthenticated, 
    auth.isParticipant, 
    eventsController.addEventRegistration
);

router.delete('/registrations/:registrationId', 
    auth.isAuthenticated, 
    auth.isParticipant, 
    eventsController.deleteEventRegistration
);

router.get('/registrations/:registrationId',
    auth.isAuthenticated,
    auth.isParticipant,
    eventsController.getRegistration
)

router.get('/registrations/event/:eventId',
    auth.isAuthenticated,
    auth.isParticipant,
    eventsController.getEventRegistration
)

router.post('/registrations',
    auth.isAuthenticated,
    auth.isParticipant,
    eventsController.getRegistrations
)


// Admin only

router.post('/registrations/admin',
    auth.isAuthenticated,
    auth.isAdmin,
    eventsController.getRegistrationsAdmin
)

router.get('/registrations/admin/:registrationId',
    auth.isAuthenticated,
    auth.isAdmin,
    eventsController.getRegistrationAdmin
)

router.delete('/registrations/admin/:registrationId',
    auth.isAuthenticated,
    auth.isAdmin,
    eventsController.deleteEventRegistrationAdmin
)

module.exports = router;