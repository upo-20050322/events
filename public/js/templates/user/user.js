'use strict';

export default function (user) {
    return `
        <div class="container mt-5">
            <div class="row">
                <div class="col-md-3">
                    <img src="${user.profilePicture || '/users/default.png'}" alt="Profile Picture" class="profile-picture">
                </div>
                <div class="col-md-9">
                    <div class="user-info">
                        <div class="d-flex justify-content-between align-items-center">
                            <h2>User Profile</h2>
                            <a href="/user/profile/update" class="btn btn-primary">Update Profile</a>
                        </div>
                        <hr>
                        <h4>${user.firstName} ${user.lastName}</h4>
                        <h5>${user.email}</h5>
                        <p>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                    </div>
                    </div>
                <div class="registrations py-3 my-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h3>Next Events</h3>
                        <a href="/user/${user.role === 'organizer' ? 'events' : 'orders'}">View More</a>
                    </div>
                    <div class="row" id="events"></div>
                </div>
            </div>
        </div>
    `
}