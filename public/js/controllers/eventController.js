'use strict';

import page from '//unpkg.com/page/page.mjs';
import { renderNavbar, addSearchBarEventListener } from "../templates/partials/navbar.js";
import renderEvents from '../templates/event/events.js';
import renderEvent from '../templates/event/event.js';
import renderCreateEvent from '../templates/event/createEvent.js';
import renderEventCard from '../templates/event/eventCard.js';
import renderFooter from '../templates/partials/footer.js';
import renderSearch from '../templates/event/search.js';
import eventsApi from "../api/eventsApi.js";
import usersApi from "../api/usersApi.js";
import osmApi from "../api/osmApi.js";
import renderCategories from "../templates/event/categories.js";
import renderUpdateEvent from '../templates/event/updateEvent.js';

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    return formattedDate;
}


const eventController = {};

eventController.events = async function (ctx, next) {
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    document.getElementById('main').innerHTML = renderEvents();
    document.getElementById('footer').innerHTML = renderFooter();

    const eventsRow = document.getElementById('city-events');
    const filtersRow = document.getElementById('filters');
    const pagination = document.getElementById('pagination')
    const paginationBack = document.getElementById('pagination-back');
    const paginationNext = document.getElementById('pagination-next');
    const paginationBackListItem = document.getElementById('pagination-back-li');
    const paginationCurrent = document.getElementById('pagination-current');
    const dropdownItems = document.querySelectorAll('.dropdown-menu .dropdown-item');

    const searchParams = new URLSearchParams(ctx.querystring);
    if (!searchParams.get('date')) searchParams.append('date', formatDate(new Date()));
    if (!searchParams.get('radius')) searchParams.append('radius', 500);
    if (searchParams.get('organizerId')) {
        try {
            const organizer = await usersApi.getOrganizer(searchParams.get('organizerId'));
            searchParams.delete('organizer');
            searchParams.append('organizer', organizer.email);
        } catch (error) {
        } finally {
            searchParams.delete('organizerId');
        }
    }
    
    const filters = {};
    for (const [key, value] of searchParams) filters[key] = value;

    const latitude = searchParams.get('latitude') || ctx.latitude || 45.4641943; // Milano
    const longitude = searchParams.get('longitude') || ctx.longitude || 9.1896346;

    try {
        const location = await osmApi.getAddress(latitude, longitude);
        let city = location.address.city || location.address.town || location.address.village || location.display_name;
        document.getElementById('city-events-title').insertAdjacentHTML('afterbegin', `<h2>Events in <a href="/events/search?focus=location&address=${location.display_name}&${searchParams.toString()}" class="text-decoration-none">${city}<i class="bi bi-geo-alt-fill"></i></a></h2>`);

        document.getElementById('navbar-searchbar').addEventListener('click', () => page(`/events/search/?${searchParams.toString()}&address=${location.display_name}`));

        searchParams.forEach(async (value, key) => {
            let filter;
            
            switch (key) {
                case 'title': 
                    filter = `<i class="bi bi-vector-pen"></i> Title`;
                    break; 
                case 'category': 
                    filter = `<i class="bi bi-tag"></i> Category`;
                    break; 
                case 'date': 
                    filter = `<i class="bi bi-calendar-event"></i> Date`;
                    value = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(new Date(value));
                    break; 
                case 'registrationCost': 
                    filter = `<i class="bi bi-wallet-2"></i> Price`;
                    value = `Max <i class="bi bi-currency-euro"></i> ${Number(value).toFixed(2)}`;
                    break; 
                case 'organizerId': 
                    const organizer = await usersApi.getOrganizer(value);
                    value = `${organizer.email}`
                    key = 'organizer';
                    searchParams.delete('organizerId');
                    searchParams.append('organizer', `${organizer.email}`);
                case 'organizer': 
                    filter = `<i class="bi bi-person-badge"></i> Organizer`;
                    break; 
                case 'radius': 
                    filter = `<i class="bi bi-radar"></i> Distance`;
                    value = `Max Km ${value}`;
                    break; 
                default: return;
            }
    
            filtersRow.insertAdjacentHTML('beforeend', `
                <div class="card pb-0 col-md-2 col-sm-4 mb-3 mx-1" key="${key}" id="filter-card-${key}">
                    <a class="text-decoration-none" href="/events/search/?focus=${key}&${searchParams.toString()}&address=${location.display_name}">
                      <div class="card-body d-flex justify-content-between">
                        <p class="card-text"> <b>${filter}</b><br> ${value}</p>
                        <button type="button" class="btn-close" aria-label="Delete"></button>
                      </div>
                    </a>
                </div>
            `);

            document.querySelector(`#filter-card-${key} button`).addEventListener('click', (ev) => {
                ev.preventDefault();
                searchParams.delete(key);
                page(`/events/?${searchParams.toString()}`)
        });
        });
    } catch (error) {
        console.error(error);
        return page('/events');
    }

    const map = L.map('map').setView([latitude, longitude], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    const position = L.icon({
        iconUrl: '/img/position.png',
        iconSize:     [40, 40], 
        iconAnchor:   [20, 20], 
    });
    L.marker([latitude, longitude], { icon: position }).addTo(map);

    let switchingPage = false;
    let offset = 0;
    const limit = 8;
    let orderBy = {
        field: 'Event.date',
        direction: 'ASC'
    }

    if (searchParams.get('popular') === 'true') {
        orderBy.field = 'registrationCount';
        orderBy.direction = 'DESC';
        dropdownItems.forEach(item => {
            item.classList.remove('active')
            if (item.getAttribute('data-order') === 'registrationCount' && item.getAttribute('data-direction') === 'DESC')
                item.classList.add('active');
        });
    }
    
    try {
        const events = await eventsApi.getFilteredEvents({
            filters: {
                latitude,
                longitude,
                ...filters
            },
            offset,
            limit,
            orderBy
        });

        if (events.length > 0) {
            for (const event of events) {
                event.address = await osmApi.getAddress(event.location.latitude, event.location.longitude);
                eventsRow.insertAdjacentHTML('beforeend', renderEventCard(event));
                const marker = L.marker([event.location.latitude, event.location.longitude]).addTo(map);
                marker
                    .bindPopup(`<a href="/events/${event.eventId}"><b>${event.title}</b></a>
                                <br>
                                <p>${event.address.display_name}</p>`)
                    .openPopup();
            }

            if (events.length >= limit) pagination.classList.remove('d-none');
        }
        else eventsRow.innerHTML = '<p>No Event Found</p>';
    } catch (error) {
        console.error(error)
        return next();
    }

    dropdownItems.forEach(item => {
        item.addEventListener('click', async () => {
            orderBy = {
                field: item.getAttribute('data-order'),
                direction: item.getAttribute('data-direction'),
            };

            dropdownItems.forEach(dropdownItem => dropdownItem.classList.remove('active'));
            item.classList.add('active');
            if (switchingPage) return;

            switchingPage = true;

            const events = await eventsApi.getFilteredEvents({
                filters: {
                    latitude,
                    longitude,
                    ...filters
                },
                offset,
                limit,
                orderBy
            });

            paginationCurrent.innerHTML = `${(offset + limit) / limit}`;
            eventsRow.innerHTML = '';
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) map.removeLayer(layer)
            });
            const position = L.icon({
                iconUrl: '/img/position.png',
                iconSize:     [40, 40], 
                iconAnchor:   [20, 20], 
            });
            L.marker([latitude, longitude], { icon: position }).addTo(map);

            for (const event of events) {
                event.address = await osmApi.getAddress(event.location.latitude, event.location.longitude);
                eventsRow.insertAdjacentHTML('beforeend', renderEventCard(event));
                const marker = L.marker([event.location.latitude, event.location.longitude]).addTo(map);
                marker
                    .bindPopup(`<b>${event.title}</b>
                                <br>
                                <p>${event.address.display_name}</p>`)
                    .openPopup();
            }

            paginationBack.blur();
            switchingPage = false;
            });
    });

    paginationBack.addEventListener('click', async () => {
        if (switchingPage || offset < limit) return;

        switchingPage = true;
        offset -= limit;
        if (offset < limit) paginationBackListItem.classList.add('disabled');

        const events = await eventsApi.getFilteredEvents({
            filters: {
                latitude,
                longitude,
                ...filters
            },
            offset,
            limit,
            orderBy
        });

        paginationCurrent.innerHTML = `${(offset + limit) / limit}`;
        eventsRow.innerHTML = '';
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) map.removeLayer(layer)
        });
        const position = L.icon({
            iconUrl: '/img/position.png',
            iconSize:     [40, 40], 
            iconAnchor:   [20, 20], 
        });
        L.marker([latitude, longitude], { icon: position }).addTo(map);

        for (const event of events) {
            event.address = await osmApi.getAddress(event.location.latitude, event.location.longitude);
            eventsRow.insertAdjacentHTML('beforeend', renderEventCard(event));
            const marker = L.marker([event.location.latitude, event.location.longitude]).addTo(map);
            marker
                .bindPopup(`<b>${event.title}</b>
                            <br>
                            <p>${event.address.display_name}</p>`)
                .openPopup();
        }

        paginationBack.blur();
        switchingPage = false;
    });

    paginationNext.addEventListener('click', async () => {
        if (switchingPage) return;

        switchingPage = true;
        offset += limit;

        let events = await eventsApi.getFilteredEvents({
            filters: {
                latitude,
                longitude,
                ...filters
            },
            offset,
            limit,
            orderBy
        });

        if (!events.length) {
            if (offset === limit) {
                paginationNext.classList.add('disabled');
                return;
            }

            offset = 0;
            events = await eventsApi.getFilteredEvents({
                filters: {
                    latitude,
                    longitude,
                    ...filters
                },
                offset,
                limit,
                orderBy
            });

            paginationBackListItem.classList.add('disabled');
            paginationNext.blur();
        }

        paginationCurrent.innerHTML = `${(offset + limit) / limit}`;

        eventsRow.innerHTML = '';
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) map.removeLayer(layer)
        });
        const position = L.icon({
            iconUrl: '/img/position.png',
            iconSize:     [40, 40], 
            iconAnchor:   [20, 20], 
        });
        L.marker([latitude, longitude], { icon: position }).addTo(map);

        for (const event of events) {
            event.address = await osmApi.getAddress(event.location.latitude, event.location.longitude);
            eventsRow.insertAdjacentHTML('beforeend', renderEventCard(event));
            const marker = L.marker([event.location.latitude, event.location.longitude]).addTo(map);
            marker
                .bindPopup(`<b>${event.title}</b>
                            <br>
                            <p>${event.address.display_name}</p>`)
                .openPopup();
        }

        if (offset) paginationBackListItem.classList.remove('disabled');

        paginationNext.blur();
        switchingPage = false;
    });
}

