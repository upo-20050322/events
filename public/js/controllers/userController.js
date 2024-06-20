'use strict';

import page from '//unpkg.com/page/page.mjs';
import { renderNavbar, addSearchBarEventListener } from '../templates/partials/navbar.js';
import renderFooter from '../templates/partials/footer.js';
import renderUserProfile from '../templates/user/user.js';
import renderOrganizerProfile from '../templates/user/organizerProfile.js';
import renderUpdateUserProfile from '../templates/user/update.js';
import renderEvent from '../templates/event/eventCard.js';
import renderOrders from '../templates/user/orders.js';
import renderOrderCard from '../templates/user/orderCard.js';
import renderOrganizerEvents from '../templates/user/organizerEvents.js';
import renderOrganizerEvent from '../templates/user/organizerEvent.js';
import renderOrganizerEventCard from '../templates/user/organizerEventCard.js';
import eventsApi from '../api/eventsApi.js';
import usersApi from '../api/usersApi.js';
import osmApi from '../api/osmApi.js';
import renderOrder from '../templates/user/order.js';

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


const userController = {};

userController.userProfile = async function (ctx) {
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    document.getElementById('main').innerHTML = renderUserProfile(ctx.user);
    document.getElementById('footer').innerHTML = renderFooter();

    addSearchBarEventListener();

    try {
        const filters = { date: formatDate(new Date()) };
        if (ctx.user.role === 'organizer') filters.organizerId = ctx.user.userId;
        else filters.userId = ctx.user.userId;

        const events = await eventsApi.getFilteredEvents({
            filters,
            limit: 4
        });

        const eventsDiv = document.getElementById('events');
        events.forEach(async event => {
            event.address = await osmApi.getAddress(event.location.latitude, event.location.longitude);
            eventsDiv.insertAdjacentHTML('beforeend', renderEvent(event));
        });

        if (!events.length) eventsDiv.insertAdjacentHTML('beforeend', '<p>No Event Found</p>');
    } catch (error) {
        console.error(error);
    }
}

