<script setup>
import { ref, onMounted, computed } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import pickupIconImg from '/assets/img/user-side/marker-pick.png';
import dropoffIconImg from '/assets/img/user-side/marker-drop.png';

const apiKey = '9d27823c14f4462cb49d23f11f9ca0fe';
const map = ref(null);
const selectedDate = ref('');

const pickupLocation = ref({ province: '', district: '', city: '', lat: 7.8531, lng: 80.7518 });
const dropoffLocation = ref({ province: '', district: '', city: '', lat: 7.8731, lng: 80.7718 });

const pickupSearchQuery = ref('');
const dropoffSearchQuery = ref('');
const pickupSuggestions = ref([]);
const dropoffSuggestions = ref([]);

const distance = computed(() => {
    if (pickupLocation.value.lat && dropoffLocation.value.lat) {
        const from = L.latLng(pickupLocation.value.lat, pickupLocation.value.lng);
        const to = L.latLng(dropoffLocation.value.lat, dropoffLocation.value.lng);
        return from.distanceTo(to) / 1000; // Convert meters to kilometers
    }
    return 0;
});

let pickupMarker, dropoffMarker;

const getLocationDetails = async (lat, lng, type) => {
    try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&countrycode=lk`);
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
                pickupSearchQuery.value = data.results[0].formatted; 
            } else if (type === 'dropoff') {
                dropoffLocation.value = { ...dropoffLocation.value, ...location };
                dropoffSearchQuery.value = data.results[0].formatted; 
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

    pickupMarker = L.marker([pickupLocation.value.lat, pickupLocation.value.lng], {
        draggable: true,
        icon: pickupIcon
    }).addTo(map.value).bindPopup('Pick-up Location');

    dropoffMarker = L.marker([dropoffLocation.value.lat, dropoffLocation.value.lng], {
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

const searchLocation = async (query, type) => {
    if (query.length < 2) return;

    try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&countrycode=lk`);
        const data = await response.json();

        if (data.results.length > 0) {
            if (type === 'pickup') {
                pickupSuggestions.value = data.results.map(result => ({
                    label: result.formatted,
                    lat: result.geometry.lat,
                    lng: result.geometry.lng
                }));
            } else {
                dropoffSuggestions.value = data.results.map(result => ({
                    label: result.formatted,
                    lat: result.geometry.lat,
                    lng: result.geometry.lng
                }));
            }
        }
    } catch (error) {
        console.error('Error searching location:', error);
    }
};

const selectLocation = async (lat, lng, type) => {
    if (type === 'pickup') {
        pickupLocation.value.lat = lat;
        pickupLocation.value.lng = lng;
        pickupSuggestions.value = [];
        pickupMarker.setLatLng([lat, lng]);
    } else {
        dropoffLocation.value.lat = lat;
        dropoffLocation.value.lng = lng;
        dropoffSuggestions.value = [];
        dropoffMarker.setLatLng([lat, lng]);
    }
    await getLocationDetails(lat, lng, type);
};

onMounted(() => {
    initMap();
});
</script>

<template>
<div class="container">
    <h3>Find a Ride</h3>

    <div class="form-row">
        <div class="date-selector">
            <label class="input-label">Select Date:</label>
            <input type="date" v-model="selectedDate" class="date-input" />
        </div>

        <div class="input-group">
            <label class="input-label">Pick-up Location:</label>
            <input v-model="pickupSearchQuery" @input="searchLocation(pickupSearchQuery, 'pickup')" placeholder="Search Pickup Location" />
            <ul v-if="pickupSuggestions.length" class="location-search">
                <li v-for="suggestion in pickupSuggestions" :key="suggestion.label" @click="selectLocation(suggestion.lat, suggestion.lng, 'pickup')">
                    {{ suggestion.label }}
                </li>
            </ul>
        </div>

        <div class="input-group">
            <label class="input-label">Drop-off Location:</label>
            <input v-model="dropoffSearchQuery" @input="searchLocation(dropoffSearchQuery, 'dropoff')" placeholder="Search Drop-off Location" />
            <ul v-if="dropoffSuggestions.length" class="location-search">
                <li v-for="suggestion in dropoffSuggestions" :key="suggestion.label" @click="selectLocation(suggestion.lat, suggestion.lng, 'dropoff')">
                    {{ suggestion.label }}
                </li>
            </ul>
        </div>
    </div>

    <div id="map" class="map-container"></div>

    <button @click="handleSubmit" class="submit-btn">Search Ride</button>
</div>
</template>



<style scoped>
.container {
    text-align: center;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600px;
    margin: 20px auto;
}

/* Flex row for date and input fields */
.form-row {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
}

.date-selector,
.input-group {
    flex: 1;
}

.date-label,
.input-label {
    font-size: 14px;
    font-weight: 500;
    color: #555;
    margin-bottom: 4px;
    display: block;
}

.date-input,
.input-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
}

.date-input:focus,
.input-group input:focus {
    border-color: #007bff;
    box-shadow: 0 0 6px rgba(0, 123, 255, 0.2);
}

/* Styling for dropdown suggestions */
.input-group ul {
    position: absolute;
    background-color: #fff;
    border: 1px solid #ddd;
    border-top: none;
    list-style: none;
    padding: 0;
    margin: 0;
    z-index: 10;
    max-height: 150px;
    overflow-y: auto;
    width: 100%;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

.input-group li {
    padding: 12px;
    font-size: 14px;
    cursor: pointer;
    color: #555;
    transition: background-color 0.2s;
}

.input-group li:hover {
    background-color: #f8f9fa;
}

/* Map container */
.map-container {
    width: 100%;
    height: 350px;
    border-radius: 8px;
    margin-bottom: 16px;
    border: 1px solid #ddd;
}

/* Location details */
.location-info {
    background-color: #f9f9f9;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #eee;
    text-align: left;
    margin-bottom: 16px;
}

.location-info h2 {
    font-size: 16px;
    color: #012970;
    margin-bottom: 5px;
    font-weight: 600;
}

.location-info span {
    font-size: 14px;
    color: #555;
}

/* Button Styling */
.submit-btn {
    background-color: #012970;
    color: white;
    border: none;
    padding: 12px;
    width: 100%;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.submit-btn:hover {
    background-color: #0056b3;
}

.location-search{
    margin-top: 80px !important;
    z-index: 999999999 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .form-row {
        flex-direction: column;
        gap: 10px;
    }

    .map-container {
        height: 250px;
    }

    .submit-btn {
        padding: 10px;
        font-size: 14px;
    }
}

</style>