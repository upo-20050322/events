'use strict';

export default function renderAdminNavbar() {
    return `
    <div class="container-fluid">
        <header class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4">
            <a href="/admin/events"
                class="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-primary text-decoration-none fw-bold fs-2">
                Events
                <p class="lead pt-4 px-2 fw-light">Administrator</p>
            </a>

            <ul class="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0 mt-2">
                <li><a href="/admin/events" class="nav-link px-2 link-dark">Events</a></li>
                <li><a href="/admin/users" class="nav-link px-2 link-dark">Users</a></li>
                <li><a href="/admin/orders" class="nav-link px-2 link-dark">Orders</a></li>
                <li><a href="/admin/logs" class="nav-link px-2 link-dark">Logs</a></li>
            </ul>
            <div class="col-md-3 text-end">
                <a href="/auth/logout" class="btn btn-outline-primary">Logout</a>
            </div>
        </header>
    </div>
    `;
}
