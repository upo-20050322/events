'use strict';

const eventsApi = {};

eventsApi.getEvent = async function (eventId) {
    const response = await fetch(`/api/events/event/${eventId}`);
    const event = await response.json();

    if (response.ok) return event;
    else throw new Error(event.error);
}

eventsApi.getFilteredEvents = async function (filters) {
    const response = await fetch('/api/events/filter', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(filters)
    });
    const events = await response.json();

    if (response.ok) return events;
    else throw new Error(events.error);
}

// Organizers only

eventsApi.addEvent = async function (form) {
    const response = await fetch('/api/events/new', { 
        method: 'POST',
        body: form
    });
    const responseJson = await response.json();

    if (response.ok) return responseJson;
    throw new Error(responseJson.error);
}

eventsApi.updateEventTitle = async function (eventId, title) {
    const response = await fetch(`/api/events/update/title/${eventId}`, { 
        method: 'PUT', 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title })    
    });

    if (!response.ok) throw new Error(await response.json());
}

eventsApi.updateEventCategory = async function (eventId, category) {
    const response = await fetch(`/api/events/update/category/${eventId}`, { 
        method: 'PUT', 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ category })    
    });

    if (!response.ok) throw new Error(await response.json());
}

eventsApi.updateEventDescription = async function (eventId, description) {
    const response = await fetch(`/api/events/update/description/${eventId}`, { 
        method: 'PUT', 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ description })    
    });

    if (!response.ok) throw new Error(await response.json());
}

eventsApi.updateEventDate = async function (eventId, date) {
    const response = await fetch(`/api/events/update/date/${eventId}`, { 
        method: 'PUT', 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ date })    
    });

    if (!response.ok) throw new Error(await response.json());
}

eventsApi.updateEventLocation = async function (eventId, location) {
    const response = await fetch(`/api/events/update/location/${eventId}`, { 
        method: 'PUT', 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(location)    
    });

    if (!response.ok) throw new Error(await response.json());
}

eventsApi.updateEventMaxParticipants = async function (eventId, maxParticipants) {
    const response = await fetch(`/api/events/update/max-participants/${eventId}`, { 
        method: 'PUT', 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ maxParticipants })    
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

eventsApi.updateEventRegistrationCost = async function (eventId, registrationCost) {
    const response = await fetch(`/api/events/update/registration-cost/${eventId}`, { 
        method: 'PUT', 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ registrationCost })    
    });

    if (!response.ok) throw new Error(await response.json());
}

eventsApi.addEventImages = async function (eventId, form) {
    const response = await fetch(`/api/events/images/${eventId}`, { 
        method: 'POST',
        body: form
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

eventsApi.deleteEventImage = async function (eventId, imageUrl) {
    const response = await fetch(`/api/events/images/${eventId}`, { 
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ imageUrl })
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

eventsApi.deleteEvent = async function (eventId) {
    const response = await fetch(`/api/events/delete/${eventId}`, { method: 'DELETE' });

    if (!response.ok) throw new Error((await response.json()).error);
}

eventsApi.getOrganizerEvent = async function (eventId) {
    const response = await fetch(`/api/events/organizer/${eventId}`);
    const event = await response.json();

    if (response.ok) return event;
    else throw new Error(event.error);
}

eventsApi.getOrganizerEvents = async function (filter) {
    const response = await fetch(`/api/events/organizer`, 
    {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(filter)
    }
);
    const events = await response.json();

    if (response.ok) return events;
    else throw new Error(events.error);
}


// Participants only

eventsApi.addEventRegistration = async function (eventId, quantity) {
    const response = await fetch(`/api/events/register/${eventId}/?quantity=${quantity}`, { method: 'POST' });
    const responseJson = await response.json();

    if (response.ok) return responseJson.registrationId;
    else throw new Error(responseJson.error);
}

eventsApi.deleteEventRegistration = async function (registrationId) {
    const response = await fetch(`/api/events/registrations/${registrationId}`, { method: 'DELETE' });

    if (!response.ok) throw new Error((await response.json()).error);
}

eventsApi.getRegistration = async function (registrationId) {
    const response = await fetch(`/api/events/registrations/${registrationId}`);
    const responseJson = await response.json();

    if (response.ok) return responseJson;
    else throw new Error(responseJson.error);
}

eventsApi.getEventRegistration = async function (eventId) {
    const response = await fetch(`/api/events/registrations/event/${eventId}`);
    const responseJson = await response.json();

    if (response.ok) return responseJson;
    else throw new Error(responseJson.error);
}

eventsApi.getRegistrations = async function (filter, offset, limit) {
    const response = await fetch(`/api/events/registrations`, 
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(filter, offset, limit)
        }
    );
    const responseJson = await response.json();

    if (response.ok) return responseJson;
    else throw new Error(responseJson.error);
}

export default eventsApi;