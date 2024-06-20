'use strict';

import renderCategoriesRow from "../event/categoriesRow.js";

function renderIndex(errorMessage) {
    return `
    <div class="container-xxl px-md-5">
        ${errorMessage ? `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${errorMessage}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>` : ''}
        <div class="row flex-md-row-reverse align-items-center g-5 py-4 mb-4">
            <div class="col-12 col-md-6">
              <img src="/img/hero_image.png" width="607" height="510" class="d-block mx-md-auto img-fluid" loading="lazy">
            </div>
  
            <div class="col-12 col-md-6">
                <h1 class="display-5 fw-bold mb-3">Discover Great Events Near You</h1>
                <p class="lead">
                    Find Exciting Events for Every Taste and Interest or Create Your Own, All in One Place!
                </p>
  
                <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                    <a href="/events" class="btn btn-primary btn-lg px-4 me-md-2">Explore Events</a>
                </div>
            </div>
        </div>

        ${renderCategoriesRow()}
  
        <div class="d-flex my-3 align-items-center">
          <h2>Popular Events</h2>
          <a href="/events/?popular=true" class="ms-auto">View More</a>
        </div>
  
        <div class="row" id="popular-events"></div>
    </div>
    
    <section class="px-4 py-5 my-5 text-center">
        <img src="/img/publish_event.png" class="d-block mx-auto mb-4 img-fluid" alt="Publish your event for FREE" width="616" height="258" loading="lazy">
        <h1 class="display-5 fw-bold">Publish your event for FREE</h1>
        <div class="col-lg-6 mx-auto">
            <p class="lead mb-4">Publish your event in front of thousands of people for free.</p>
            <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <a href="/events/create" class="btn btn-primary btn-lg">Create Event</a>
            </div>
        </div>
    </section>`

}

export default renderIndex;