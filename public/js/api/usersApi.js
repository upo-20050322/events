'use strict';

const usersApi = {};

usersApi.getUser = async function () {
    const response = await fetch('/api/users/');
    const responseJson = await response.json();

    if (response.ok) return responseJson;
    else throw new Error(responseJson.error);
}

usersApi.getOrganizer = async function (organizerId) {
    const response = await fetch(`/api/users/organizer/${organizerId}`);
    const responseJson = await response.json();

    if (response.ok) return responseJson;
    else throw new Error(responseJson.error);
}

usersApi.updateFirstName = async function (firstName) {
    const response = await fetch('/api/users/first-name', { 
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ firstName })
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

usersApi.updateLastName = async function (lastName) {
    const response = await fetch('/api/users/last-name', { 
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ lastName })
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

usersApi.updateEmail = async function (email) {
    const response = await fetch('/api/users/email', { 
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

usersApi.updatePassword = async function (oldPassword, newPassword) {
    const response = await fetch('/api/users/password', { 
        method: 'PUT',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ oldPassword, newPassword })
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

usersApi.updateProfilePicture = async function (form) {
    const response = await fetch('/api/users/profile-picture', { 
        method: 'PUT',
        body: form
    });

    if (!response.ok) throw new Error((await response.json()).error);
}

usersApi.deleteProfilePicture = async function () {
    const response = await fetch('/api/users/profile-picture', { method: 'DELETE' });

    if (!response.ok) throw new Error((await response.json()).error);
}

usersApi.deleteUser = async function () {
    const response = await fetch('/api/users', { method: 'DELETE' });

    if (!response.ok) throw new Error((await response.json()).error);

    localStorage.clear();
}

export default usersApi;