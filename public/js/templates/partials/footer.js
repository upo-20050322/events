'use strict';

export default function () {
    return `
        <footer class="d-flex flex-wrap justify-content-between align-items-center p-4">
            <p class="col-md-4 mb-0 text-muted">© 2024 Events</p>

            <a href="/" class="col-md-4 d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto text-primary text-decoration-none fw-bold">
                Events
            </a>

            <ul class="nav col-md-4 justify-content-end">
                <li class="nav-item"><a href="/" class="nav-link px-2 text-muted">Home</a></li>
                <li class="nav-item"><a href="/events" class="nav-link px-2 text-muted">Events</a></li>
                <li class="nav-item"><a href="/about" class="nav-link px-2 text-muted">About</a></li>
                <li class="nav-item"><a href="/faqs" class="nav-link px-2 text-muted">FAQs</a></li>
            </ul>
        </footer>`
}