eventController.event = async function (ctx, next) {
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    addSearchBarEventListener();

    try {
        const event = await eventsApi.getEvent(ctx.params.eventId);
        event.address = await osmApi.getAddress(event.location.latitude, event.location.longitude);

        document.getElementById('main').innerHTML = renderEvent(event, ctx.user);
        document.getElementById('footer').innerHTML = renderFooter();

        if (ctx.user && ctx.user.role !== 'organizer') {
            try {
                const eventRegistration = await eventsApi.getEventRegistration(event.eventId);
                const registrationAlert =
                    `<div class="alert alert-success" role="alert">
                        <a href="/user/orders/${eventRegistration.registrationId}">You registered to this event on ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(eventRegistration.date))}</a>
                    </div>`;
                const previousAlert = document.querySelector('.alert.alert-danger');
                if (previousAlert) previousAlert.remove()
                document.querySelector('.breadcrumb').insertAdjacentHTML('afterend', registrationAlert);
            } catch (error) {}
        }

        if (ctx.user && ctx.user.role === 'organizer' && ctx.user.userId === event.organizer.organizerId) {
            const organizerAlert =
                `<div class="alert alert-primary" role="alert">
                    <a href="/user/events/${event.eventId}">View registrations for this event</a>
                </div>`;

            const previousAlert = document.querySelector('.alert.alert-danger');
            if (previousAlert) previousAlert.remove()
            document.querySelector('.breadcrumb').insertAdjacentHTML('afterend', organizerAlert);
        }

        if (!ctx.user || ctx.user.role !== 'organizer') {
            const quantityLabel = document.getElementById('quantity');
            const checkout = document.getElementById('checkout');
            const plus = document.getElementById('plus');
            const minus = document.getElementById('minus');

            checkout.innerHTML = `<i class="bi bi-cart"></i> Check Out for ${event.registrationCost ? `<i class="bi bi-currency-euro"></i> <b>${(event.registrationCost * Number(quantityLabel.innerHTML)).toFixed(2)}</b>` : '<b>FREE</b>'}`
            if (event.maxParticipants === 1) plus.classList.add('disabled');

            plus.addEventListener('click', () => {
                const quantity = Number(quantityLabel.innerHTML) + 1;
    
                if (event.maxParticipants && quantity + event.registrationCount > event.maxParticipants) return;
    
                quantityLabel.innerHTML = quantity;
                checkout.innerHTML = `<i class="bi bi-cart"></i> Check Out for ${event.registrationCost ? `<i class="bi bi-currency-euro"></i> <b>${(event.registrationCost * quantity).toFixed(2)}</b>` : '<b>FREE</b>'}`
                if (event.maxParticipants && quantity + event.registrationCount >= event.maxParticipants) plus.classList.add('disabled');
                minus.classList.remove('disabled');
            });
    
            minus.addEventListener('click', () => {
                const quantity = Number(quantityLabel.innerHTML) - 1;
    
                if (quantity < 1) return;
    
                quantityLabel.innerHTML = quantity;
                checkout.innerHTML = `<i class="bi bi-cart"></i> Check Out for ${event.registrationCost ? `<i class="bi bi-currency-euro"></i> <b>${(event.registrationCost * quantity).toFixed(2)}</b>` : '<b>FREE</b>'}`
                if (quantity <= 1) minus.classList.add('disabled');
                plus.classList.remove('disabled');
            });
    
            const checkoutForm = document.getElementById('checkout-form');
            const paymentButton = document.getElementById('payment-button');
            const cardHolderNameInput = document.getElementById('card-holder-name');
            const cardNumberInput = document.getElementById('card-number');
            const expirationDateInput = document.getElementById('expiration-date');
            const cvvInput = document.getElementById('cvv');

            checkout.addEventListener('click', async () => {
                if (!ctx.user) return page(`/auth/login/?redirect=${ctx.path}`);
                
                if (!event.registrationCost) {
                try {
                    minus.classList.add('disabled');
                    plus.classList.add('disabled');
                    checkout.classList.add('disabled');
                    checkout.innerHTML = `
                        <span class="spinner-border spinner-grow-sm" aria-hidden="true"></span>
                        <span role="status">Processing...</span>`;
    
                    const registrationId = await eventsApi.addEventRegistration(event.eventId, quantityLabel.innerHTML);
    
                    setTimeout(() => {
                        checkout.classList.remove('btn-primary');
                        checkout.classList.add('btn-success');
                        checkout.innerHTML = `
                            <i class="bi bi-check-circle-fill"></i> Registered Successfully`;
                        setTimeout(() => page(`/user/orders/${registrationId}`), 1500);
                    }, 2000);
    
                } catch (error) {
                    const errorAlert =
                        `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                            ${error.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`;
    
                    const previousAlert = document.querySelector('.alert.alert-danger');
                    if (previousAlert) previousAlert.remove()
                    document.querySelector('.container-xxl').insertAdjacentHTML('afterbegin', errorAlert);
    
                }

            }
            
            paymentButton.innerHTML = 
                `Pay <i class="bi bi-currency-euro"></i> <b>${(event.registrationCost * Number(quantityLabel.innerHTML)).toFixed(2)}</b>`  
            });

            cardHolderNameInput.addEventListener('input', () => {
            if (!/^[A-Za-z ]+$/.test(cardHolderNameInput.value)) {
                const length = cardHolderNameInput.value.length;
                cardHolderNameInput.value = cardHolderNameInput.value.slice(0, length - 1);
            }
            });

            cardNumberInput.addEventListener('input', () => {
            const cardNumber = cardNumberInput.value.replace(/\s/g, ''); 
            if (!/^[0-9]*$/.test(cardNumber)) {
                const length = cardNumber.length;
                cardNumberInput.value = cardNumber.slice(0, length - 1);
            } else {
                cardNumberInput.value = cardNumber.replace(/(.{4})/g, '$1 ').trim(); 
            }
            });

            expirationDateInput.addEventListener('input', () => {
            const expirationDate = expirationDateInput.value.replace(/\D/g, '');
            if (!/^[0-9]*$/.test(expirationDate)) {
                const length = expirationDate.length;
                expirationDateInput.value = expirationDate.slice(0, length - 1);
            } else {
                expirationDateInput.value = expirationDate.replace(/(^\d{2})(\d)/, '$1/$2');
            }
            });

            cvvInput.addEventListener('input', () => {
            const cvv = cvvInput.value;
            if (!/^[0-9]*$/.test(cvv)) {
                const length = cvv.length;
                cvvInput.value = cvv.slice(0, length - 1);
            }
            });

            checkoutForm.addEventListener('submit', (ev) => {
            ev.preventDefault();
            paymentButton.click();
            });

            paymentButton.addEventListener('click', async () => {
            const cardHolderName = document.getElementById('card-holder-name').value;
            const cardNumber = document.getElementById('card-number').value;
            const expirationDate = document.getElementById('expiration-date').value;
            const cvv = document.getElementById('cvv').value;
            const quantity = document.getElementById('quantity').innerHTML;
            const closeCheckoutModal = document.getElementById('close-checkout-modal');
            const cancelButton = document.getElementById('cancel-button');

            try {
                if (!/^[A-Za-z ]+$/.test(cardHolderName)) throw new Error('Card Holder Name is not valid');
                if (!/^[0-9]{4} [0-9]{4} [0-9]{4} [0-9]{4}$/.test(cardNumber)) throw new Error('Card Number is not valid');
                if (!/^[0-9]{2}\/[0-9]{2}$/.test(expirationDate)) throw new Error('Expiration Date is not valid');
                if (!/^[0-9]{3}$/.test(cvv)) throw new Error('CVV is not valid');

                closeCheckoutModal.classList.add('disabled');
                cancelButton.classList.add('disabled');
                paymentButton.classList.add('disabled');
                paymentButton.innerHTML = `
                    <span class="spinner-border spinner-grow-sm" aria-hidden="true"></span>
                    <span role="status">Processing...</span>`;

                const registrationId = await eventsApi.addEventRegistration(event.eventId, quantity);

                setTimeout(() => {
                    paymentButton.classList.remove('btn-primary');
                    paymentButton.classList.add('btn-success');
                    paymentButton.innerHTML = `
                        <i class="bi bi-check-circle-fill"></i> Payment Successful`;
                    setTimeout(() => {
                        closeCheckoutModal.classList.remove('disabled');
                        closeCheckoutModal.click();
                        page(`/user/orders/${registrationId}`);
                    }, 1500);
                }, 2000);

            } catch (error) {
                const errorAlert =
                    `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        ${error.message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;

                const previousAlert = document.querySelector('.alert.alert-danger');
                if (previousAlert) previousAlert.remove()
                checkoutForm.insertAdjacentHTML('beforebegin', errorAlert);

                closeCheckoutModal.classList.remove('disabled');
                cancelButton.classList.remove('disabled');
            }
            });
        }
        
        const map = L.map('map').setView([event.location.latitude, event.location.longitude], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const marker = L.marker([event.location.latitude, event.location.longitude]).addTo(map);
        marker.bindPopup(`<b>${event.title}</b><br>${event.address.display_name}`).openPopup();

        document.getElementById('delete-event-button').addEventListener('click', async function () {
            await eventsApi.deleteEvent(event.eventId);
            page('/events');
        });

    } catch (error) {
        console.error(error);
        return next();
    }
}

eventController.categories = function (ctx) {
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    document.getElementById('main').innerHTML = renderCategories();
    document.getElementById('footer').innerHTML = renderFooter();
    addSearchBarEventListener();
}

eventController.createEvent = function (ctx) {
    if (ctx.user.role === 'participant') page(`/?error=${encodeURI('Register as an Organizer to create events')}`);

    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    document.getElementById('main').innerHTML = renderCreateEvent();
    document.getElementById('footer').innerHTML = renderFooter();
    addSearchBarEventListener();

    const form = document.getElementById('form');
    const titleInput = document.getElementById('title');
    const categoryInput = document.getElementById('category');
    const descriptionInput = document.getElementById('description');
    const dateInput = document.getElementById('date');
    const locationInputGroup = document.getElementById('locationInputGroup');
    const locationAddress = document.getElementById('locationAddress');
    const locationMap = document.getElementById('locationMap');
    const locationLatLon = document.getElementById('locationLatLon');
    const registrationCostInput = document.getElementById('registration-cost');
    const maxParticipantsInput = document.getElementById('max-participants');
    const imagesInput = document.getElementById('images');
    let map, marker;
    
    locationAddress.addEventListener('click', (ev) => {
        ev.preventDefault();

        map = undefined;
        marker = undefined;
        locationInputGroup.querySelectorAll('input').forEach(input => input.remove());
        locationInputGroup.querySelectorAll('#automplete-results').forEach(div => div.remove());
        document.querySelectorAll('#map').forEach(div => div.remove());
        locationInputGroup.insertAdjacentHTML('afterbegin', `
            <input type="text" class="form-control" placeholder="Address" aria-label="Address">
        `);
        locationInputGroup.querySelector('button').innerHTML = 'Address';
        locationInputGroup.insertAdjacentHTML('afterend', '<div id="autocomplete-results" class="list-group"></div>');

        const autocompleteResults = document.getElementById('autocomplete-results');
        const locationInput = locationInputGroup.querySelector('input');

        locationInput.addEventListener('input', async function () {
            if (locationInput.value.length > 2) { 
                try {
                    const results = await osmApi.searchAddress(locationInput.value);
                    autocompleteResults.innerHTML = '';
    
                    results.forEach(result => {
                        const address = result.display_name;
                        const listItem = document.createElement('button');
                        listItem.classList.add('list-group-item', 'list-group-item-action');
                        listItem.textContent = address;
                        listItem.addEventListener('click', function () {
                            locationInput.value = address;
                            autocompleteResults.innerHTML = ''; 
                        });
                        autocompleteResults.appendChild(listItem);
                    });
                } catch (error) {
                    console.error('Error fetching autocomplete results:', error);
                }
            } else {
                autocompleteResults.innerHTML = '';
            }
        });

        locationInput.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') ev.preventDefault();
        });
    });

    locationLatLon.addEventListener('click', (ev) => {
        ev.preventDefault();

        map = undefined;
        marker = undefined;
        locationInputGroup.querySelectorAll('input').forEach(input => input.remove());
        locationInputGroup.querySelectorAll('#automplete-results').forEach(div => div.remove());
        document.querySelectorAll('#map').forEach(div => div.remove());
        locationInputGroup.insertAdjacentHTML('afterbegin', `
            <input type="text" class="form-control" placeholder="Latitude" aria-label="Latitude">
            <input type="text" class="form-control" placeholder="Longitude" aria-label="Longitude">
        `);
        locationInputGroup.querySelector('button').innerHTML = 'Latitude and Longitude';
        locationInputGroup.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                if (!/^[0-9.]*$/.test(input.value) || (/[.]+/.test(input.value) && input.value.indexOf('.') !== input.value.lastIndexOf('.'))) 
                    input.value = input.value.slice(0, input.value.length - 1);
            })
        });

        locationInputGroup.querySelectorAll('input').forEach(locationInput => {
                locationInput.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter') ev.preventDefault();
            })
        });
    });

    locationMap.addEventListener('click', (ev) => {
        ev.preventDefault();

        map = undefined;
        marker = undefined;
        locationInputGroup.querySelectorAll('input').forEach(input => input.remove());
        locationInputGroup.querySelectorAll('#automplete-results').forEach(div => div.remove());
        document.querySelectorAll('#map').forEach(div => div.remove());
        locationInputGroup.insertAdjacentHTML('afterbegin', `
            <input type="text" class="form-control" placeholder="Address" aria-label="Address" disabled>
        `);
        locationInputGroup.insertAdjacentHTML('afterend', '<div id="map"  class="rounded mt-3"></div>');
        locationInputGroup.querySelector('button').innerHTML = 'Map';
        
        map = L.map('map').setView([ctx.latitude || 45.4641943, ctx.longitude || 9.1896346], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        marker;

        map.on('click', async (e) => {
            if (!marker) marker = L.marker(e.latlng).addTo(map); 
            else marker.setLatLng(e.latlng);  
            
            const address = await osmApi.getAddress(e.latlng.lat, e.latlng.lng);
            marker
                .bindPopup(`<b>${address.display_name}</b><br><br>${e.latlng.lat}, ${e.latlng.lng}`)
                .openPopup();
            locationInputGroup.querySelector('input').value = address.display_name;
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('title', titleInput.value);
        formData.append('category', categoryInput.options[categoryInput.selectedIndex].value);
        formData.append('description', descriptionInput.value);
        formData.append('date', dateInput.value);
        formData.append('registrationCost', registrationCostInput.value);
        formData.append('maxParticipants', maxParticipantsInput.value || null);
        for (const image of imagesInput.files) formData.append('images', image);

        if (locationInputGroup.querySelector('button').innerHTML === 'Address' && !!locationInputGroup.querySelector('input').value) {
            try {
                const { latitude, longitude } = await osmApi.getLatitudeLongitude(locationInputGroup.querySelector('input').value);
                formData.append('latitude', latitude);
                formData.append('longitude', longitude);
            } catch (error) {
                const errorAlert =
                `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    ${error.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;

                const previousAlert = document.querySelector('.alert.alert-danger');
                if (previousAlert) previousAlert.remove()
                form.insertAdjacentHTML('beforebegin', errorAlert);

                return;
            }
        } 

        if (locationInputGroup.querySelector('button').innerHTML === 'Latitude and Longitude' && function() {
            for (const input of locationInputGroup.querySelectorAll('input')) 
                if (!input.value) return false;

            return true;
        }) {
            const [ latitudeInput, longitudeInput ] = locationInputGroup.querySelectorAll('input');
            formData.append('latitude', latitudeInput.value);
            formData.append('longitude', longitudeInput.value);
        }

        if (locationInputGroup.querySelector('button').innerHTML === 'Map' && marker) {
            const { lat, lng } = marker.getLatLng();
            formData.append('latitude', lat);
            formData.append('longitude', lng);
        }

        try {
            const { eventId } = await eventsApi.addEvent(formData);
            page(`/events/${eventId}`);
        } catch (error) {
            const errorAlert =
                `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    ${error.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;

            const previousAlert = document.querySelector('.alert.alert-danger');
            if (previousAlert) previousAlert.remove();

            form.insertAdjacentHTML('beforebegin', errorAlert);
        }
    });

    locationAddress.click();
}

eventController.updateEvent = async function (ctx, next) {
    let event;

    try {
        event = await eventsApi.getEvent(ctx.params.eventId);
        if (event.organizer.organizerId !== ctx.user.userId) throw new Error('Unathorized');

        document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
        document.getElementById('main').innerHTML = renderUpdateEvent(event);
        document.getElementById('footer').innerHTML = renderFooter();
        addSearchBarEventListener();
    } catch (error) {
        console.error(error);
        return next();
    }

    const form = document.getElementById('form');
    const titleInput = document.getElementById('title');
    const categoryInput = document.getElementById('category');
    const descriptionInput = document.getElementById('description');
    const dateInput = document.getElementById('date');
    const locationInputGroup = document.getElementById('locationInputGroup');
    const locationAddress = document.getElementById('locationAddress');
    const locationLatLon = document.getElementById('locationLatLon');
    const registrationCostInput = document.getElementById('registration-cost');
    const maxParticipantsInput = document.getElementById('max-participants');
    const imagesInput = document.getElementById('images');
    let map, marker;

    locationAddress.addEventListener('click', async (ev) => {
        ev.preventDefault();

        map = undefined;
        marker = undefined;
        locationInputGroup.querySelectorAll('input').forEach(input => input.remove());
        locationInputGroup.querySelectorAll('#automplete-results').forEach(div => div.remove());
        document.querySelectorAll('#map').forEach(div => div.remove());
        locationInputGroup.insertAdjacentHTML('afterbegin', `
            <input type="text" class="form-control" placeholder="Address" aria-label="Address">
        `);
        locationInputGroup.querySelector('button').innerHTML = 'Address';
        locationInputGroup.insertAdjacentHTML('afterend', '<div id="autocomplete-results" class="list-group"></div>');

        const autocompleteResults = document.getElementById('autocomplete-results');
        const locationInput = locationInputGroup.querySelector('input');

        locationInput.addEventListener('input', async function () {
            if (locationInput.value.length > 2) { 
                try {
                    const results = await osmApi.searchAddress(locationInput.value);
                    autocompleteResults.innerHTML = '';
    
                    results.forEach(result => {
                        const address = result.display_name;
                        const listItem = document.createElement('button');
                        listItem.classList.add('list-group-item', 'list-group-item-action');
                        listItem.textContent = address;
                        listItem.addEventListener('click', function () {
                            locationInput.value = address;
                            autocompleteResults.innerHTML = ''; 
                        });
                        autocompleteResults.appendChild(listItem);
                    });
                } catch (error) {
                    console.error('Error fetching autocomplete results:', error);
                }
            } else {
                autocompleteResults.innerHTML = '';
            }
        });

        locationInput.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') ev.preventDefault();
        });

        locationInput.value = (await osmApi.getAddress(event.location.latitude, event.location.longitude)).display_name;
    });

    locationLatLon.addEventListener('click', (ev) => {
        ev.preventDefault();

        map = undefined;
        marker = undefined;
        locationInputGroup.querySelectorAll('input').forEach(input => input.remove());
        locationInputGroup.querySelectorAll('#automplete-results').forEach(div => div.remove());
        document.querySelectorAll('#map').forEach(div => div.remove());
        locationInputGroup.insertAdjacentHTML('afterbegin', `
            <input type="text" class="form-control" placeholder="Latitude" aria-label="Latitude">
            <input type="text" class="form-control" placeholder="Longitude" aria-label="Longitude">
        `);
        locationInputGroup.querySelector('button').innerHTML = 'Latitude and Longitude';
        locationInputGroup.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                if (!/^[0-9.]*$/.test(input.value) || (/[.]+/.test(input.value) && input.value.indexOf('.') !== input.value.lastIndexOf('.'))) 
                    input.value = input.value.slice(0, input.value.length - 1);
            })
        });

        locationInputGroup.querySelectorAll('input').forEach(locationInput => {
                locationInput.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter') ev.preventDefault();
            })
        });

        locationInputGroup.querySelector('input').value = event.location.latitude;
        locationInputGroup.querySelectorAll('input')[1].value = event.location.longitude;
    });

    locationMap.addEventListener('click', async (ev) => {
        ev.preventDefault();

        map = undefined;
        marker = undefined;
        locationInputGroup.querySelectorAll('input').forEach(input => input.remove());
        locationInputGroup.querySelectorAll('#automplete-results').forEach(div => div.remove());
        document.querySelectorAll('#map').forEach(div => div.remove());
        locationInputGroup.insertAdjacentHTML('afterbegin', `
            <input type="text" class="form-control" placeholder="Address" aria-label="Address" disabled>
        `);
        locationInputGroup.insertAdjacentHTML('afterend', '<div id="map"  class="rounded mt-3"></div>');
        locationInputGroup.querySelector('button').innerHTML = 'Map';
        
        map = L.map('map').setView([event.location.latitude, event.location.longitude], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const address = await osmApi.getAddress(event.location.latitude, event.location.longitude);
        marker = L.marker([event.location.latitude, event.location.longitude]).addTo(map);
        marker.bindPopup(`<b>${address.display_name}</b><br><br>${event.location.latitude}, ${event.location.longitude}`).openPopup();
        locationInputGroup.querySelector('input').value = address.display_name;

        map.on('click', async (e) => {
            if (!marker) marker = L.marker(e.latlng).addTo(map); 
            else marker.setLatLng(e.latlng);  
            
            const address = await osmApi.getAddress(e.latlng.lat, e.latlng.lng);
            marker
                .bindPopup(`<b>${address.display_name}</b><br><br>${e.latlng.lat}, ${e.latlng.lng}`)
                .openPopup();
            locationInputGroup.querySelector('input').value = address.display_name;
        });
    });

    for (let i = 0; i < event.imagePaths.length; ++i)
        document.getElementById(`delete-image-${i}`).addEventListener('click', async () => {
            await eventsApi.deleteEventImage(event.eventId, event.imagePaths[i]);
            document.getElementById(`image-${i}`).classList.add('d-none');
        });

    form.addEventListener('submit', async (ev) => {
        ev.preventDefault();

        try {
            const eventId = event.eventId;

            if (event.title !== titleInput.value.trim()) await eventsApi.updateEventTitle(eventId, titleInput.value);
            if (event.category !== categoryInput.value.trim()) await eventsApi.updateEventCategory(eventId, categoryInput.value);
            if (event.description !== descriptionInput.value.trim()) await eventsApi.updateEventDescription(eventId, descriptionInput.value);
            if (event.date !== dateInput.value) await eventsApi.updateEventDate(eventId, dateInput.value);
            if (event.registrationCost != registrationCostInput.value) await eventsApi.updateEventRegistrationCost(eventId, registrationCostInput.value);
            if ((maxParticipantsInput.value === '' && event.maxParticipants !== null) || (event.maxParticipants && maxParticipantsInput.value != event.maxParticipants) || (maxParticipantsInput.value !== '' && !event.maxParticipants)) await eventsApi.updateEventMaxParticipants(eventId, maxParticipantsInput.value ? maxParticipantsInput.value : null);
            if (imagesInput.files.length) {
                const formData = new FormData();
                for (const image of imagesInput.files) formData.append('images', image);
                await eventsApi.addEventImages(eventId, formData);
            }

            if (locationInputGroup.querySelector('button').innerHTML === 'Address' && !!locationInputGroup.querySelector('input').value && locationInputGroup.querySelector('input').value !== (await osmApi.getAddress(event.location.latitude, event.location.longitude)).display_name) {
                try {
                    const { latitude, longitude } = await osmApi.getLatitudeLongitude(locationInputGroup.querySelector('input').value);
                    await eventsApi.updateEventLocation(event.eventId, { latitude, longitude });
                } catch (error) {
                    const errorAlert =
                    `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        ${error.message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;
    
                    const previousAlert = document.querySelector('.alert.alert-danger');
                    if (previousAlert) previousAlert.remove()
                    form.insertAdjacentHTML('beforebegin', errorAlert);
    
                    return;
                }
            } 
    
            if (locationInputGroup.querySelector('button').innerHTML === 'Latitude and Longitude' && (locationInputGroup.querySelector('input').value != event.location.latitude || locationInputGroup.querySelectorAll('input')[1].value !== event.location.longitude) && function() {
                for (const input of locationInputGroup.querySelectorAll('input')) 
                    if (!input.value) return false;
    
                return true;
            }) {
                const [ latitudeInput, longitudeInput ] = locationInputGroup.querySelectorAll('input');
                await eventsApi.updateEventLocation(eventId, { latitude: latitudeInput.value, longitude: longitudeInput.value });
            }

            if (locationInputGroup.querySelector('button').innerHTML === 'Map' && marker && (event.location.latitude !== marker.getLatLng().lat || event.location.longitude !== marker.getLatLng().lng)) {
                try {
                    const { lat, lng } = marker.getLatLng();
                    await eventsApi.updateEventLocation(event.eventId, { latitude: lat, longitude: lng });
                } catch (error) {
                    const errorAlert =
                    `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        ${error.message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`;
    
                    const previousAlert = document.querySelector('.alert.alert-danger');
                    if (previousAlert) previousAlert.remove()
                    form.insertAdjacentHTML('beforebegin', errorAlert);
    
                    return;
                }
            } 

            page(`/events/${eventId}`);
        } catch (error) {
            const errorAlert =
                `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    ${error.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;

            const previousAlert = document.querySelector('.alert.alert-danger');
            if (previousAlert) previousAlert.remove()
            form.insertAdjacentHTML('beforebegin', errorAlert);
        }
    });

    locationAddress.click();

    titleInput.value = event.title;
    categoryInput.value = event.category;
    descriptionInput.value = event.description;
    dateInput.value = event.date;
    registrationCostInput.value = event.registrationCost;
    maxParticipantsInput.value = event.maxParticipants;
}

eventController.search = function (ctx) {
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    document.getElementById('main').innerHTML = renderSearch();
    document.getElementById('footer').innerHTML = '';

    const params = new URLSearchParams(ctx.querystring);
    const form = document.getElementById('form');
    const navbarSearchbar = document.querySelector('#navbar-searchbar input');
    const locationInputGroup = document.getElementById('locationInputGroup');
    const locationAddress = document.getElementById('locationAddress');
    const locationLatLon = document.getElementById('locationLatLon');
    const locationMap = document.getElementById('locationMap');
    const distanceRange = document.getElementById('distanceRange');
    const distanceRangeValue = document.getElementById('distanceRangeValue');
    const priceRange = document.getElementById('priceRange');
    const priceRangeValue = document.getElementById('priceRangeValue');
    const categories = document.querySelectorAll('#categories li button');
    const categoriesDropdown = document.querySelector('#categoriesDropdown button');
    let map, marker;

    document.querySelector('#navbar-searchbar').addEventListener('submit', (ev) => {
        ev.preventDefault()
        document.getElementById('search-button').click();
    });

    locationAddress.addEventListener('click', (ev) => {
        ev.preventDefault();

        map = undefined;
        marker = undefined;
        locationInputGroup.querySelectorAll('input').forEach(input => input.remove());
        locationInputGroup.querySelectorAll('#automplete-results').forEach(div => div.remove());
        document.querySelectorAll('#map').forEach(div => div.remove());
        locationInputGroup.insertAdjacentHTML('afterbegin', `
            <input type="text" class="form-control" placeholder="Address" aria-label="Address">
        `);
        locationInputGroup.querySelector('button').innerHTML = 'Address';
        locationInputGroup.insertAdjacentHTML('afterend', '<div id="autocomplete-results" class="list-group"></div>');

        const autocompleteResults = document.getElementById('autocomplete-results');
        const locationInput = locationInputGroup.querySelector('input');

        locationInput.addEventListener('input', async function () {
            if (locationInput.value.length > 2) { 
                try {
                    const results = await osmApi.searchAddress(locationInput.value);
                    autocompleteResults.innerHTML = '';
    
                    results.forEach(result => {
                        const address = result.display_name;
                        const listItem = document.createElement('button');
                        listItem.classList.add('list-group-item', 'list-group-item-action');
                        listItem.textContent = address;
                        listItem.addEventListener('click', function () {
                            locationInput.value = address;
                            autocompleteResults.innerHTML = ''; 
                        });
                        autocompleteResults.appendChild(listItem);
                    });
                } catch (error) {
                    console.error('Error fetching autocomplete results:', error);
                }
            } else {
                autocompleteResults.innerHTML = '';
            }
        });

        locationInput.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') ev.preventDefault();
        });

        locationInput.value = params.get('address') || '';
    });

    locationLatLon.addEventListener('click', async (ev) => {
        ev.preventDefault();

        map = undefined;
        marker = undefined;
        locationInputGroup.querySelectorAll('input').forEach(input => input.remove());
        locationInputGroup.querySelectorAll('#automplete-results').forEach(div => div.remove());
        document.querySelectorAll('#map').forEach(div => div.remove());
        locationInputGroup.insertAdjacentHTML('afterbegin', `
            <input type="text" class="form-control" placeholder="Latitude" aria-label="Latitude">
            <input type="text" class="form-control" placeholder="Longitude" aria-label="Longitude">
        `);
        locationInputGroup.querySelector('button').innerHTML = 'Latitude and Longitude';
        locationInputGroup.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                if (!/^[0-9.]*$/.test(input.value) || (/[.]+/.test(input.value) && input.value.indexOf('.') !== input.value.lastIndexOf('.'))) 
                    input.value = input.value.slice(0, input.value.length - 1);
            })
        });

        locationInputGroup.querySelectorAll('input').forEach(locationInput => {
                locationInput.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter') ev.preventDefault();
            })
        });

        if (params.get('address')) {
            try {
                const { latitude, longitude } = await osmApi.getLatitudeLongitude(params.get('address'))
                locationInputGroup.querySelector('input').value = latitude;
                locationInputGroup.querySelectorAll('input')[1].value = longitude;
            } catch (error) {
                console.error(error);
            }
        }
    });

    locationMap.addEventListener('click', async (ev) => {
        ev.preventDefault();

        map = undefined;
        marker = undefined;
        locationInputGroup.querySelectorAll('input').forEach(input => input.remove());
        locationInputGroup.querySelectorAll('#automplete-results').forEach(div => div.remove());
        document.querySelectorAll('#map').forEach(div => div.remove());
        locationInputGroup.insertAdjacentHTML('afterbegin', `
            <input type="text" class="form-control" placeholder="Address" aria-label="Address" disabled>
        `);
        locationInputGroup.insertAdjacentHTML('afterend', '<div id="map"  class="rounded mt-3"></div>');
        locationInputGroup.querySelector('button').innerHTML = 'Map';
        
        const { latitude, longitude } = params.get('address') ? await osmApi.getLatitudeLongitude(params.get('address')) : { latitude: ctx.latitude || 45.4641943, longitude: ctx.longitude || 9.1896346 }
        map = L.map('map').setView([latitude, longitude], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        if (params.get('address')) {
            const address = await osmApi.getAddress(latitude, longitude);
            marker = L.marker([latitude, longitude]).addTo(map);
            marker.bindPopup(`<b>${address.display_name}</b><br><br>${latitude}, ${longitude}`).openPopup();
            locationInputGroup.querySelector('input').value = address.display_name;
        }

        map.on('click', async (e) => {
            if (!marker) marker = L.marker(e.latlng).addTo(map); 
            else marker.setLatLng(e.latlng);  
            
            const address = await osmApi.getAddress(e.latlng.lat, e.latlng.lng);
            marker
                .bindPopup(`<b>${address.display_name}</b><br><br>${e.latlng.lat}, ${e.latlng.lng}`)
                .openPopup();
            locationInputGroup.querySelector('input').value = address.display_name;
        });
    });

    distanceRange.addEventListener('input', () => {
        distanceRangeValue.innerHTML = `<b>Km</b> ${distanceRange.value === '500' ? '500+' : distanceRange.value}`
    });

    priceRange.addEventListener('input', () => {
        priceRangeValue.innerHTML = `<i class="bi bi-currency-euro"></i> ${priceRange.value === '500' ? '500+' : priceRange.value}`
    });

    categories.forEach(categoryButton => {
        categoryButton.addEventListener('click', (ev) => {
            ev.preventDefault();
            categoriesDropdown.innerHTML = categoryButton.innerHTML;
        })
    })

    form.addEventListener('submit', async (ev) => {
        ev.preventDefault();

        const title = document.querySelector('#navbar-searchbar input').value;
        const category = categoriesDropdown.innerHTML.trim();
        const price = priceRange.value;
        const date = document.getElementById('date').value;
        const organizer = document.getElementById('organizer').value;
        const radius = distanceRange.value;

        if (locationInputGroup.querySelector('button').innerHTML === 'Address' && !!locationInputGroup.querySelector('input').value) {
            try {
                const { latitude, longitude } = await osmApi.getLatitudeLongitude(locationInputGroup.querySelector('input').value);
                return page(`/events/?${title ? `title=${title}&` : ''}${category !== 'All' ? `category=${category}&` : ''}${Number(price) ? `registrationCost=${price}&` : ''}${date ? `date=${date}&` : ''}${organizer ? `organizer=${organizer}&` : ''}latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
            } catch (error) {
                const errorAlert =
                `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    ${error.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;

                const previousAlert = document.querySelector('.alert.alert-danger');
                if (previousAlert) previousAlert.remove()
                form.insertAdjacentHTML('beforebegin', errorAlert);

                return;
            }
        } 

        if (locationInputGroup.querySelector('button').innerHTML === 'Latitude and Longitude' && function() {
            for (const input of locationInputGroup.querySelectorAll('input')) 
                if (!input.value) return false;

            return true;
        }) {
            try {
                const [ latitudeInput, longitudeInput ] = locationInputGroup.querySelectorAll('input');
                await osmApi.getAddress(latitudeInput.value, longitudeInput.value);
                return page(`/events/?${title ? `title=${title}&` : ''}${category !== 'All' ? `category=${category}&` : ''}${Number(price) ? `registrationCost=${price}&` : ''}${date ? `date=${date}&` : ''}${organizer ? `organizer=${organizer}&` : ''}latitude=${latitudeInput.value}&longitude=${longitudeInput.value}&radius=${radius}`);
            } catch (error) {
                const errorAlert =
                `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    ${error.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;

                const previousAlert = document.querySelector('.alert.alert-danger');
                if (previousAlert) previousAlert.remove()
                form.insertAdjacentHTML('beforebegin', errorAlert);
                return;
            }
        } 

        if (locationInputGroup.querySelector('button').innerHTML === 'Map' && marker) {
            try {
                const { lat, lng } = marker.getLatLng();
                return page(`/events/?${title ? `title=${title}&` : ''}${category !== 'All' ? `category=${category}&` : ''}${Number(price) ? `registrationCost=${price}&` : ''}${date ? `date=${date}&` : ''}${organizer ? `organizer=${organizer}&` : ''}latitude=${lat}&longitude=${lng}&radius=${radius}`);
            } catch (error) {
                const errorAlert =
                `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    ${error.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;

                const previousAlert = document.querySelector('.alert.alert-danger');
                if (previousAlert) previousAlert.remove()
                form.insertAdjacentHTML('beforebegin', errorAlert);

                return;
            }
        } 

        return page(`/events/?${title ? `title=${title}&` : ''}${category !== 'All' ? `category=${category}&` : ''}${Number(price) ? `registrationCost=${price}&` : ''}${date ? `date=${date}&` : ''}${organizer ? `organizer=${organizer}&` : ''}`);
    });

    navbarSearchbar.setAttribute('placeholder', 'Title');
    navbarSearchbar.removeAttribute('readonly');
    locationAddress.click();

    navbarSearchbar.value = params.get('title');
    location.value = params.get('address') || '';
    distanceRange.value = params.get('radius') || '0';
    distanceRangeValue.innerHTML = `<b>Km</b> ${params.get('radius') || '0'}`;
    if (params.get('date')) date.value = new Date(params.get('date')).toISOString().split('T')[0];
    if (params.get('category') && [
        "Music",
        "Arts and Crafts",
        "Food and Drink",
        "Sports and Fitness",
        "Technology",
        "Business and Networking",
        "Health and Wellness",
        "Education",
        "Fashion and Beauty",
        "Gaming",
        "Travel and Outdoor",
        "Family and Kids",
        "Charity and Causes",
        "Performing Arts",
        "Film and Media"
    ].includes(params.get('category'))) {
        categoriesDropdown.innerHTML = params.get('category');
    }
    document.getElementById('organizer').value = params.get('organizer') || '';
    priceRange.value = params.get('registrationCost') || '0';
    priceRangeValue.innerHTML =`<i class="bi bi-currency-euro"></i> ${Number(params.get('registrationCost')).toFixed(2) || '0'}`;

    switch (params.get('focus')) {
        case 'location': 
            locationInputGroup.querySelector('input').focus();
            break;
        case 'radius':
            distanceRange.focus();
            break;
        case 'date':
            const date = document.getElementById('date');
            date.focus();
            break;
        case 'category':
            categoriesDropdown.focus();
            break;
        case 'organizer':
            document.getElementById('organizer').focus();
            break;
        case 'registrationCost':
            priceRange.focus();
            break;
        default:
            navbarSearchbar.focus();
    }
}

export default eventController;