'use strict';

import page from '//unpkg.com/page/page.mjs';
import authApi from '../api/authApi.js';
import renderAuthNavbar from '../templates/partials/authNavbar.js';
import renderLogin from '../templates/auth/login.js';
import renderRegister from '../templates/auth/register.js';

const authController = {};

authController.login = async function (ctx) {
    const navbar = document.getElementById('navbar');
    const main = document.getElementById('main');
    const footer = document.getElementById('footer');

    navbar.innerHTML = renderAuthNavbar();
    main.innerHTML = renderLogin();
    footer.innerHTML = '';

    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');

    const isEmailValid = () => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(emailInput.value);

    const isPasswordLengthValid = () => passwordInput.value.length >= 8;

    const validateForm = () => {
        if (isEmailValid() && isPasswordLengthValid()) loginButton.removeAttribute('disabled');
        else loginButton.setAttribute('disabled', 'disabled');
    }

    emailInput.addEventListener('input', function () {
        if (isEmailValid()) {
            emailInput.classList.remove('is-invalid');
            emailInput.classList.add('is-valid');
            document.getElementById('email-error').textContent = '';
        } else {
            emailInput.classList.remove('is-valid');
            emailInput.classList.add('is-invalid');
            document.getElementById('email-error').textContent = 'Email is not valid';
        }
    });
    emailInput.addEventListener('input', validateForm);

    passwordInput.addEventListener('input', function () {
        if (isPasswordLengthValid()) {
            passwordInput.classList.remove('is-invalid');
            passwordInput.classList.add('is-valid');
            document.getElementById('password-error').textContent = '';
        } else {
            passwordInput.classList.remove('is-valid');
            passwordInput.classList.add('is-invalid');
            document.getElementById('password-error').textContent = 'Password must be at least 8 characters long';
        }
    });
    passwordInput.addEventListener('input', validateForm);

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        try {
            const user = await authApi.login(emailInput.value, passwordInput.value);

            if (user.role === 'administrator') return page('/admin/events');
            
            if (ctx.querystring) {
                var params = new URLSearchParams(ctx.querystring);
                return page(params.get("redirect"));
            }
            
            page('/');
        } catch (error) {
            const errorAlert = 
                `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    ${error.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;

            const previousAlert = document.querySelector('.alert');
            if (previousAlert) previousAlert.remove();

            document.querySelector('.login-container').insertAdjacentHTML('afterbegin', errorAlert);
        }
    });
}

authController.register = async function (ctx) {
    const navbar = document.getElementById('navbar');
    const main = document.getElementById('main');
    const footer = document.getElementById('footer');
    
    navbar.innerHTML = renderAuthNavbar();
    main.innerHTML = renderRegister();
    footer.innerHTML = '';

    const form = document.getElementById('registration-form');
    const roleInput = document.getElementById('role');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    const profilePictureInput = document.getElementById('profile-picture');
    const registerButton = document.getElementById('register-button');

    const isFirstNameValid = () =>  firstNameInput.value.length >= 3 && /^[A-Za-z ]+$/.test(firstNameInput.value);

    const isLastNameValid = () => lastNameInput.value.length >= 3 && /^[A-Za-z ]+$/.test(lastNameInput.value);

    const isEmailValid = () => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(emailInput.value);

    const isPasswordValid = () => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(passwordInput.value);

    const isPasswordConfirmed = () => passwordInput.value === confirmInput.value && isPasswordValid();

    const validateForm = () => {
        if (isFirstNameValid() && isLastNameValid() && isEmailValid() && isPasswordValid() && isPasswordConfirmed())
            registerButton.removeAttribute('disabled');
        else registerButton.setAttribute('disabled', 'disabled');
    }

    function confirmPsw () {
        if (isPasswordConfirmed()) {
            confirmInput.classList.remove('is-invalid');
            confirmInput.classList.add('is-valid');
            document.getElementById('confirm-password-error').textContent = '';
        } else {
            confirmInput.classList.remove('is-valid');
            confirmInput.classList.add('is-invalid');
            document.getElementById('confirm-password-error').textContent = isPasswordValid() ? 'Passwords do not match' : 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';
        }
    }

    firstNameInput.addEventListener('input', function () {
        if (isFirstNameValid()) {
            firstNameInput.classList.remove('is-invalid');
            firstNameInput.classList.add('is-valid');
            document.getElementById('first-name-error').textContent = '';
        } else {
            firstNameInput.classList.remove('is-valid');
            firstNameInput.classList.add('is-invalid');
            document.getElementById('first-name-error').textContent = 'First name must be at least 3 characters long and contain only letters';
        }
    });
    firstNameInput.addEventListener('input', validateForm);


    lastNameInput.addEventListener('input', function () {
        if (isLastNameValid()) {
            lastNameInput.classList.remove('is-invalid');
            lastNameInput.classList.add('is-valid');
            document.getElementById('last-name-error').textContent = '';
        } else {
            lastNameInput.classList.add('is-invalid');
            lastNameInput.classList.remove('is-valid');
            document.getElementById('last-name-error').textContent = 'Last name must be at least 3 characters long and contain only letters';
        }
    });
    lastNameInput.addEventListener('input', validateForm);

    emailInput.addEventListener('input', function () {
        if (isEmailValid()) {
            emailInput.classList.remove('is-invalid');
            emailInput.classList.add('is-valid');
            document.getElementById('email-error').textContent = '';
        } else {
            emailInput.classList.remove('is-valid');
            emailInput.classList.add('is-invalid');
            document.getElementById('email-error').textContent = 'Email is not valid';
        }
    });
    emailInput.addEventListener('input', validateForm);

    passwordInput.addEventListener('input', function () {
        if (isPasswordValid()) {
            passwordInput.classList.remove('is-invalid');
            passwordInput.classList.add('is-valid');
            document.getElementById('password-error').textContent = '';
            confirmPsw();
        } else {
            passwordInput.classList.remove('is-valid');
            passwordInput.classList.add('is-invalid');
            document.getElementById('password-error').textContent = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';
        }
    });
    passwordInput.addEventListener('input', validateForm);

    confirmInput.addEventListener('input', confirmPsw);
    confirmInput.addEventListener('input', validateForm);

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append('firstName', firstNameInput.value);
        formData.append('lastName', lastNameInput.value);
        formData.append('email', emailInput.value);
        formData.append('password', passwordInput.value);
        formData.append('role', roleInput.options[roleInput.selectedIndex].value);
        if (profilePictureInput.files.length > 0) 
            formData.append('profilePicture', profilePictureInput.files[0]);
        
        try {
            await authApi.register(formData);
            page.redirect('/auth/login');
        } catch (error) {
            const errorAlert = 
                `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    ${error.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;

            const previousAlert = document.querySelector('.alert');
            if (previousAlert) previousAlert.remove();
            
            document.querySelector('.registration-container').insertAdjacentHTML('afterbegin', errorAlert);
        }
    });
}

authController.logout = async function (ctx) {
    try {
        await authApi.logout();
        const params = new URLSearchParams(ctx.querystring);
        page(params.get('redirect') || '/');
    } catch (error) {
        console.error(error);
    }
}

export default authController;