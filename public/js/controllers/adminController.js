'use strict';

import page from '//unpkg.com/page/page.mjs';
import eventsApi from "../api/eventsApi.js";
import adminApi from "../api/adminApi.js";
import osmApi from "../api/osmApi.js";
import renderAdminDashboard from "../templates/admin/admin.js";
import renderAdminNavbar from "../templates/partials/adminNavbar.js";
import renderAdminEvent from "../templates/admin/event.js";
import renderUpdateEvent from "../templates/event/updateEvent.js";
import renderCreateEvent from "../templates/event/createEvent.js";
import renderUserProfile from "../templates/user/user.js";
import renderUpdateUserProfile from "../templates/user/update.js";
import renderOrder from "../templates/user/order.js";
import renderLogs from '../templates/admin/logs.js';

function capitalize(str) {
    return str.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    return formattedDate;
}


const adminController = {};

adminController.events = async function (ctx, next) {
    const params = new URLSearchParams(ctx.querystring);
    
    document.getElementById('navbar').innerHTML = renderAdminNavbar();
    document.querySelectorAll('#navbar li a')[0].classList.remove('link-dark');
    document.querySelectorAll('#navbar li a')[0].classList.add('link-underline-primary');
    document.getElementById('main').innerHTML = renderAdminDashboard();
    document.getElementById('footer').innerHTML = '';
    document.getElementById('title').innerHTML = 'Events';
    document.getElementById('title').insertAdjacentHTML('beforeend', '<a href="/admin/events/new" class="btn btn-primary btn-sm mx-3 mb-2"><i class="bi bi-plus-circle"></i> Create Event</a>');
    
    if (params.get('message'))
        document.querySelector('.container-xxl').insertAdjacentHTML('afterbegin', `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                ${params.get('message')}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`
        );

    try {
        let offset = 0;
        const limit = 20;
        const filters = {};
        if (params.get('filter')) filters.title = params.get('filter');
        const orderBy = { field: 'Event.eventId', direction: 'ASC' };

        const events = await eventsApi.getFilteredEvents({ filters, offset, limit, orderBy});
        document.querySelector('.row').insertAdjacentHTML('afterend', `
            <div class="scrollable-div-lg overflow-auto p-3 my-4 border rounded">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Event ID</th>
                            <th scope="col">Title</th>
                            <th scope="col">Date</th>
                            <th scope="col">Price</th>
                            <th scope="col">Organizer</th>
                            <th scope="col">Registrations</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${events.reduce((html, event) => html += `
                        <tr>
                            <td><a href="/admin/events/${event.eventId}">${event.eventId}</a></td>
                            <td>${event.title}</td>
                            <td>${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(event.date))}</td>
                            <td><i class="bi bi-currency-euro"></i> ${event.registrationCost}</td>
                            <td><a href="/admin/users/${event.organizer.organizerId}">${event.organizer.email}</td>
                            <td><i class="bi bi-ticket"></i> x ${event.registrationCount}</td>
                        </tr>
                        `, '')}
                    </tbody>
                </table>
            </div>
        `);

        if (events.length === limit) document.getElementById('pagination').classList.remove('d-none');

        const searchBar = document.getElementById('searchBar');
        const searchButton = document.getElementById('searchButton');
        const eventsTable = document.querySelector('.table tbody');

        searchButton.addEventListener('click', () => page(`/admin/events/?filter=${encodeURIComponent(searchBar.value)}`));
        searchBar.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') searchButton.click();
        });

        const pagination = document.getElementById('pagination');
        const paginationBack = document.getElementById('pagination-back');
        const paginationNext = document.getElementById('pagination-next');
        const paginationBackListItem = document.getElementById('pagination-back-li');
        const paginationCurrent = document.getElementById('pagination-current');
        let switchingPage = false;

        if (events.length >= limit) pagination.classList.remove('d-none');

        paginationBack.addEventListener('click', async () => {
            if (switchingPage || offset < limit) return;

            switchingPage = true;
            offset -= limit;
            if (offset < limit) paginationBackListItem.classList.add('disabled');

            const events = await eventsApi.getFilteredEvents({ filters, offset, limit, orderBy});

            paginationCurrent.innerHTML = `${(offset + limit) / limit}`;
            eventsTable.innerHTML = '';

            eventsTable.insertAdjacentHTML('beforeend', `
                ${events.reduce((html, event) => html += `
                        <tr>
                            <td><a href="/admin/events/${event.eventId}">${event.eventId}</a></td>
                            <td>${event.title}</td>
                            <td>${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(event.date))}</td>
                            <td><i class="bi bi-currency-euro"></i> ${event.registrationCost}</td>
                            <td><a href="/admin/users/${event.organizer.organizerId}">${event.organizer.email}</td>
                            <td><i class="bi bi-ticket"></i> x ${event.registrationCount}</td>
                        </tr>
                        `, '')}`);

            paginationBack.blur();
            switchingPage = false;
        })

        paginationNext.addEventListener('click', async () => {
            if (switchingPage) return;

            switchingPage = true;
            offset += limit;

            let events = await eventsApi.getFilteredEvents({ filters, offset, limit, orderBy});

            if (!events.length) {
                if (offset === limit) {
                    paginationNext.classList.add('disabled');
                    return;
                }

                offset = 0;
                events = await eventsApi.getFilteredEvents({ filters, offset, limit, orderBy});

                paginationBackListItem.classList.add('disabled');
                paginationNext.blur();
            }

            paginationCurrent.innerHTML = `${(offset + limit) / limit}`;

            eventsTable.innerHTML = '';
            eventsTable.insertAdjacentHTML('beforeend', `
                ${events.reduce((html, event) => html += `
                        <tr>
                            <td><a href="/admin/events/${event.eventId}">${event.eventId}</a></td>
                            <td>${event.title}</td>
                            <td>${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(event.date))}</td>
                            <td><i class="bi bi-currency-euro"></i> ${event.registrationCost}</td>
                            <td><a href="/admin/users/${event.organizer.organizerId}">${event.organizer.email}</td>
                            <td><i class="bi bi-ticket"></i> x ${event.registrationCount}</td>
                        </tr>
                        `, '')}`);

            if (offset) paginationBackListItem.classList.remove('disabled');

            paginationNext.blur();
            switchingPage = false;
        });
    } catch (error) {
        console.error(error);
        page('/admin/events');
    }
}

