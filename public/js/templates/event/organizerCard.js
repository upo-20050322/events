'use strict';

export default function (organizer) {
    return `
    <div class="container text-center">
    <a class="text-decoration-none card organizer-card" href="/user/organizer/${organizer.organizerId}">
        <div class="profile-picture-container">
            <img src="${organizer.profilePicture || '/users/default.png'}" alt="Profile Picture" class="profile-picture-small mt-3">
        </div>
        <div class="card-body">
            <h5 class="card-title">${organizer.firstName + ' ' + organizer.lastName}</h5>
            <p class="card-text"><strong><i class="bi bi-envelope-at"></i></strong> ${organizer.email}</p>
        </div>
    </a>
</div>
    `
}