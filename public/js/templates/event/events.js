'use strict';

import renderCategoriesRow from "./categoriesRow.js";

export default function renderEvents() {
    return `
        <div class="container-xxl px-md-5">
            ${renderCategoriesRow()}
            <div id="city-events-title" class="d-flex my-3 align-items-between">
                <div id="orderDropdown" class="dropdown ms-auto">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="orderDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Order By
                    </button>
                    <div class="dropdown-menu" aria-labelledby="orderDropdown">
                        <button class="dropdown-item active" data-order="Event.date" data-direction="ASC">Date Ascending</button>
                        <button class="dropdown-item" data-order="Event.date" data-direction="DESC">Date Descending</button>
                        <button class="dropdown-item" data-order="Event.registrationCost" data-direction="ASC">Cost Ascending</button>
                        <button class="dropdown-item" data-order="Event.registrationCost" data-direction="DESC">Cost Descending</button>
                        <button class="dropdown-item" data-order="registrationCount" data-direction="ASC">Popularity Ascending</button>
                        <button class="dropdown-item" data-order="registrationCount" data-direction="DESC">Popularity Descending</button>
                        <button class="dropdown-item" data-order="distance" data-direction="ASC">Distance Ascending</button>
                        <button class="dropdown-item" data-order="distance" data-direction="DESC">Distance Descending</button>
                    </div>
                </div>
            </div>
            <div id="map" class="rounded"></div> 
            <br>
            <div class="d-flex justify-content-start" id="filters"></div>
            <div class="row" id="city-events"></div>
            <br>
            <nav aria-label="Page navigation" id="pagination" class="d-none">
                <ul class="pagination justify-content-center">
                    <li id="pagination-back-li" class="page-item disabled">
                        <button id="pagination-back" class="page-link"><i class="bi bi-arrow-left"></i></button>
                    </li>
                    <li class="page-item">
                        <button id="pagination-current" class="page-link">1</i></button>
                    </li>
                    <li id="pagination-next-li">
                        <button id="pagination-next" class="page-link"><i class="bi bi-arrow-right"></i></button>
                    </li>
                </ul>
            </nav>
        </div>
    `
}