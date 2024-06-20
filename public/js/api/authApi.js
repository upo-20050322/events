'use strict';

const authApi = {};

authApi.login = async function (email, password) {
    const response = await fetch('/api/auth/login', { 
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });
    const responseJson = await response.json();

    if (response.ok) return responseJson;
    else throw new Error(responseJson.error);
}

authApi.logout = async function () {
    const response = await fetch('/api/auth/logout', { method: 'POST' });

    if (!response.ok) throw new Error((await response.json()).error);
}

authApi.register = async function (form) {
    const response = await fetch('/api/auth/register', { 
        method: 'POST',
        body: form
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

authApi.checkAuthentication = async function () {
    const response = await fetch('/api/auth/check-auth');
    const responseJson = await response.json();

    if (response.ok) return responseJson;
    else throw new Error(responseJson.error);
}

export default authApi;