adminController.event = async function (ctx, next) {
    document.getElementById('navbar').innerHTML = renderAdminNavbar();
    document.querySelectorAll('#navbar li a')[0].classList.remove('link-dark');
    document.querySelectorAll('#navbar li a')[0].classList.add('link-underline-primary');
    document.getElementById('footer').innerHTML = '<br><br>';
    
    try {
        const event = await eventsApi.getOrganizerEvent(ctx.params.eventId);
        event.address = await osmApi.getAddress(event.location.latitude, event.location.longitude);

        document.getElementById('main').innerHTML = renderAdminEvent(event);

        document.getElementById('download').addEventListener('click', async () => {
            async function getBase64ImageFromURL(url) {
                const res = await fetch(url);
                const blob = await res.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            }

            async function generatePDF(event) {
                try {
                    const imgData = await getBase64ImageFromURL(event.imagePaths.length ? event.imagePaths[0] : '/events/default.png');
                    const imgType = imgData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
                    const doc = new window.jspdf.jsPDF();

                    const imgWidth = doc.internal.pageSize.getWidth() * 0.8;
                    const imgHeight = imgWidth / 2;
                    const imgX = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
                    doc.addImage(imgData, imgType, imgX, 10, imgWidth, imgHeight);

                    doc.setFontSize(20);
                    doc.text(event.title, doc.internal.pageSize.getWidth() / 2, imgHeight + 20, { align: 'center' });

                    const detailsY = imgHeight + 40;
                    doc.setFontSize(12);

                    const dateText = 'Date: ' + new Date(event.date).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
                    doc.text(dateText, 10, detailsY + 10);

                    const locationText = 'Location: ' + event.address.display_name;
                    const maxWidth = doc.internal.pageSize.getWidth() - 20;
                    const wrappedLocationText = doc.splitTextToSize(locationText, maxWidth);
                    doc.text(wrappedLocationText, 10, detailsY + 20);

                    const priceY = detailsY + 40 + wrappedLocationText.length * 10;
                    doc.text('Price: € ' + event.registrationCost, 10, priceY);
                    doc.text('Quantity: ' + event.registrationCount, 10, priceY + 10);
                    doc.text('Total: € ' + (event.registrationCost * event.registrationCount), 10, priceY + 20);

                    const barcodeCanvas = document.createElement('canvas');
                    window.JsBarcode(barcodeCanvas, String(event.eventId), {
                        format: 'CODE128',
                        displayValue: false
                    });

                    const barcodeImgData = barcodeCanvas.toDataURL();
                    const barcodeWidth = 70;
                    const barcodeHeight = 20;
                    const barcodeX = (doc.internal.pageSize.getWidth() - barcodeWidth) / 2;
                    const barcodeY = doc.internal.pageSize.getHeight() - 50;
                    doc.addImage(barcodeImgData, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight);

                    const logoWidth = 60;
                    const logoHeight = 30;
                    const logoX = (doc.internal.pageSize.getWidth() - logoWidth) / 2;
                    const logoY = doc.internal.pageSize.getHeight() - 30;
                    const logoData = await getBase64ImageFromURL('/events/default.png');
                    doc.addImage(logoData, 'PNG', logoX, logoY, logoWidth, logoHeight);

                    if (event.registrations.length) {
                        doc.addPage();

                        const tableData = event.registrations.map((reg, index) => [
                            index + 1,
                            String(reg.registrationId),
                            reg.user.firstName,
                            reg.user.lastName,
                            reg.user.email,
                            String(reg.quantity),
                            new Date(reg.date).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
                        ]);

                        doc.autoTable({
                            head: [['#', 'Registration ID', 'First Name', 'Last Name', 'Email', 'Quantity', 'Date']],
                            body: tableData,
                            startY: 10,
                            theme: 'striped'
                        });
                    }

                    doc.save(`Event #${event.eventId}.pdf`);
                } catch (error) {
                    console.error(error);
                }
            }


            await generatePDF(event);
        });

        document.getElementById('edit').addEventListener('click', async () => {
            page(`/admin/events/update/${event.eventId}`);
        });

        document.getElementById('delete').addEventListener('click', async () => {
            try {
                await eventsApi.deleteEvent(event.eventId);
                page(`/admin/events/?message=${encodeURIComponent(`Event #${event.eventId} deleted`)}`);
            } catch (error) {
                const errorAlert =
                    `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    ${error.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;

                const previousAlert = document.querySelector('.alert.alert-danger');
                if (previousAlert) previousAlert.remove()
                document.querySelector('.container-xxl').insertAdjacentHTML('afterbegin', errorAlert);

                return;
            }
        });

    } catch (error) {
        console.error(error);
        page('/admin/events');
    }
}

adminController.updateEvent = async function (ctx, next) {    
    let event;

    try {
        event = await eventsApi.getEvent(ctx.params.eventId);

        document.getElementById('navbar').innerHTML = renderAdminNavbar();
        document.querySelectorAll('#navbar li a')[0].classList.remove('link-dark');
        document.querySelectorAll('#navbar li a')[0].classList.add('link-underline-primary');
        document.getElementById('main').innerHTML = renderUpdateEvent(event);
        document.getElementById('footer').innerHTML = '<br><br>';
        document.querySelector('.breadcrumb-item a').setAttribute('href', '/admin/events');
        document.querySelector('.breadcrumb-item').insertAdjacentHTML('afterend', `<li class="breadcrumb-item"><a href="/admin/events/${event.eventId}">${event.title.length > 30 ? event.title.slice(0, 30) + '...' : event.title}</a></li>`)
    } catch (error) {
        console.error(error);
        return page('/admin/events');
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

            page(`/admin/events`);
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

adminController.createEvent = async function (ctx, next) {
    document.getElementById('main').innerHTML = renderCreateEvent();
    document.getElementById('footer').innerHTML = '<br><br>';
    document.querySelector('.breadcrumb-item a').setAttribute('href', '/admin/events');

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
            page(`/admin/events/${eventId}`);
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

adminController.users = async function (ctx, next) {
    const params = new URLSearchParams(ctx.querystring);

    document.getElementById('navbar').innerHTML = renderAdminNavbar();
    document.querySelectorAll('#navbar li a')[1].classList.remove('link-dark');
    document.querySelectorAll('#navbar li a')[1].classList.add('link-underline-primary');
    document.getElementById('main').innerHTML = renderAdminDashboard();
    document.getElementById('footer').innerHTML = '';
    document.getElementById('title').innerHTML = 'Users';

    if (params.get('message'))
        document.querySelector('.container-xxl').insertAdjacentHTML('afterbegin', `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                ${params.get('message')}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`
        );

    try {
        let offset = 0;
        const limit = 20;

        const users = await adminApi.getUsers(params.get('filter'), offset, limit);
        document.querySelector('.row').insertAdjacentHTML('afterend', `
            <div class="scrollable-div-lg overflow-auto p-3 my-4 border rounded">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">User ID</th>
                            <th scope="col">First Name</th>
                            <th scope="col">Last Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.reduce((html, user) => html += `
                        <tr>
                            <td><a href="/admin/users/${user.userId}">${user.userId}</td>
                            <td>${user.firstName}</a></td>
                            <td>${user.lastName}</a></td>
                            <td>${user.email}</a></td>
                            <td>${user.role[0].toUpperCase() + user.role.slice(1)}</a></td>
                        </tr>
                        `, '')}
                    </tbody>
                </table>
            </div>
        `);

        if (users.length === limit) document.getElementById('pagination').classList.remove('d-none');

        const searchBar = document.getElementById('searchBar');
        const searchButton = document.getElementById('searchButton');
        const usersTable = document.querySelector('.table tbody');

        searchButton.addEventListener('click', () => page(`/admin/users/?filter=${encodeURIComponent(searchBar.value)}`));
        searchBar.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') searchButton.click();
        });

        const pagination = document.getElementById('pagination');
        const paginationBack = document.getElementById('pagination-back');
        const paginationNext = document.getElementById('pagination-next');
        const paginationBackListItem = document.getElementById('pagination-back-li');
        const paginationCurrent = document.getElementById('pagination-current');
        let switchingPage = false;

        if (users.length >= limit) pagination.classList.remove('d-none');

        paginationBack.addEventListener('click', async () => {
            if (switchingPage || offset < limit) return;

            switchingPage = true;
            offset -= limit;
            if (offset < limit) paginationBackListItem.classList.add('disabled');

            const users = await adminApi.getUsers(params.get('filter'), offset, limit);

            paginationCurrent.innerHTML = `${(offset + limit) / limit}`;
            usersTable.innerHTML = '';

            usersTable.insertAdjacentHTML('beforeend', `
                ${users.reduce((html, user) => html += `
                        <tr>
                            <td><a href="/admin/users/${user.userId}">${user.userId}</td>
                            <td>${user.firstName}</a></td>
                            <td>${user.lastName}</a></td>
                            <td>${user.email}</a></td>
                            <td>${user.role[0].toUpperCase() + user.role.slice(1)}</a></td>
                        </tr>
                        `, '')}`);

            paginationBack.blur();
            switchingPage = false;
        })

        paginationNext.addEventListener('click', async () => {
            if (switchingPage) return;

            switchingPage = true;
            offset += limit;

            let users = await adminApi.getUsers(params.get('filter'), offset, limit);

            if (!users.length) {
                if (offset === limit) {
                    paginationNext.classList.add('disabled');
                    return;
                }

                offset = 0;
                users = await adminApi.getUsers(params.get('filter'), offset, limit);

                paginationBackListItem.classList.add('disabled');
                paginationNext.blur();
            }

            paginationCurrent.innerHTML = `${(offset + limit) / limit}`;

            usersTable.innerHTML = '';
            usersTable.insertAdjacentHTML('beforeend', `
                ${users.reduce((html, user) => html += `
                        <tr>
                            <td><a href="/admin/users/${user.userId}">${user.userId}</td>
                            <td>${user.firstName}</a></td>
                            <td>${user.lastName}</a></td>
                            <td>${user.email}</a></td>
                            <td>${user.role[0].toUpperCase() + user.role.slice(1)}</a></td>
                        </tr>
                        `, '')}`);

            if (offset) paginationBackListItem.classList.remove('disabled');

            paginationNext.blur();
            switchingPage = false;
        });
    } catch (error) {
        console.error(error);
        page('/admin/users');
    }
}

adminController.user = async function (ctx, next) {
    document.getElementById('navbar').innerHTML = renderAdminNavbar();
    document.querySelectorAll('#navbar li a')[1].classList.remove('link-dark');
    document.querySelectorAll('#navbar li a')[1].classList.add('link-underline-primary');
    
    try {
        const user = await adminApi.getUserById(ctx.params.userId);
        document.getElementById('main').innerHTML = renderUserProfile(user);
        document.getElementById('footer').innerHTML = '<br><br>';
        document.querySelector('#main .container').insertAdjacentHTML('afterbegin', `
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb pb-3">
                    <li class="breadcrumb-item"><a href="/admin/users">Users</a></li>
                    <li class="breadcrumb-item active" aria-current="page">${user.firstName + ' ' + user.lastName}</li>
                </ol>
            </nav>
        `);
        document.querySelector('.registrations div a').remove();
        document.querySelector('#events').remove();
        document.querySelector('.user-info a').setAttribute('href', `/admin/users/update/${user.userId}`);
        document.querySelector('#main .container').insertAdjacentHTML('beforeend', `
            <div class="scrollable-div overflow-auto p-3 border rounded">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Event ID</th>
                            <th scope="col">Title</th>
                            <th scope="col">Date</th>
                            <th scope="col">Price</th>
                            <th scope="col">Organizer</th>
                            ${user.role !== 'participant' ? '<th scope="col">Registrations</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>

                    </tbody>
                </table>
            </div>
        `);
        const filters = { date: formatDate(new Date()) };
        if (user.role === 'organizer' || user.role === 'administrator') filters.organizerId = user.userId;
        else filters.userId = user.userId;

        const events = await eventsApi.getFilteredEvents({ filters });

        document.querySelector('table tbody').innerHTML = events.reduce((html, event) => html +=`
            <tr>
                <td><a href="/admin/events/${event.eventId}">${event.eventId}</a></td>
                <td>${event.title}</td>
                <td>${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(event.date))}</td>
                <td><i class="bi bi-currency-euro"></i> ${event.registrationCost}</td>
                <td><a href="/admin/users/${event.organizer.organizerId}">${event.organizer.email}</td>
                ${user.role !== 'participant' ? `<td><i class="bi bi-ticket"></i> x ${event.registrationCount}</td>` : ''}
            </tr>
        `, '');
    } catch (error) {
        console.error(error);
    }
}

adminController.updateUser = async function (ctx, next) {
    document.getElementById('navbar').innerHTML = renderAdminNavbar();
    document.querySelectorAll('#navbar li a')[1].classList.remove('link-dark');
    document.querySelectorAll('#navbar li a')[1].classList.add('link-underline-primary');
    document.getElementById('footer').innerHTML = '<br><br>';

    try {
        const user = await adminApi.getUserById(ctx.params.userId);
        document.getElementById('main').innerHTML = renderUpdateUserProfile(user);

        document.querySelector('#deleteModal .modal-body').innerHTML = 'Are you sure you want to delete this user profile?';
        document.querySelector('.container').insertAdjacentHTML('afterbegin', `
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb pb-3">
                    <li class="breadcrumb-item"><a href="/admin/users">Users</a></li>
                    <li class="breadcrumb-item"><a href="/admin/users/${user.userId}">${user.email}</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Update</li>
                </ol>
            </nav>
        `);
        document.querySelector('#change-password-form div').remove();
    
        const firstNameInput = document.getElementById('first-name-input');
        const firstNameEdit = document.getElementById('first-name-edit');
        const firstNameSave = document.getElementById('first-name-save');
        const firstNameError = document.getElementById('first-name-error');
    
        const lastNameInput = document.getElementById('last-name-input');
        const lastNameEdit = document.getElementById('last-name-edit');
        const lastNameSave = document.getElementById('last-name-save');
        const lastNameError = document.getElementById('last-name-error');
    
        const emailInput = document.getElementById('email-input');
        const emailEdit = document.getElementById('email-edit');
        const emailSave = document.getElementById('email-save');
        const emailError = document.getElementById('email-error');
    
        const passwordInput = document.getElementById('password-input');
        const passwordEdit = document.getElementById('password-edit');
        const newPasswordInput = document.getElementById('new-password');
        const newPasswordError = document.getElementById('new-password-error');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const confirmPasswordError = document.getElementById('confirm-password-error');
        const changePasswordButton = document.getElementById('change-password-button');
    
        const profilePicture = document.getElementById('profile-picture');
        const profilePictureEdit = document.getElementById('profile-picture-edit');
        const profilePictureDelete = document.getElementById('profile-picture-delete');
        const profilePictureInput = document.getElementById('profile-picture-input');
    
        const deleteProfileButton = document.getElementById('delete-profile-button');
    
        firstNameSave.style.display = 'none';
        lastNameSave.style.display = 'none';
        emailSave.style.display = 'none';
        profilePictureInput.style.display = 'none';
    
        firstNameInput.style.backgroundColor = '#fff';
        lastNameInput.style.backgroundColor = '#fff';
        emailInput.style.backgroundColor = '#fff';
        passwordInput.style.backgroundColor = '#fff';
    
        const showEditButton = () => {
            firstNameEdit.style.display = 'block';
            firstNameSave.style.display = 'none';
            firstNameInput.setAttribute('disabled', 'disabled');
            firstNameInput.value = user.firstName;
            lastNameEdit.style.display = 'block';
            lastNameSave.style.display = 'none';
            lastNameInput.setAttribute('disabled', 'disabled');
            lastNameInput.value = user.lastName;
            emailEdit.style.display = 'block';
            emailSave.style.display = 'none';
            emailInput.setAttribute('disabled', 'disabled');
            emailInput.value = user.email;
        };
    
        const setCursorToEnd = (input) => {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        };
    
        firstNameEdit.addEventListener('click', () => {
            showEditButton();
            firstNameEdit.style.display = 'none';
            firstNameSave.style.display = 'block';
            firstNameInput.removeAttribute('disabled');
            setCursorToEnd(firstNameInput);
        });
    
        firstNameInput.addEventListener('input', () => {
            if (/^[A-Za-z ]{3,}$/.test(firstNameInput.value)) {
                firstNameSave.removeAttribute('disabled');
                firstNameError.textContent = '';
            }
            else {
                firstNameSave.setAttribute('disabled', 'disabled');
                firstNameError.textContent = 'First name must be at least 3 characters long and contain only letters';
            }
        })
    
        firstNameSave.addEventListener('click', async () => {
            try {
                if (firstNameInput.value !== user.firstName) {
                    await adminApi.updateFirstName(user.userId, firstNameInput.value);
                    firstNameInput.value = capitalize(firstNameInput.value);
                    user.firstName = firstNameInput.value;
    
                    const successAlert =
                        `<div class="container">
                            <div class="alert alert-success alert-dismissible fade show" role="alert">
                                First name changed successfully
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                            </div>
                        </div>`;
    
                    const previousAlert = document.querySelector('.alert');
                    if (previousAlert) previousAlert.remove();
    
                    document.querySelector('#navbar').insertAdjacentHTML('afterend', successAlert);
                }
    
                firstNameInput.setAttribute('disabled', 'disabled');
                firstNameInput.blur();
                firstNameSave.style.display = 'none';
                firstNameEdit.style.display = 'block';
            } catch (error) {
                const errorAlert =
                    `<div class="container">
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            ${error.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>`;
    
                const previousAlert = document.querySelector('.alert');
                if (previousAlert) previousAlert.remove();
    
                document.querySelector('#navbar').insertAdjacentHTML('afterend', errorAlert);
            }
        });
    
        lastNameEdit.addEventListener('click', () => {
            showEditButton();
            lastNameEdit.style.display = 'none';
            lastNameSave.style.display = 'block';
            lastNameInput.removeAttribute('disabled');
            setCursorToEnd(lastNameInput);
        });
    
        lastNameInput.addEventListener('input', () => {
            if (/^[A-Za-z ]{3,}$/.test(lastNameInput.value)) {
                lastNameSave.removeAttribute('disabled');
                lastNameError.textContent = '';
            }
            else {
                lastNameSave.setAttribute('disabled', 'disabled');
                lastNameError.textContent = 'Last name must be at least 3 characters long and contain only letters';
            }
        })
    
        lastNameSave.addEventListener('click', async () => {
            try {
                if (lastNameInput.value !== user.lastName) {
                    await adminApi.updateLastName(user.userId, lastNameInput.value);
                    lastNameInput.value = capitalize(lastNameInput.value);
                    user.lastName = lastNameInput.value;
    
                    const successAlert =
                        `<div class="container">
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            Last name changed successfully
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>`;
    
                    const previousAlert = document.querySelector('.alert');
                    if (previousAlert) previousAlert.remove();
    
                    document.querySelector('#navbar').insertAdjacentHTML('afterend', successAlert);
                }
    
                lastNameInput.setAttribute('disabled', 'disabled');
                lastNameInput.blur();
                lastNameSave.style.display = 'none';
                lastNameEdit.style.display = 'block';
            } catch (error) {
                const errorAlert =
                    `<div class="container">
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            ${error.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>`;
    
                const previousAlert = document.querySelector('.alert');
                if (previousAlert) previousAlert.remove();
    
                document.querySelector('#navbar').insertAdjacentHTML('afterend', errorAlert);
            }
        });
    
        emailEdit.addEventListener('click', () => {
            showEditButton();
            emailEdit.style.display = 'none';
            emailSave.style.display = 'block';
            emailInput.removeAttribute('disabled');
            emailInput.focus();
        });
    
        emailInput.addEventListener('input', () => {
            if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(emailInput.value)) {
                emailSave.removeAttribute('disabled');
                emailError.textContent = '';
            }
            else {
                emailSave.setAttribute('disabled', 'disabled');
                emailError.textContent = 'Email is not valid';
            }
        })
    
        emailSave.addEventListener('click', async () => {
            try {
                if (emailInput.value !== user.email) {
                    await adminApi.updateEmail(user.userId, emailInput.value);
                    user.email = emailInput.value;
    
                    const successAlert =
                        `<div class="container">
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            Email changed successfully
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>`;
    
                    const previousAlert = document.querySelector('.alert');
                    if (previousAlert) previousAlert.remove();
    
                    document.querySelector('#navbar').insertAdjacentHTML('afterend', successAlert);
                }
    
                emailInput.setAttribute('disabled', 'disabled');
                emailInput.blur();
                emailSave.style.display = 'none';
                emailEdit.style.display = 'block';
            } catch (error) {
                const errorAlert =
                    `<div class="container">
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            ${error.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>`;
    
                const previousAlert = document.querySelector('.alert');
                if (previousAlert) previousAlert.remove();
    
                document.querySelector('#navbar').insertAdjacentHTML('afterend', errorAlert);
            }
        });
    
        passwordEdit.addEventListener('click', showEditButton);
    
        const isNewPasswordValid = () => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(newPasswordInput.value);
        const passwordsMatch = () => newPasswordInput.value === confirmPasswordInput.value;
        const validateForm = () => {
            if (isNewPasswordValid() && passwordsMatch())
                changePasswordButton.removeAttribute('disabled');
            else changePasswordButton.setAttribute('disabled', 'disabled');
        };
    
        newPasswordInput.addEventListener('input', () => {
            if (isNewPasswordValid()) newPasswordError.textContent = '';
            else newPasswordError.textContent = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';
        });
        newPasswordInput.addEventListener('input', validateForm);
    
        confirmPasswordInput.addEventListener('input', () => {
            if (passwordsMatch()) confirmPasswordError.textContent = '';
            else confirmPasswordError.textContent = 'Passwords do not match';
        });
        confirmPasswordInput.addEventListener('input', validateForm);
    
        changePasswordButton.addEventListener('click', async (event) => {
            event.preventDefault();
    
            try {
                await adminApi.updatePassword(user.userId, newPasswordInput.value);
                const successAlert =
                    `<div class="container">
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            Password changed successfully
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>`;
    
                const previousAlert = document.querySelector('.alert');
                if (previousAlert) previousAlert.remove();
    
                document.querySelector('#navbar').insertAdjacentHTML('afterend', successAlert);
            } catch (error) {
                const errorAlert =
                    `<div class="container">
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            ${error.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>`;
    
                const previousAlert = document.querySelector('.alert');
                if (previousAlert) previousAlert.remove();
    
                document.querySelector('#navbar').insertAdjacentHTML('afterend', errorAlert);
            } finally {
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';
            }
        });
    
        profilePictureEdit.addEventListener('click', () => {
            profilePictureInput.click();
        });
    
        profilePictureInput.addEventListener('change', async (ev) => {
            const selectedFile = ev.target.files[0];
            if (!selectedFile) return;
    
            try {
                const formData = new FormData();
                formData.append('profilePicture', selectedFile);
                await adminApi.updateProfilePicture(user.userId, formData);
                const successAlert =
                    `<div class="container">
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        Profile picture changed successfully
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                </div>`;
    
                const previousAlert = document.querySelector('.alert');
                if (previousAlert) previousAlert.remove();
    
                document.querySelector('#navbar').insertAdjacentHTML('afterend', successAlert);
    
                const newProfilePicture = (await adminApi.getUserById(user.userId)).profilePicture;
                profilePicture.setAttribute('src', newProfilePicture);
            } catch (error) {
                const errorAlert =
                    `<div class="container">
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            ${error.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>`;
    
                const previousAlert = document.querySelector('.alert');
                if (previousAlert) previousAlert.remove();
    
                document.querySelector('#navbar').insertAdjacentHTML('afterend', errorAlert);
            }
        });
    
        profilePictureDelete.addEventListener('click', async () => {
            try {
                await adminApi.deleteProfilePicture(user.userId);
                const successAlert =
                    `<div class="container">
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        Profile picture deleted successfully
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                </div>`;
    
                const previousAlert = document.querySelector('.alert');
                if (previousAlert) previousAlert.remove();
    
                document.querySelector('#navbar').insertAdjacentHTML('afterend', successAlert);
    
                profilePicture.setAttribute('src', '/users/default.png');
            } catch (error) {
                const errorAlert =
                    `<div class="container">
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            ${error.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>`;
    
                const previousAlert = document.querySelector('.alert');
                if (previousAlert) previousAlert.remove();
    
                document.querySelector('#navbar').insertAdjacentHTML('afterend', errorAlert);
            }
        });
    
        deleteProfileButton.addEventListener('click', async () => {
            try {
                await adminApi.deleteUser(user.userId);
                page(`/admin/users/?message=${encodeURIComponent(`User #${user.userId} deleted`)}`);
            } catch (error) {
                const errorAlert =
                    `<div class="container">
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            ${error.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    </div>`;
    
                const previousAlert = document.querySelector('.alert');
                if (previousAlert) previousAlert.remove();
    
                document.querySelector('#navbar').insertAdjacentHTML('afterend', errorAlert);
            }
        });
    } catch (error) {
        
    }
}

adminController.orders = async function (ctx, next) {
    const params = new URLSearchParams(ctx.querystring);

    document.getElementById('navbar').innerHTML = renderAdminNavbar();
    document.querySelectorAll('#navbar li a')[2].classList.remove('link-dark');
    document.querySelectorAll('#navbar li a')[2].classList.add('link-underline-primary');
    document.getElementById('main').innerHTML = renderAdminDashboard();
    document.getElementById('footer').innerHTML = '';
    document.getElementById('title').innerHTML = 'Orders';

    if (params.get('message'))
        document.querySelector('.container-xxl').insertAdjacentHTML('afterbegin', `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                ${params.get('message')}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`
        );

    try {
        let offset = 0;
        const limit = 20;

        const registrations = await adminApi.getRegistrations({ filter: params.get('filter'), offset, limit});
        document.querySelector('.row').insertAdjacentHTML('afterend', `
            <div class="scrollable-div-lg overflow-auto p-3 my-4 border rounded">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Registration ID</th>
                            <th scope="col">Event</th>
                            <th scope="col">Date</th>
                            <th scope="col">Organizer</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${registrations.reduce((html, registration) => html += `
                        <tr>
                            <td><a href="/admin/orders/${registration.registrationId}">${registration.registrationId}</a></td>
                            <td><a href="/admin/events/${registration.event.eventId}">${registration.event.title}</td>
                            <td>${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(registration.date))}</td>
                            <td><a href="/admin/users/${registration.event.organizer.organizerId}">${registration.event.organizer.email}</td>
                            <td><i class="bi bi-ticket"></i> x ${registration.quantity}</td>
                            <td><i class="bi bi-currency-euro"></i> ${registration.event.registrationCost ? (registration.event.registrationCost * registration.quantity).toFixed(2) : 'Free'}</td>
                        </tr>
                        `, '')}
                    </tbody>
                </table>
            </div>
        `);

        if (registrations.length === limit) document.getElementById('pagination').classList.remove('d-none');

        const searchBar = document.getElementById('searchBar');
        const searchButton = document.getElementById('searchButton');
        const registrationsTable = document.querySelector('.table tbody');

        searchButton.addEventListener('click', () => page(`/admin/orders/?filter=${encodeURIComponent(searchBar.value)}`));
        searchBar.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') searchButton.click();
        });

        const pagination = document.getElementById('pagination');
        const paginationBack = document.getElementById('pagination-back');
        const paginationNext = document.getElementById('pagination-next');
        const paginationBackListItem = document.getElementById('pagination-back-li');
        const paginationCurrent = document.getElementById('pagination-current');
        let switchingPage = false;

        if (registrations.length >= limit) pagination.classList.remove('d-none');

        paginationBack.addEventListener('click', async () => {
            if (switchingPage || offset < limit) return;

            switchingPage = true;
            offset -= limit;
            if (offset < limit) paginationBackListItem.classList.add('disabled');

            const registrations = await adminApi.getRegistrations({ filter: params.get('filter'), offset, limit});

            paginationCurrent.innerHTML = `${(offset + limit) / limit}`;
            registrationsTable.innerHTML = '';

            registrationsTable.insertAdjacentHTML('beforeend', `
                ${registrations.reduce((html, registration) => html += `
                    <tr>
                        <td><a href="/admin/orders/${registration.registrationId}">${registration.registrationId}</a></td>
                        <td><a href="/admin/events/${registration.event.eventId}">${registration.event.title}</td>
                        <td>${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(registration.date))}</td>
                        <td><a href="/admin/users/${registration.event.organizer.organizerId}">${registration.event.organizer.email}</td>
                        <td><i class="bi bi-currency-euro"></i> ${registration.event.registrationCost}</td>
                        <td><i class="bi bi-ticket"></i> x ${registration.quantity}</td>
                    </tr>
                    `, '')}`);

            paginationBack.blur();
            switchingPage = false;
        })

        paginationNext.addEventListener('click', async () => {
            if (switchingPage) return;

            switchingPage = true;
            offset += limit;

            let registrations = await adminApi.getRegistrations({ filter: params.get('filter'), offset, limit});

            if (!registrations.length) {
                if (offset === limit) {
                    paginationNext.classList.add('disabled');
                    return;
                }

                offset = 0;
                registrations = await adminApi.getRegistrations({ filter: params.get('filter'), offset, limit});

                paginationBackListItem.classList.add('disabled');
                paginationNext.blur();
            }

            paginationCurrent.innerHTML = `${(offset + limit) / limit}`;

            registrationsTable.innerHTML = '';
            registrationsTable.insertAdjacentHTML('beforeend', `
                ${registrations.reduce((html, registration) => html += `
                <tr>
                    <td><a href="/admin/orders/${registration.registrationId}">${registration.registrationId}</a></td>
                    <td><a href="/admin/events/${registration.event.eventId}">${registration.event.title}</td>
                    <td>${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(registration.date))}</td>
                    <td><a href="/admin/users/${registration.event.organizer.organizerId}">${registration.event.organizer.email}</td>
                    <td><i class="bi bi-currency-euro"></i> ${registration.event.registrationCost}</td>
                    <td><i class="bi bi-ticket"></i> x ${registration.quantity}</td>
                </tr>
                `, '')}`);

            if (offset) paginationBackListItem.classList.remove('disabled');

            paginationNext.blur();
            switchingPage = false;
        });
    } catch (error) {
        console.error(error);
        page('/admin/orders');
    }
}

adminController.order = async function (ctx, next) {
    document.getElementById('navbar').innerHTML = renderAdminNavbar();
    document.querySelectorAll('#navbar li a')[2].classList.remove('link-dark');
    document.querySelectorAll('#navbar li a')[2].classList.add('link-underline-primary');

    try {
        const order = await adminApi.getRegistration(ctx.params.orderId);
        order.event.address = await osmApi.getAddress(order.event.location.latitude, order.event.location.longitude);

        document.getElementById('main').innerHTML = renderOrder(order);
        document.querySelector('.breadcrumb li').innerHTML = '<a href="/admin/orders">Orders</a>';
        document.querySelectorAll('#main .container.row div')[1].querySelector('a').setAttribute('href', `/admin/events/${order.event.eventId}`);
        document.querySelectorAll('#main .container.row div')[1].querySelectorAll('a')[1].setAttribute('href', `/admin/users/${order.event.organizer.organizerId}`);
        document.querySelector('table tbody a').setAttribute('href', `/admin/events/${order.event.eventId}`);
        document.querySelector('#deleteModal .modal-body').innerHTML = 'Are you sure you want to delete this order?';
        document.getElementById('download').addEventListener('click', async () => {
            async function getBase64ImageFromURL(url) {
                const res = await fetch(url);
                const blob = await res.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            }

            async function generatePDF(order) {
                try {
                    const imgData = await getBase64ImageFromURL(order.event.imagePaths.length ? order.event.imagePaths[0] : '/events/default.png');
                    const imgType = imgData.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
                    const doc = new window.jspdf.jsPDF();
            
                    const imgWidth = doc.internal.pageSize.getWidth() * 0.8;
                    const imgHeight = imgWidth / 2;
                    const imgX = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
                    doc.addImage(imgData, imgType, imgX, 10, imgWidth, imgHeight);
            
                    doc.setFontSize(20);
                    doc.text(order.event.title, doc.internal.pageSize.getWidth() / 2, imgHeight + 20, { align: 'center' });
            
                    const detailsY = imgHeight + 40;
                    doc.setFontSize(14);
                    doc.text('Event Details', 10, detailsY);
            
                    doc.setFontSize(12);
                    doc.text('Date: ' + new Date(order.event.date).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }), 10, detailsY + 10);
                    
                    const address = doc.splitTextToSize('Location: ' + order.event.address.display_name, doc.internal.pageSize.getWidth() - 20);
                    doc.text(address, 10, detailsY + 20);
                    
                    const organizer = doc.splitTextToSize('Organizer: ' + `${order.event.organizer.firstName} ${order.event.organizer.lastName} (${order.event.organizer.email})`, doc.internal.pageSize.getWidth() - 20);
                    doc.text(organizer, 10, detailsY + 30);
            
                    const customerY = detailsY + 50;
                    doc.setFontSize(14);
                    doc.text('Customer Details', 10, customerY);
            
                    doc.setFontSize(12);
                    doc.text(`Name: ${ctx.user.firstName} ${ctx.user.lastName}`, 10, customerY + 10);
                    doc.text(`Email: ${ctx.user.email}`, 10, customerY + 20);
            
                    const orderDetailsY = customerY + 40;
                    doc.setFontSize(14);
                    doc.text('Order Details', 10, orderDetailsY);
            
                    doc.setFontSize(12);
                    doc.text('Price: € ' + order.event.registrationCost, 10, orderDetailsY + 10);
                    doc.text('Quantity: ' + order.quantity, 10, orderDetailsY + 20);
                    doc.text('Total: € ' + (order.event.registrationCost * order.quantity), 10, orderDetailsY + 30);
            
                    const barcodeCanvas = document.createElement('canvas');
                    window.JsBarcode(barcodeCanvas, order.registrationId, {
                        format: 'CODE128',
                        displayValue: false
                    });
            
                    const barcodeImgData = barcodeCanvas.toDataURL();
                    const barcodeWidth = 70;
                    const barcodeHeight = 20;
                    const barcodeX = (doc.internal.pageSize.getWidth() - barcodeWidth) / 2;
                    const barcodeY = doc.internal.pageSize.getHeight() - 50;
                    doc.addImage(barcodeImgData, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight);
            
                    const logoWidth = 60;
                    const logoHeight = 30;
                    const logoX = (doc.internal.pageSize.getWidth() - logoWidth) / 2;
                    const logoY = doc.internal.pageSize.getHeight() - 30;
                    doc.addImage('/events/default.png', 'PNG', logoX, logoY, logoWidth, logoHeight);
            
                    doc.save(`Order #${order.registrationId}.pdf`);
                } catch (error) {
                    console.error(error);
                }
            }

            await generatePDF(order);
        });

        document.getElementById('delete').addEventListener('click', async () => {
            try {
                await adminApi.deleteEventRegistration(order.registrationId);
                page(`/admin/orders/?message=${encodeURIComponent(`Order #${order.registrationId} deleted`)}`);
            } catch (error) {
                const errorAlert =
                    `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    ${error.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;

                const previousAlert = document.querySelector('.alert.alert-danger');
                if (previousAlert) previousAlert.remove()
                document.querySelector('.container-xxl').insertAdjacentHTML('afterbegin', errorAlert);

                return;
            }
        });

    } catch (error) {
        console.error(error);
        page('/admin/orders')
    }
}

adminController.logs = async function (ctx, next) {
    document.getElementById('navbar').innerHTML = renderAdminNavbar();
    document.querySelectorAll('#navbar li a')[3].classList.remove('link-dark');
    document.querySelectorAll('#navbar li a')[3].classList.add('link-underline-primary');
    document.getElementById('main').innerHTML = renderLogs();
    document.getElementById('footer').innerHTML = '<br><br>';

    const logContainer = document.getElementById('logs');
    const displayLog = (message) => {
        logContainer.insertAdjacentHTML('beforeend', `<p>${message}</p>`);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    try {
        const logs = await adminApi.getLogs();
        logs.forEach(log => displayLog(log));
    } catch (error) {
        console.error(error);
    }
}

export default adminController;