'use strict';

export default function (organizer) {
    return `
        <div class="container mt-5">
            <div class="row">
                <div class="col-md-3">
                    <img src="${organizer.profilePicture || '/users/default.png'}" alt="Profile Picture" class="profile-picture">
                </div>
                <div class="col-md-9">
                    <div class="user-info">
                        <div class="d-flex justify-content-between align-items-center">
                            <h2>${organizer.firstName} ${organizer.lastName}</h2>
                        </div>
                        <hr>
                        <h5>${organizer.email}</h5>
                        <p>Organizer</p>
                    </div>
                </div>
                <div class="py-3 my-3 registrations">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h3>Next Events</h3>
                        <a href="/events/?organizerId=${organizer.organizerId}">View More</a>
                    </div>
                    <div class="row" id="events"></div>
                </div>
            </div>
        </div>
    `
}