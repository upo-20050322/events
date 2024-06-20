'use strict';

export default function renderOrder(event) {
    let carouselImages = '';
    for (let i = 0; i < event.imagePaths.length; ++i) {
        carouselImages += `
        <div class="carousel-item ${i === 0 ? 'active' : ''}">
            <div class="d-flex justify-content-center">
                <a href="${event.imagePaths[i]}" data-lightbox="images">
                    <img class="d-block w-100" src="${event.imagePaths[i]}" alt="Slide ${i + 1}">
                </a>
            </div>
        </div>`;
    }

    let carouselButtons = '';
    for (let i = 0; i < event.imagePaths.length; ++i) {
        carouselButtons += `
            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${i}" class="${i === 0 ? 'active' : ''}" aria-current="${i === 0}" aria-label="Slide ${i}"></button>`;
    }

    const imagesSection = `
        <div id="carouselExampleIndicators" class="carousel slide bg-secondary">
            <div class="carousel-indicators">
                ${carouselButtons}
            </div>
            <div class="carousel-inner">
                ${carouselImages}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>`;

        const deleteEventModal = `
        <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-labelledby="deleteModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="deleteModalLabel">Delete Event</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Are you sure you want to delete your event?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="delete" data-bs-dismiss="modal">Delete</button>
                    </div>
                </div>
            </div>
        </div>`

    return `
        <div class="container-xxl">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb pb-3">
                <li class="breadcrumb-item"><a href="/user/events">My Events</a></li>
                <li class="breadcrumb-item active" aria-current="page">${event.title.length > 30 ? (event.title.slice(0, 30) + '...') : event.title}</li>
                </ol>
            </nav>
            <div class="container row my-4">
                <div class="col-md-6">
                    ${event.imagePaths.length ? imagesSection : `<img height="300px" src="/events/default.png">`}
                </div>
                <div class="col-md-6">
                    <a href="/events/${event.eventId}"><h1 class="fw-bold">${event.title}</h1></a>
                    <br>
                    <h5>Date</h5>
                    <p><i class="bi bi-calendar-event"></i> ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(event.date))}</p>
                    <h5>Location</h5>
                    <p><i class="bi bi-geo-alt"></i> ${event.address.display_name}</p>
                    <h5>Registrations</h5>
                    <p><i class="bi bi-ticket"></i> x ${event.registrationCount}</p>
                    <h5>Total</h5>
                    <p><strong><i class="bi bi-currency-euro"></i> ${event.registrationCost ? (event.registrationCost * event.registrationCount).toFixed(2) : 'Free'}</strong>
                </div>
            </div>
            <div class="form-group d-flex justify-content-center my-4">
                <button id="download" class="btn btn-lg btn-primary mt-3 mx-1"><i class="bi bi-arrow-down-circle"></i> Download</button>
                <button id="edit" class="btn btn-lg btn-outline-primary mt-3 mx-1"><i class="bi bi-pencil-fill"></i> Edit</button>
                <button class="btn btn-lg btn-danger mt-3 mx-1"data-bs-toggle="modal" data-bs-target="#deleteModal"><i class="bi bi-trash"></i> Delete Event</button>
            </div>
            <div class="scrollable-div overflow-auto p-3 border rounded ${!event.registrations.length ? 'd-none' : ''}">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Registration ID</th>
                            <th scope="col">First Name</th>
                            <th scope="col">Last Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${event.registrations.reduce((html, registration, index) => html += `
                        <tr>
                            <th scope="row">${index + 1}</th>
                            <td>${registration.registrationId}</td>
                            <td>${registration.user.firstName}</td>
                            <td>${registration.user.lastName}</td>
                            <td>${registration.user.email}</td>
                            <td><i class="bi bi-ticket"></i> x ${registration.quantity}</td>
                            <td>${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(registration.date))}</td>
                        </tr>
                        `, '')}
                    </tbody>
                </table>
            </div>
        </div>
        ${deleteEventModal}
    `
}