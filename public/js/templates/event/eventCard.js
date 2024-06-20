'use strict';

export default function (event) {
    const address = event.address.address;

    return `
        <div class="col-md-3">
            <a class="text-decoration-none card event-card my-3 animated fadeIn" href="/events/${event.eventId}">
                <img src="${event.imagePaths.length > 0 ? event.imagePaths[0] : '/events/default.png'}" alt="Event" class="card-img-top registration-image">
                <div class="card-body">
                    <h5 class="card-title">${event.title.length > 30 ? (event.title.slice(0, 30) + '...') : event.title}</h5>
                    <p class="card-text">${event.description.length > 30 ? (event.description.slice(0, 30) + '...') : event.description}</p>
                    <p class="card-text"><p><i class="bi bi-tag"></i> ${event.category}</p></p>
                    <p class="card-text"><strong><i class="bi bi-calendar-event"></i></strong> ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(new Date(event.date))}</p>
                    <p class="card-text"><strong><i class="bi bi-geo-alt"></i></strong> ${address.city || address.town || address.village}</p>
                    <p class="card-text"><strong><i class="bi bi-currency-euro"></i></strong> ${event.registrationCost ? event.registrationCost.toFixed(2) : 'Free'}</p>
                    <p class="card-text"><strong><i class="bi bi-person-badge"></i></strong> ${event.organizer.firstName + ' ' + event.organizer.lastName}</p>
                </div>
            </a>
        </div>
    `
}