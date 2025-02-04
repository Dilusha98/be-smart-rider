<script setup>
import { ref, onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const pickupIconImg = new URL('@/assets/img/marker-pick.png', import.meta.url).href;
const dropoffIconImg = new URL('@/assets/img/marker-drop.png', import.meta.url).href;

const apiKey = '9d27823c14f4462cb49d23f11f9ca0fe';
const map = ref(null);

// Separate state for pickup and dropoff
const pickupLocation = ref({ province: '', district: '', city: '', lat: 7.8531, lng: 80.7518 });
const dropoffLocation = ref({ province: '', district: '', city: '', lat: 7.8731, lng: 80.7718 });

const getLocationDetails = async (lat, lng, type) => {
    try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`);
        const data = await response.json();

        if (data.results.length > 0) {
            const details = data.results[0].components;
            const location = {
                province: details.state || 'Unknown Province',
                district: details.county || details.state_district || 'Unknown District',
                city: details.village || details.city || details.town || 'Unknown City/Village'
            };

            if (type === 'pickup') {
                pickupLocation.value = { ...pickupLocation.value, ...location };
            } else if (type === 'dropoff') {
                dropoffLocation.value = { ...dropoffLocation.value, ...location };
            }
        }
    } catch (error) {
        console.error('Error fetching location details:', error);
    }
};

const initMap = () => {
    map.value = L.map('map', { zoomControl: false }).setView([pickupLocation.value.lat, pickupLocation.value.lng], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map.value);

    const pickupIcon = L.icon({
        iconUrl: pickupIconImg,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const dropoffIcon = L.icon({
        iconUrl: dropoffIconImg,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const pickupMarker = L.marker([pickupLocation.value.lat, pickupLocation.value.lng], {
        draggable: true,
        icon: pickupIcon
    }).addTo(map.value).bindPopup('Pick-up Location');

    const dropoffMarker = L.marker([dropoffLocation.value.lat, dropoffLocation.value.lng], {
        draggable: true,
        icon: dropoffIcon
    }).addTo(map.value).bindPopup('Drop-off Location');

    pickupMarker.on('dragend', async (event) => {
        const newCoords = event.target.getLatLng();
        pickupLocation.value.lat = newCoords.lat;
        pickupLocation.value.lng = newCoords.lng;
        await getLocationDetails(newCoords.lat, newCoords.lng, 'pickup');
    });

    dropoffMarker.on('dragend', async (event) => {
        const newCoords = event.target.getLatLng();
        dropoffLocation.value.lat = newCoords.lat;
        dropoffLocation.value.lng = newCoords.lng;
        await getLocationDetails(newCoords.lat, newCoords.lng, 'dropoff');
    });
};

onMounted(initMap);
</script>

<template>
    <div class="container">
        <h1>Find a Ride</h1>

        <div id="map" class="map-container"></div>

        <div class="location-info">
            <h2>Pick-up Location:</h2>
            <span>{{ pickupLocation.province }} - {{ pickupLocation.district }} - {{ pickupLocation.city }}</span>

            <h2>Drop-off Location:</h2>
            <span>{{ dropoffLocation.province }} - {{ dropoffLocation.district }} - {{ dropoffLocation.city }}</span>
        </div>
    </div>
</template>

<style scoped>
.container {
    text-align: center;
    padding: 10px;
}

.map-container {
    width: 100%;
    height: 400px;
    border-radius: 10px;
    margin-top: 10px;
}

.location-info {
    background: #f8f9fa;
    padding: 10px;
    border-radius: 8px;
    margin-top: 10px;
    font-size: 16px;
}

@media (max-width: 768px) {
    .map-container {
        height: 300px;
    }
}
</style>
