'use strict';

import page from '//unpkg.com/page/page.mjs';
import getUser from './middleware/getUser.js';
import indexController from './controllers/indexController.js';
import authController from './controllers/authController.js';
import notFound from './middleware/notFound.js';
import userController from './controllers/userController.js';
import auth from './middleware/auth.js';
import transition from './middleware/transition.js';
import eventController from './controllers/eventController.js';
import getPosition from './middleware/getPosition.js';
import adminController from './controllers/adminController.js';

page(getUser);

page(getPosition);


// No page transition

page('/auth/logout', 
    auth.isAuthenticated,
    authController.logout
);

page(transition);


// Admin

page('/admin/events', 
    auth.isAuthenticated,
    auth.isAdmin,
    adminController.events
);

page('/admin/events/new', 
    auth.isAuthenticated,
    auth.isAdmin,
    adminController.createEvent
);

page('/admin/events/:eventId', 
    auth.isAuthenticated,
    auth.isAdmin,
    adminController.event
);

page('/admin/events/update/:eventId', 
    auth.isAuthenticated,
    auth.isAdmin,
    adminController.updateEvent
);

page('/admin/users', 
    auth.isAuthenticated,
    auth.isAdmin,
    adminController.users
);

page('/admin/users/:userId', 
    auth.isAuthenticated,
    auth.isAdmin,
    adminController.user
);

page('/admin/users/update/:userId', 
    auth.isAuthenticated,
    auth.isAdmin,
    adminController.updateUser
);

page('/admin/orders', 
    auth.isAuthenticated,
    auth.isAdmin,
    adminController.orders
);

page('/admin/orders/:orderId', 
    auth.isAuthenticated,
    auth.isAdmin,
    adminController.order
);

page('/admin/logs',
    auth.isAuthenticated,
    auth.isAdmin,
    adminController.logs
);

page(auth.isNotAdmin);


// Index

page('/', 
    indexController.index
);

page('/about', 
    indexController.about
);

page('/faqs', 
    indexController.faqs
);


// Auth

page('/auth/login/', 
    auth.isNotAuthenticated,
    authController.login
);

page('/auth/register', 
    auth.isNotAuthenticated,
    authController.register
);


// User

page('/user/profile', 
    auth.isAuthenticated,
    userController.userProfile
);

page('/user/profile/update', 
    auth.isAuthenticated,
    userController.updateUserProfile
);

page('/user/organizer/:organizerId', 
    userController.organizerProfile
);

page('/user/orders', 
    auth.isAuthenticated,
    auth.isParticipant,
    userController.orders
);

page('/user/orders/:orderId', 
    auth.isAuthenticated,
    auth.isParticipant,
    userController.order
);

page('/user/events', 
    auth.isAuthenticated,
    auth.isOrganizer,
    userController.events
);

page('/user/events/:eventId', 
    auth.isAuthenticated,
    auth.isOrganizer,
    userController.event
);


// Event

page('/events', 
    eventController.events
);

page('/events/search',
    eventController.search
);

page('/events/categories',
    eventController.categories
);

page('/events/create',
    auth.isAuthenticated,
    eventController.createEvent
);

page('/events/update/:eventId',
    auth.isAuthenticated,
    auth.isOrganizer,
    eventController.updateEvent
);

page('/events/:eventId', 
    eventController.event
);


// 404

page(notFound);

page();