<script setup>
import { ref, onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Manually import the marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const apiKey = '9d27823c14f4462cb49d23f11f9ca0fe'; 
const map = ref(null);
const province = ref('');
const district = ref('');
const city = ref('');
const selectedLatLng = ref({ lat: 7.8731, lng: 80.7718 });

const getLocationDetails = async (lat, lng) => {
    try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`);
        const data = await response.json();

        if (data.results.length > 0) {
            const details = data.results[0].components;
            
            province.value = details.state || 'Unknown Province';
            district.value = details.county || details.state_district || 'Unknown District';
            city.value = details.village || details.city || details.town || 'Unknown City/Village';
        }
    } catch (error) {
        console.error('Error fetching location details:', error);
    }
};


const initMap = () => {
    map.value = L.map('map', { zoomControl: false }).setView([selectedLatLng.value.lat, selectedLatLng.value.lng], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map.value);

    // Define custom icon
    const customIcon = L.icon({
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
        iconSize: [25, 41], 
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const marker = L.marker([selectedLatLng.value.lat, selectedLatLng.value.lng], {
        draggable: true,
        icon: customIcon // Apply custom icon
    }).addTo(map.value);

    marker.on('dragend', async (event) => {
        const newCoords = event.target.getLatLng();
        selectedLatLng.value = { lat: newCoords.lat, lng: newCoords.lng };
        await getLocationDetails(newCoords.lat, newCoords.lng);
    });

    // Get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                selectedLatLng.value = { lat: position.coords.latitude, lng: position.coords.longitude };
                map.value.setView([selectedLatLng.value.lat, selectedLatLng.value.lng], 12);
                marker.setLatLng([selectedLatLng.value.lat, selectedLatLng.value.lng]);
                await getLocationDetails(selectedLatLng.value.lat, selectedLatLng.value.lng);
            },
            (error) => console.warn('Geolocation not allowed or failed', error),
            { enableHighAccuracy: true }
        );
    }
};

onMounted(initMap);
</script>


<template>
    <div class="container">
        <h1>Find a Ride</h1>

        <div id="map" class="map-container"></div>

        <div class="location-info">
            <p><strong>Province:</strong> {{ province }}</p>
            <p><strong>District:</strong> {{ district }}</p>
            <p><strong>City/Village:</strong> {{ city }}</p>
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