userController.updateUserProfile = async function (ctx) {
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    document.getElementById('main').innerHTML = renderUpdateUserProfile(ctx.user);
    document.getElementById('footer').innerHTML = '';

    addSearchBarEventListener();

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
    const oldPasswordInput = document.getElementById('old-password');
    const oldPasswordError = document.getElementById('old-password-error');
    const newPasswordInput = document.getElementById('new-password');
    const newPasswordError = document.getElementById('new-password-error');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const changePasswordButton = document.getElementById('change-password-button');

    const profilePicture = document.getElementById('profile-picture');
    const navbarProfilePicture = document.getElementById('navbar-profile-picture');
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
        firstNameInput.value = ctx.user.firstName;
        lastNameEdit.style.display = 'block';
        lastNameSave.style.display = 'none';
        lastNameInput.setAttribute('disabled', 'disabled');
        lastNameInput.value = ctx.user.lastName;
        emailEdit.style.display = 'block';
        emailSave.style.display = 'none';
        emailInput.setAttribute('disabled', 'disabled');
        emailInput.value = ctx.user.email;
    }

    const setCursorToEnd = (input) => {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }

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
            if (firstNameInput.value !== ctx.user.firstName) {
                await usersApi.updateFirstName(firstNameInput.value);
                firstNameInput.value = capitalize(firstNameInput.value);
                ctx.user.firstName = firstNameInput.value;

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
            if (lastNameInput.value !== ctx.user.lastName) {
                await usersApi.updateLastName(lastNameInput.value);
                lastNameInput.value = capitalize(lastNameInput.value);
                ctx.user.lastName = lastNameInput.value;

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
            if (emailInput.value !== ctx.user.email) {
                await usersApi.updateEmail(emailInput.value);
                ctx.user.email = emailInput.value;

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

    const isOldPasswordValid = () => oldPasswordInput.value.length >= 8;
    const isNewPasswordValid = () => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(newPasswordInput.value);
    const passwordsMatch = () => newPasswordInput.value === confirmPasswordInput.value;
    const validateForm = () => {
        if (isOldPasswordValid() && isNewPasswordValid() && passwordsMatch())
            changePasswordButton.removeAttribute('disabled');
        else changePasswordButton.setAttribute('disabled', 'disabled');
    };

    oldPasswordInput.addEventListener('input', () => {
        if (isOldPasswordValid()) oldPasswordError.textContent = '';
        else oldPasswordError.textContent = 'Password must be at least 8 characters long';
    });
    oldPasswordInput.addEventListener('input', validateForm);

    newPasswordInput.addEventListener('input', () => {
        if (isNewPasswordValid()) newPasswordError.textContent = '';
        else newPasswordError.textContent = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';
        if (passwordsMatch()) confirmPasswordError.textContent = '';
        else confirmPasswordError.textContent = 'Passwords do not match';
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
            await usersApi.updatePassword(oldPasswordInput.value, newPasswordInput.value);
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
            oldPasswordInput.value = '';
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
            await usersApi.updateProfilePicture(formData);
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

            const newProfilePicture = (await usersApi.getUser()).profilePicture;
            profilePicture.setAttribute('src', newProfilePicture);
            navbarProfilePicture.setAttribute('src', newProfilePicture);
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
            await usersApi.deleteProfilePicture();
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
            navbarProfilePicture.setAttribute('src', '/users/default.png');
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
            await usersApi.deleteUser();
            page('/');
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
}

userController.organizerProfile = async function (ctx) {

    try {
        const organizer = await usersApi.getOrganizer(ctx.params.organizerId);

        document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
        document.getElementById('main').innerHTML = renderOrganizerProfile(organizer);
        document.getElementById('footer').innerHTML = renderFooter();
        addSearchBarEventListener();
    } catch (error) {
        return page('/events');
    }

    try {
        const events = await eventsApi.getFilteredEvents({
            filters: {
                organizerId: ctx.params.organizerId,
                date: formatDate(new Date())
            },
            limit: 4
        });

        const eventsDiv = document.getElementById('events');
        events.forEach(async event => {
            event.address = await osmApi.getAddress(event.location.latitude, event.location.longitude);
            eventsDiv.insertAdjacentHTML('beforeend', renderEvent(event));
        });

        if (!events.length) eventsDiv.insertAdjacentHTML('beforeend', '<p>No Event Found</p>');
    } catch (error) {
        console.error(error);
    }
}


// Participants only

userController.orders = async function (ctx) {
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    document.getElementById('footer').innerHTML = renderFooter();
    addSearchBarEventListener();

    try {
        const params = new URLSearchParams(ctx.querystring);
        let offset = 0;
        const limit = 8;

        const orders = await eventsApi.getRegistrations({ filter: params.get('filter'), offset, limit });
        document.getElementById('main').innerHTML = renderOrders(orders);

        if (params.get('filter'))
            document.querySelector('.container-xxl').insertAdjacentHTML('afterbegin', `
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb pb-3">
                    <li class="breadcrumb-item"><a href="/user/orders">My Orders</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Search "${params.get('filter')}"</li>
                    </ol>
                </nav>`
            );

        if (params.get('message'))
            document.querySelector('.container-xxl').insertAdjacentHTML('afterbegin', `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    ${params.get('message')}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
            );

        const searchBar = document.getElementById('searchBar');
        const searchButton = document.getElementById('searchButton');

        searchButton.addEventListener('click', () => page(`/user/orders/?filter=${encodeURIComponent(searchBar.value)}`));
        searchBar.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') searchButton.click();
        });

        const ordersRow = document.getElementById('orders');
        const pagination = document.getElementById('pagination');
        const paginationBack = document.getElementById('pagination-back');
        const paginationNext = document.getElementById('pagination-next');
        const paginationBackListItem = document.getElementById('pagination-back-li');
        const paginationCurrent = document.getElementById('pagination-current');
        let switchingPage = false;

        if (orders.length >= limit) pagination.classList.remove('d-none');

        paginationBack.addEventListener('click', async () => {
            if (switchingPage || offset < limit) return;

            switchingPage = true;
            offset -= limit;
            if (offset < limit) paginationBackListItem.classList.add('disabled');

            const orders = await eventsApi.getRegistrations({
                filter: params.get('filter'),
                offset,
                limit
            });

            paginationCurrent.innerHTML = `${(offset + limit) / limit}`;
            ordersRow.innerHTML = '';

            for (const order of orders) ordersRow.insertAdjacentHTML('beforeend', renderOrderCard(order));

            paginationBack.blur();
            switchingPage = false;
        })

        paginationNext.addEventListener('click', async () => {
            if (switchingPage) return;

            switchingPage = true;
            offset += limit;

            let orders = await eventsApi.getRegistrations({
                filter: params.get('filter'),
                offset,
                limit
            });

            if (!orders.length) {
                if (offset === limit) {
                    paginationNext.classList.add('disabled');
                    return;
                }

                offset = 0;
                orders = await eventsApi.getRegistrations({
                    filter: params.get('filter'),
                    offset,
                    limit
                });

                paginationBackListItem.classList.add('disabled');
                paginationNext.blur();
            }

            paginationCurrent.innerHTML = `${(offset + limit) / limit}`;

            ordersRow.innerHTML = '';
            for (const order of orders) ordersRow.insertAdjacentHTML('beforeend', renderOrderCard(order));

            if (offset) paginationBackListItem.classList.remove('disabled');

            paginationNext.blur();
            switchingPage = false;
        })
    } catch (error) {
        const errorAlert =
            `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${error.message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;

        const previousAlert = document.querySelector('.alert .alert-danger');
        if (previousAlert) previousAlert.remove()
        document.querySelector('.container-xxl').insertAdjacentHTML('afterbegin', errorAlert);

    }
}

userController.order = async function (ctx, next) {
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    document.getElementById('footer').innerHTML = renderFooter();

    try {
        const order = await eventsApi.getRegistration(ctx.params.orderId);
        order.event.address = await osmApi.getAddress(order.event.location.latitude, order.event.location.longitude);

        document.getElementById('main').innerHTML = renderOrder(order);

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
                await eventsApi.deleteEventRegistration(order.registrationId);
                page(`/user/orders/?message=${encodeURIComponent(`Order #${order.registrationId} deleted`)}`);
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
        next();
    }
}


// Organizers only

userController.events = async function (ctx) {
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    document.getElementById('footer').innerHTML = renderFooter();
    addSearchBarEventListener();

    try {
        const params = new URLSearchParams(ctx.querystring);
        let offset = 0;
        const limit = 8;

        const events = await eventsApi.getOrganizerEvents({ filter: params.get('filter'), offset, limit });
        document.getElementById('main').innerHTML = renderOrganizerEvents(events);

        if (params.get('filter'))
            document.querySelector('.container-xxl').insertAdjacentHTML('afterbegin', `
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb pb-3">
                    <li class="breadcrumb-item"><a href="/user/events">My Events</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Search "${params.get('filter')}"</li>
                    </ol>
                </nav>`
            );

        if (params.get('message'))
            document.querySelector('.container-xxl').insertAdjacentHTML('afterbegin', `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    ${params.get('message')}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
            );

        const searchBar = document.getElementById('searchBar');
        const searchButton = document.getElementById('searchButton');

        searchButton.addEventListener('click', () => page(`/user/events/?filter=${encodeURIComponent(searchBar.value)}`));
        searchBar.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') searchButton.click();
        });

        const eventsRow = document.getElementById('events');
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

            const events = await eventsApi.getOrganizerEvents({
                filter: params.get('filter'),
                offset,
                limit
            });

            paginationCurrent.innerHTML = `${(offset + limit) / limit}`;
            eventsRow.innerHTML = '';

            for (const event of events) eventsRow.insertAdjacentHTML('beforeend', renderOrganizerEventCard(event));

            paginationBack.blur();
            switchingPage = false;
        })

        paginationNext.addEventListener('click', async () => {
            if (switchingPage) return;

            switchingPage = true;
            offset += limit;

            let events = await eventsApi.getOrganizerEvents({
                filter: params.get('filter'),
                offset,
                limit
            });

            if (!events.length) {
                if (offset === limit) {
                    paginationNext.classList.add('disabled');
                    return;
                }

                offset = 0;
                events = await eventsApi.getOrganizerEvents({
                    filter: params.get('filter'),
                    offset,
                    limit
                });

                paginationBackListItem.classList.add('disabled');
                paginationNext.blur();
            }

            paginationCurrent.innerHTML = `${(offset + limit) / limit}`;

            eventsRow.innerHTML = '';
            for (const event of events) eventsRow.insertAdjacentHTML('beforeend', renderOrganizerEventCard(event));

            if (offset) paginationBackListItem.classList.remove('disabled');

            paginationNext.blur();
            switchingPage = false;
        })
    } catch (error) {
        const errorAlert =
            `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${error.message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;

        const previousAlert = document.querySelector('.alert .alert-danger');
        if (previousAlert) previousAlert.remove()
        document.querySelector('.container-xxl').insertAdjacentHTML('afterbegin', errorAlert);

    }
}

userController.event = async function (ctx, next) {
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    document.getElementById('footer').innerHTML = renderFooter();

    try {
        const event = await eventsApi.getOrganizerEvent(ctx.params.eventId);
        event.address = await osmApi.getAddress(event.location.latitude, event.location.longitude);

        document.getElementById('main').innerHTML = renderOrganizerEvent(event);

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
            page(`/events/update/${event.eventId}`);
        });

        document.getElementById('delete').addEventListener('click', async () => {
            try {
                await eventsApi.deleteEvent(event.eventId);
                page(`/user/events/?message=${encodeURIComponent(`Event "${event.title.length > 30 ? (event.title.slice(0, 30) + '...') : event.title}" deleted`)}`);
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
        next();
    }
}

export default userController;
