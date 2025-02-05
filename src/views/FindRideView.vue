<script setup>
import { ref, onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import pickupIconImg from '/assets/img/user-side/marker-pick.png';
import dropoffIconImg from '/assets/img/user-side/marker-drop.png';

const apiKey = '9d27823c14f4462cb49d23f11f9ca0fe';
const map = ref(null);
const selectedDate = ref('');

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
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [0, -40],
        shadowSize: [50, 50]
    });

    const dropoffIcon = L.icon({
        iconUrl: dropoffIconImg,
        shadowUrl: markerShadow,
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [0, -40],
        shadowSize: [50, 50]
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

const handleSubmit = async () => {
    const requestData = {
        date: selectedDate.value,
        pickup: pickupLocation.value,
        dropoff: dropoffLocation.value
    };

    try {
        const response = await fetch('https://api.example.com/submit-ride', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        console.log('Ride Submitted:', result);
    } catch (error) {
        console.error('Error submitting ride:', error);
    }
};

onMounted(initMap);
</script>

<template>
    <div class="container">
        <h3>Find a Ride</h3>

        <div class="date-selector">
            <label for="date" class="date-label">Select Date:</label>
            <input type="date" id="date" v-model="selectedDate" class="date-input" />
        </div>

        <div id="map" class="map-container"></div>

        <div class="location-info">
            <h2>Pick-up Location:</h2>
            <span>{{ pickupLocation.province }} - {{ pickupLocation.district }} - {{ pickupLocation.city }}</span>

            <h2>Drop-off Location:</h2>
            <span>{{ dropoffLocation.province }} - {{ dropoffLocation.district }} - {{ dropoffLocation.city }}</span>
        </div>

        <button @click="handleSubmit" class="submit-btn">Search Ride</button>
    </div>
</template>

<style scoped>

.container {
    text-align: center;
    padding: 10px;
}

.date-selector {
    margin: 10px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.date-label {
    font-weight: bold;
    font-size: 16px;
}

.date-input {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    outline: none;
    transition: border 0.3s ease;
}

.date-input:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
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
    text-align: left;
}

.submit-btn {
    margin-top: 20px;
    padding: 12px 25px;
    background-color: #012970;
    color: white;
    border: none;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.submit-btn:hover {
    background-color: #0056b3;
}

@media (max-width: 768px) {
    .map-container {
        height: 300px;
    }
    .date-selector {
        flex-direction: column;
        gap: 5px;
        align-items: flex-start;
    }
    .date-input {
        width: 100%;
        box-sizing: border-box;
    }
    .date-label {
        font-size: 14px;
        margin-left: 5px;
    }
}
</style>
