'use strict';

export default function (order) {
    return `
        <div class="col-md-3">
            <a class="text-decoration-none card event-card my-3 animated fadeIn" href="/user/orders/${order.registrationId}">
                <img src="${order.event.imagePaths.length > 0 ? order.event.imagePaths[0] : '/events/default.png'}" alt="Order" class="card-img-top registration-image">
                <div class="card-body">
                    <h5 class="card-title mb-3">${order.event.title.length > 30 ? (order.event.title.slice(0, 30) + '...') : order.event.title}</h5>
                    <p class="card-text"><i class="bi bi-calendar-event"></i> ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(new Date(order.event.date))}</p>
                    <p class="card-text"><i class="bi bi-ticket"></i> x ${order.quantity}</p>
                    <hr>
                    <p class="card-text"><strong><i class="bi bi-currency-euro"></i> ${order.event.registrationCost ? (order.event.registrationCost * order.quantity).toFixed(2) : 'Free'}</strong></p>
                </div>
            </a>
        </div>
    `
}