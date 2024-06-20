'use strict';

export default function renderAdminDashboard() {
    return `<div class="container-xxl">
                <div class="row">
                    <div class="col-md-6">
                        <h1 id="title">Events</h1>
                    </div>
                    <div class="col-md-6">
                        <div class="input-group mb-3 mt-2">
                            <input id="searchBar" type="text" class="form-control" placeholder="Search..." aria-label="Search..." aria-describedby="searchButton">
                            <div class="input-group-append">
                                <button class="btn btn-outline-secondary" type="button" id="searchButton">Search</button>
                            </div>
                        </div>
                    </div>
                </div>

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
            </div>`;
}