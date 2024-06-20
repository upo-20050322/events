'use strict';

import { renderNavbar, addSearchBarEventListener } from '../templates/partials/navbar.js';
import renderNotFound from '../templates/404.js'; 
import renderFooter from '../templates/partials/footer.js'; 

export default function notFound(ctx) {
    document.getElementById('navbar').innerHTML = renderNavbar(ctx.user);
    document.getElementById('main')  .innerHTML = renderNotFound();
    document.getElementById('footer').innerHTML = renderFooter();

    addSearchBarEventListener();
}