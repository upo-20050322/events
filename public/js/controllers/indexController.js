'use strict';

import { renderNavbar, addSearchBarEventListener} from '../templates/partials/navbar.js';
import renderFooter from '../templates/partials/footer.js';
import renderIndex from '../templates/index/index.js';
import renderAbout from '../templates/index/about.js';
import renderFaqs from '../templates/index/faqs.js';
import renderEvent from '../templates/event/eventCard.js';
import eventsApi from '../api/eventsApi.js';
import osmApi from '../api/osmApi.js';

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}


const indexController = {};

indexController.index = async function (ctx) {
    const params = new URLSearchParams(ctx.querystring);
    
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    document.getElementById('main').innerHTML = renderIndex(params.get('error'));
    document.getElementById('footer').innerHTML = renderFooter();

    addSearchBarEventListener();

    const popularEventsRow = document.getElementById('popular-events');
    const events = await eventsApi.getFilteredEvents({
        filters: { date: formatDate(new Date()) },
        offset: 0,
        limit: 4,
        orderBy: {
            field: 'registrationCount',
            direction: 'DESC'
        }
    });

    if (events.length > 0) {
        for (const event of events.slice(0, 4)) {
            event.address = await osmApi.getAddress(event.location.latitude, event.location.longitude);
            popularEventsRow.insertAdjacentHTML('beforeend', renderEvent(event));
        }
    }
}

indexController.about = function (ctx) {
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    document.getElementById('main').innerHTML = renderAbout();
    document.getElementById('footer').innerHTML = renderFooter();

    addSearchBarEventListener();
}

indexController.faqs = function (ctx) {
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user, ctx.path);
    document.getElementById('main').innerHTML = renderFaqs();
    document.getElementById('footer').innerHTML = renderFooter();

    addSearchBarEventListener();
}

export default indexController;