'use strict';

export default function renderSearch() {
    return `
    <div class="container-sm">
    <form id="form">
        <div class="container">
            <div class="row mt-3">
                <div class="col-md-8">
                    <h4><i class="bi bi-geo-alt-fill"></i> Location</h4>
                    <div class="form-group">
                        <div id="locationInputGroup" class="input-group my-3">
                            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Address</button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><button id="locationAddress" class="dropdown-item">Address</button></li>
                                <li><button id="locationLatLon" class="dropdown-item">Latitude and Longitude</button></li>
                                <li><button id="locationMap" class="dropdown-item">Map</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 px-3">
                    <h4><i class="bi bi-radar"></i> Distance Range</h4>
                    <div class="form-group my-3">
                        <input type="range" class="form-range" min="10" max="500" step="10" value="10" id="distanceRange">
                        <span id="distanceRangeValue"><b>Km</b> 10</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="container my-5">
            <div class="row my-3">
                <div class="col-md-8">
                    <h4><i class="bi bi-calendar-event"></i> Date</h4>
                    <div class="form-group my-3">
                        <input id="date" type="date" class="form-control" placeholder="Date" aria-label="Date">
                    </div>
                </div>
                <div class="col-md-4 px-3">
                    <h4><i class="bi bi-bookmark"></i> Category</h4>
                    <div class="form-group my-3">
                        <div id="categoriesDropdown" class="dropdown">
                            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                All
                            </button>
                            <ul id="categories" class="dropdown-menu">
                                <li><button class="dropdown-item">All</button></li>
                                <li><button class="dropdown-item">Music</button></li>
                                <li><button class="dropdown-item">Arts and Craft</button></li>
                                <li><button class="dropdown-item">Food and Drink</button></li>
                                <li><button class="dropdown-item">Sports and Fitness</button></li>
                                <li><button class="dropdown-item">Technology</button></li>
                                <li><button class="dropdown-item">Business and Networking</button></li>
                                <li><button class="dropdown-item">Health and Wellness</button></li>
                                <li><button class="dropdown-item">Education</button></li>
                                <li><button class="dropdown-item">Fashion and Beauty</button></li>
                                <li><button class="dropdown-item">Gaming</button></li>
                                <li><button class="dropdown-item">Travel and Outdoor</button></li>
                                <li><button class="dropdown-item">Family and Kids</button></li>
                                <li><button class="dropdown-item">Charity and Causes</button></li>
                                <li><button class="dropdown-item">Performing Arts</button></li>
                                <li><button class="dropdown-item">Film and Media</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container my-5 pt-1">
            <div class="row my-3">
                <div class="col-md-8">
                    <h4><i class="bi bi-person-badge"></i> Organizer</h4>
                    <div class="form-group mt-3">
                        <input id="organizer" type="text" class="form-control" placeholder="Organizer" aria-label="Organizer">
                    </div>
                </div>
                <div class="col-md-4 px-3">
                    <h4><i class="bi bi-wallet2"></i> Price</h4>
                    <div class="form-group my-3">
                        <input type="range" class="form-range" min="0" max="500" step="5" value="0" id="priceRange">
                        <span id="priceRangeValue"><i class="bi bi-currency-euro"></i> 0</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="form-group d-flex justify-content-center">
            <button id="search-button" type="submit" class="btn btn-lg btn-primary my-3"><i class="bi bi-search"></i> Search</button>
        </div>
    </form>
</div>

    `;
}