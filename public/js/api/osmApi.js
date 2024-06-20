'use strict';

const osmApi = {};

osmApi.getAddress = async function (latitude, longitude) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
    const data = await response.json();

    if (!response.ok) throw new Error(`Couldn't reach OpenStreetMap`);
    if (data.error) throw new Error(`Address not found`);
    else return data;
}

osmApi.getLatitudeLongitude = async function (address) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`)

    if (!response.ok) throw new Error(`Couldn't reach OpenStreetMap`);
    
    const data = await response.json();
    if (data.length === 0) throw new Error(`Address not found`);

    return {
        latitude: data[0].lat,
        longitude: data[0].lon
    }
}

osmApi.searchAddress = async function (address) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`)
    const data = await response.json();

    if (!response.ok) throw new Error(`Couldn't reach OpenStreetMap`);
    else return data;
}

export default osmApi;