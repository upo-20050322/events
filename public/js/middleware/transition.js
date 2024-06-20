'use strict';

export default (ctx,  next) => {
    if (ctx.init) next();
    else {
        const navbar = document.getElementById('navbar');
        const main = document.getElementById('main');
        const footer = document.getElementById('footer');

        navbar.classList.add('transition');
        main.classList.add('transition');
        footer.classList.add('transition');

        setTimeout(function() {
            navbar.classList.add('translate');
            main.classList.add('translate');
            footer.classList.add('translate');

            setTimeout(function() {
                navbar.classList.remove('transition', 'translate');
                main.classList.remove('transition', 'translate');
                footer.classList.remove('transition', 'translate');
                next();
            }, 300);
        }, 0);
    }
}