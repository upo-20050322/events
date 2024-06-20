'use strict';

const adminApi = {};

adminApi.getUserById = async function (userId) {
    const response = await fetch(`/api/users/user/${userId}`);
    const responseJson = await response.json();

    if (response.ok) return responseJson;
    else throw new Error(responseJson.error);
}

adminApi.getUsers = async function (filter, offset, limit) {
    const response = await fetch('/api/users/filter', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ filter, offset, limit })
    });
    const responseJson = await response.json();

    if (response.ok) return responseJson;
    else throw new Error(responseJson.error);
}

adminApi.updateFirstName = async function (userId, firstName) {
    const response = await fetch('/api/users/first-name', { 
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, firstName })
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

adminApi.updateLastName = async function (userId, lastName) {
    const response = await fetch('/api/users/last-name', { 
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, lastName })
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

adminApi.updateEmail = async function (userId, email) {
    const response = await fetch('/api/users/email', { 
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, email })
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

adminApi.updatePassword = async function (userId, newPassword) {
    const response = await fetch('/api/users/password', { 
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, newPassword })
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

adminApi.updateProfilePicture = async function (userId, form) {
    form.append('userId', userId);

    const response = await fetch('/api/users/profile-picture', { 
        method: 'PUT',
        body: form
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

adminApi.deleteProfilePicture = async function (userId) {
    const response = await fetch(`/api/users/profile-picture/?userId=${userId}`, { method: 'DELETE' });

    if (!response.ok) throw new Error((await response.json()).error);
}

adminApi.deleteUser = async function (userId) {
    const response = await fetch(`/api/users/?userId=${userId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error((await response.json()).error);
}

adminApi.getRegistrations = async function (filter, offset, limit) {
    const response = await fetch(`/api/events/registrations/admin`, 
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(filter, offset, limit)
        }
    );
    const responseJson = await response.json();

    if (response.ok) return responseJson;
    else throw new Error(responseJson.error);
}

adminApi.getRegistration = async function (registrationId) {
    const response = await fetch(`/api/events/registrations/admin/${registrationId}`);
    const responseJson = await response.json();

    if (response.ok) return responseJson;
    else throw new Error(responseJson.error);
}

adminApi.deleteEventRegistration = async function (registrationId) {
    const response = await fetch(`/api/events/registrations/admin/${registrationId}`, { method: 'DELETE' });

    if (!response.ok) throw new Error((await response.json()).error);
}

adminApi.getLogs = async function () {
    const response = await fetch('/logs');
    const responseJson = await response.json();

    if (response.ok) return responseJson;
    else throw new Error(responseJson.error);
}

export default adminApi;