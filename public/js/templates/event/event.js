'use strict';

import renderOrganizerCard from './organizerCard.js';

export default function renderEvent(event, user) {
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

    const eventDetails = `
        <h1 class="fw-bold">${event.title}</h1>
        <h4>${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(new Date(event.date))}</h4>
        <hr>
        <p>${event.description}</p>
        <br>
        <h5>Category</h5>
        <p><i class="bi bi-tag"></i> ${event.category}</p>
        <br>
        <h5>Date</h5>
        <p><i class="bi bi-calendar-event"></i> ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(event.date))}</p>
        <br>
        <h5>Location</h5>
        <p><i class="bi bi-geo-alt"></i> ${event.address.display_name}</p>
        <div id="map" class="rounded"></div>
        <br>
        <br>
        <h5 class="mb-3">Organizer</h5>
        <div class="organizer-details">
            ${renderOrganizerCard(event.organizer)}
        </div>`;

    const checkoutSection = `
    <div class="card">
        <div class="card-body m-3">
            <h4 class="card-title fw-bold">${event.title}</h4>
            <p><strong><i class="bi bi-currency-euro"></i> ${event.registrationCost ? event.registrationCost.toFixed(2) : 'Free'}</strong></p>
            ${(user && user.role === 'organizer' && user.userId === event.organizer.organizerId) ? 
            `<div class="row justify-content-center my-2">
                    <a href="/events/update/${event.eventId}" class="btn btn-primary col-5 m-2"><i class="bi bi-pencil-square"></i> Edit Event</a>
                    <button type="button" class="btn btn-danger col-5 m-2" data-bs-toggle="modal" data-bs-target="#deleteModal"><i class="bi bi-trash"></i> Delete Event</button>
            </div>` 
            :
            `<div ${event.maxParticipants && event.registrationCount >= event.maxParticipants || (user && user.role === 'organizer') || new Date(event.date).getTime() < Date.now() ? 'class="d-none"' : ''}>
                <div class="row">
                    <div class="d-flex justify-content-center col-4">
                        <button id="minus" class="btn btn-sm btn-secondary my-3 mx-1 disabled"><i class="bi bi-dash"></i></button>
                        <span id="quantity" class="mx-2 mt-3 pt-1">1</span>
                        <button id="plus" class="btn btn-sm btn-secondary my-3 mx-1"><i class="bi bi-plus"></i></button>
                    </div>
                        ${event.maxParticipants ? 
                    `<div class="col-8 mt-3 pt-1">
                            <p>Only ${event.maxParticipants - event.registrationCount} left</p>
                    </div>
                </div>
                <div class="row mx-5">
                    ${user ? 
                        `<button id="checkout" class="btn btn-primary mt-3" ${event.registrationCost ? 'data-bs-toggle="modal" data-bs-target="#checkoutModal"' : ''}><i class="bi bi-cart"></i> Check Out</button>`
                        :
                        `<a id="checkout" href="/auth/login/?redirect=/events/${event.eventId}" class="btn btn-primary mt-3""><i class="bi bi-cart"></i> Check Out</a>`
                    }
                </div>
                    ` 
                        : `
                    <div class="col-8">
                    ${user ? 
                        `<button id="checkout" class="btn btn-primary mt-3" ${event.registrationCost ? 'data-bs-toggle="modal" data-bs-target="#checkoutModal"' : ''}><i class="bi bi-cart"></i> Check Out</button>`
                        :
                        `<a id="checkout" href="/auth/login/?redirect=/events/${event.eventId}" class="btn btn-primary mt-3""><i class="bi bi-cart"></i> Check Out</a>`
                    }
                    </div>
                </div>
                        `}
            </div>
            ${event.maxParticipants && event.registrationCount >= event.maxParticipants ? '<p><i class="bi bi-person-standing"></i> Max participants reached for this event</p>' : ''}
            ${new Date(event.date).getTime() < Date.now() ? '<p><i class="bi bi-calendar-check"></i> Event already took place</p>' : ''}
        </div>
    </div>`}`;

    const deleteEventModal = `
        <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-labelledby="deleteModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="deleteModalLabel">Delete User Profile</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Are you sure you want to delete your event?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="delete-event-button" data-bs-dismiss="modal">Delete</button>
                    </div>
                </div>
            </div>
        </div>`

    const checkoutModal = `
        <div class="modal fade" id="checkoutModal" tabindex="-1" role="dialog" aria-labelledby="checkoutModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="checkoutModalLabel">Check Out</h5>
                        <button id="close-checkout-modal" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="checkout-form">
                            <div class="form-group">
                                <label class="mt-3" for="card-holder-name">Cardholder Name</label>
                                <input type="text" class="form-control" id="card-holder-name" placeholder="Enter cardholder name" required>
                            </div>
                            <div class="form-group">
                                <label class="mt-3" for="card-number">Card Number</label>
                                <input type="text" minlength="19" maxlength="19" class="form-control card-logo" id="card-number" placeholder="Enter card number" required>
                            </div>
                            <div class="form-group">
                                <label class="mt-3" for="expiration-date">Expiration Date</label>
                                <input type="text" minlength="5" maxlength="5" class="form-control" id="expiration-date" placeholder="MM/YY" required>
                            </div>
                            <div class="form-group">
                                <label class="mt-3" for="cvv">CVV</label>
                                <input type="text" maxlength="3" maxlength="3" class="form-control" id="cvv" placeholder="Enter CVV" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer mt-2">
                        <button id="cancel-button" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button id="payment-button" type="button" class="btn btn-primary">Submit Payment</button>
                    </div>
                </div>
            </div>
        </div>`;

    const html = `
        <div class="container-xxl px-md-5">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb pb-3">
                  <li class="breadcrumb-item"><a href="/events">Events</a></li>
                  <li class="breadcrumb-item active" aria-current="page">${event.title}</li>
                </ol>
            </nav>
            <div class="row">
                <div class="col-md-12">
                    ${imagesSection}
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-md-8">
                    <div class="event-details">
                        ${eventDetails}
                    </div>
                </div>
                <div class="col-md-4">
                    <div class=" sticky-top">
                        ${checkoutSection}
                    </div>
                </div>
            </div>
        </div>
        ${deleteEventModal}
        ${checkoutModal}`;

    return html;
}
