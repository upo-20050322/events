'use strict';

export default function renderOrder(order) {
    let carouselImages = '';
    for (let i = 0; i < order.event.imagePaths.length; ++i) {
        carouselImages += `
            <div class="carousel-item ${i === 0 ? 'active' : ''}">
                <div class="d-flex justify-content-center">
                    <a href="${order.event.imagePaths[i]}" data-lightbox="images">
                        <img class="d-block w-100" src="${order.event.imagePaths[i]}" alt="Slide ${i + 1}">
                    </a>
                </div>
            </div>`;
    }

    let carouselButtons = '';
    for (let i = 0; i < order.event.imagePaths.length; ++i) {
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

        const deleteRegistrationModal = `
        <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-labelledby="deleteModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="deleteModalLabel">Delete Order</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Are you sure you want to delete your order?
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
                <li class="breadcrumb-item"><a href="/user/orders">My Orders</a></li>
                <li class="breadcrumb-item active" aria-current="page">Order #${order.registrationId}</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-between">
                <div>
                    <h1>Order #${order.registrationId}</h1>
                </div>
                <div class="mt-1">
                    <div class="pt-3">
                        <p>${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(order.date))}</p>
                    </div>
                </div>
            </div>
            <hr>
            <div class="container row my-4">
                <div class="col-md-6">
                    ${order.event.imagePaths.length ? imagesSection : `<img height="300px" src="/events/default.png">`}
                </div>
                <div class="col-md-6">
                    <a href="/events/${order.event.eventId}"><h1 class="fw-bold">${order.event.title}</h1></a>
                    <br>
                    <h5>Date</h5>
                    <p><i class="bi bi-calendar-event"></i> ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(order.event.date))}</p>
                    <br>
                    <h5>Location</h5>
                    <p><i class="bi bi-geo-alt"></i> ${order.event.address.display_name}</p>
                    <br>
                    <h5>Organizer</h5>
                    <p><i class="bi bi-person-badge"></i> <a href="/user/organizer/${order.event.organizer.organizerId}">${order.event.organizer.firstName + ' ' + order.event.organizer.lastName}</a></p>
                </div>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th scope="col">Event</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><a href="/events/${order.event.eventId}">${order.event.title.length > 30 ? (order.event.title.slice(0, 30) + '...') : order.event.title}</a></td>
                        <td><i class="bi bi-currency-euro"></i></strong> ${order.event.registrationCost || 'Free'}</td>
                        <td><i class="bi bi-ticket"></i> x ${order.quantity}</td>
                        <td><strong><i class="bi bi-currency-euro"></i> ${order.event.registrationCost ? (order.event.registrationCost * order.quantity).toFixed(2) : 'Free'}</strong></td>
                    </tr>
                </tbody>
            </table>
            <div class="form-group d-flex justify-content-center my-4">
                <button id="download" class="btn btn-lg btn-primary mt-3 mx-1"><i class="bi bi-arrow-down-circle"></i> Download</button>
                <button class="btn btn-lg btn-danger mt-3 mx-1"data-bs-toggle="modal" data-bs-target="#deleteModal"><i class="bi bi-trash"></i> Delete Order</button>
            </div>
        </div>
        ${deleteRegistrationModal}
    `
}