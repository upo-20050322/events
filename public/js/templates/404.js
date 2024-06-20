'use strict';

export default function renderNotFound() {
    return `
    <div class="container-fluid container-fluid-custom py-md-5 mb-4">
        <main>
            <div class="row py-md-5 text-center justify-content-center">
    
                <div class="col-md-12 col-lg-6">
                    <img src="/img/publish_event.png" class="d-block mx-auto mb-4 img-fluid" alt="Page Not Found" width="566" height="208" loading="lazy">

                    <h1 class="display-1 fw-bold position-relative home-title">404</h1>

                    <p class="display-6 mb-5 position-relative home-title">Page Not Found</p>
    
                    <a href="/events" class="btn btn-primary btn-lg">Explore Events</a>
                </div>
    
            </div>
        </main>
    </div>
    `;
}
