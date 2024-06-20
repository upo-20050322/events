'use strict';

export default function renderUpdateEvent(event) {
    let images = '';
    for (let i = 0; i < event.imagePaths.length; ++i) {
        images += `
        <div class="col" id="image-${i}">
            <div class="card shadow-sm">
                <img class="card-img-top update-image" height="200" src="${event.imagePaths[i]}" role="img" aria-label="Event Image ${i}"></img>
                <div class="card-body">
                    <button id="delete-image-${i}" type="button" class="btn btn-sm btn-danger"><i class="bi bi-trash"></i> Delete Image</button>
                </div>
            </div>
        </div>`;
    }

    const imagesSection = `
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3 my-3">
            ${images}
          </div>`;

    return `
        <div class="container-xxl px-md-5">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb pb-3">
                  <li class="breadcrumb-item"><a href="/events">Events</a></li>
                  <li class="breadcrumb-item active" aria-current="page">Update Event</li>
                </ol>
            </nav>

            <h2>Update Event</h2>

            <form id="form">
                <div class="form-group">
                    <label class="pt-3 pb-1" for="title">Title * </label>
                    <input type="text" class="form-control" id="title" placeholder="Enter event title" required>
                </div>
                <div class="form-group">
                    <label class="pt-3 pb-1" for="category">Category * </label>
                    <select id="category" class="form-select form-select-md" aria-label="Small select example">
                        <option value="Music">Music</option>
                        <option value="Arts and Crafts">Arts and Crafts</option>
                        <option value="Food and Drink">Food and Drink</option>
                        <option value="Sports and Fitness">Sports and Fitness</option>
                        <option value="Technology">Technology</option>
                        <option value="Business and Networking">Business and Networking</option>
                        <option value="Health and Wellness">Health and Wellness</option>
                        <option value="Education">Education</option>
                        <option value="Fashion and Beauty">Fashion and Beauty</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Travel and Outdoor">Travel and Outdoor</option>
                        <option value="Family and Kids">Family and Kids</option>
                        <option value="Charity and Causes">Charity and Causes</option>
                        <option value="Performing Arts">Performing Arts</option>
                        <option value="Film and Media">Film and Media</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="pt-3 pb-1" for="description">Description * </label>
                    <textarea class="form-control" id="description" rows="3" placeholder="Enter event description" required></textarea>
                </div>
                <div class="form-group">
                    <label class="pt-3 pb-1" for="date">Date * </label>
                    <input type="datetime-local" class="form-control" id="date" required>
                </div>
                <div class="form-group">
                    <label class="pt-3 pb-1">Location * </label>
                    <div id="locationInputGroup" class="input-group">
                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Address</button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><button id="locationAddress" class="dropdown-item">Address</button></li>
                            <li><button id="locationLatLon" class="dropdown-item">Latitude and Longitude</button></li>
                            <li><button id="locationMap" class="dropdown-item">Map</button></li>
                        </ul>
                    </div>
                </div>
                <div class="form-group">
                    <label class="pt-3 pb-1" for="registration-cost">Registration Cost * </label>
                    <div class="input-group mb-3">
                        <span id="currency" class="input-group-text" id="basic-addon1"><i class="bi bi-currency-euro"></i></span>
                        <input aria-describedby="currency" type="number" step="0.01" min="0.00" class="form-control" id="registration-cost" placeholder="Enter registration cost" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="pt-3 pb-1" for="max-participants">Max Participants</label>
                    <div class="input-group mb-3">
                        <span id="person" class="input-group-text" id="basic-addon1"><i class="bi bi-person-standing"></i></span>
                        <input aria-describedby="person" type="number" min="1" class="form-control" id="max-participants" placeholder="Enter max participants">
                    </div>
                </div>
                <div class="form-group">
                    <label class="pt-3 pb-1" for="images">Images</label>
                    <input type="file" class="form-control" id="images" accept=".png, .jpg, .jpeg" multiple>
                </div>
                ${imagesSection}
                <div class="form-group d-flex justify-content-center">
                    <button type="submit" class="btn btn-lg btn-primary mt-3">Update Event</button>
                </div>
            </form>
        </div>`;
}
