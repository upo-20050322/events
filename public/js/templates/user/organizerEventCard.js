'use strict';

export default function (event) {
    return `
        <div class="col-md-3">
            <a class="text-decoration-none card event-card my-3 animated fadeIn" href="/user/events/${event.eventId}">
                <img src="${event.imagePaths.length > 0 ? event.imagePaths[0] : '/events/default.png'}" alt="Registration 1" class="card-img-top registration-image">
                <div class="card-body">
                    <h5 class="card-title mb-3">${event.title.length > 30 ? (event.title.slice(0, 30) + '...') : event.title}</h5>
                    <p class="card-text"><i class="bi bi-calendar-event"></i> ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(event.date))}</p>
                    <p class="card-text"><i class="bi bi-ticket"></i> x ${event.registrationCount}</p>
                    <hr>
                    <p class="card-text"><strong><i class="bi bi-currency-euro"></i> ${event.registrationCost ? (event.registrationCost * event.registrationCount).toFixed(2) : 'Free'}</strong></p>
                </div>
            </a>
        </div>
    `
}