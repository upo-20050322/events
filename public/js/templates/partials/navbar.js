'use strict';

import page from '//unpkg.com/page/page.mjs';

export function renderNavbar(user, url) {
    let html = `
    <div class="container-fluid mb-4">
        <header class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4">
            <a href="/" class="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-primary text-decoration-none fw-bold fs-2">
                Events
            </a>
            <form class="nav col-6 col-md-auto flex-fill mb-2 justify-content-center mb-md-0" role="search" id="navbar-searchbar">
                <input type="search" name="searchTerm" class="form-control border-primary" placeholder="Search..." readonly
                    aria-label="Search">
            </form>
            <div class="col-md-3 text-end">`;

    if (user) {
        html += `
                <div class="dropdown">
                    <a href="#" class="d-block link-dark text-decoration-none dropdown-toggle" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
                        <img id="navbar-profile-picture" src="${user.profilePicture || '/users/default.png'}" alt="Profile" class="navbar-profile-pic rounded-circle">
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end text-small animated fadeIn" aria-labelledby="dropdownUser">
                        ${user.role === 'organizer' ? `<li><a class="dropdown-item" href="/events/create"><i class="bi bi-plus-circle"></i> Create Event</a></li>
                        <li><a class="dropdown-item" href="/user/events"><i class="bi bi-archive"></i> My Events</a></li>
                        <li><hr class="dropdown-divider"></li>` : ''}
                        ${user.role === 'participant' ? `
                        <li><a class="dropdown-item" href="/user/orders"><i class="bi bi-archive"></i> My Orders</a></li>
                        <li><hr class="dropdown-divider"></li>` : ''}
                        <li><a class="dropdown-item" href="/user/profile"><i class="bi bi-person"></i> Profile</a></li>
                        <li><a class="dropdown-item" href="/user/profile/update"><i class="bi bi-gear"></i> Settings</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="/auth/logout/?redirect=${url}"><i class="bi bi-box-arrow-left"></i> Logout</a></li>
                    </ul>
                </div>`;
    } else {
        html += `
                <a href="/auth/register" type="button" class="btn btn-outline-primary me-2">Sign Up</a>
                <a href="/auth/login/?redirect=${url}" type="button" class="btn btn-primary">Sign In</a>`;
    }
    
    html += `
            </div>
        </header>
    </div>`;

    return html;
}

export function addSearchBarEventListener() {
    document.getElementById('navbar-searchbar').addEventListener('click', (event) => {
        event.preventDefault();
        page('/events/search')
    });
}
