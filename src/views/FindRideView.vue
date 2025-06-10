<script setup>
import { ref, onMounted, computed } from 'vue';
import { toast } from "vue3-toastify";
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'vue3-toastify/dist/index.css';
import '@/assets/toast-styles.css';
import config from "@/config";
import { useRouter } from 'vue-router';

import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import pickupIconImg from '/assets/img/user-side/marker-pick.png';
import dropoffIconImg from '/assets/img/user-side/marker-drop.png';

const apiKey = '9d27823c14f4462cb49d23f11f9ca0fe';
const orsApiKey = '5b3ce3597851110001cf6248aa82c8b7a5e04858b8df6b89702eae2d'; //https://openrouteservice.org/dev/#/api-docs
const map = ref(null);
const selectedDate = ref('');
const allowedProvinces = ['Central Province', 'Western Province'];
const distance = ref(0);
const router = useRouter();
const rideTime = ref('');
const rideNote = ref('');

const pickupLocation = ref({province: 'Central Province',district: 'Kandy',city: 'Kandy',lat: 7.2906,lng: 80.6336});
const dropoffLocation = ref({province: 'Central Province',district: 'Kandy',city: 'Kandy',lat: 7.2936,lng: 80.6417});


const pickupSearchQuery = ref('');
const dropoffSearchQuery = ref('');
const pickupSuggestions = ref([]);
const dropoffSuggestions = ref([]);

    // const distance = computed(() => {
    //     if (pickupLocation.value.lat && dropoffLocation.value.lat) {
    //         const from = L.latLng(pickupLocation.value.lat, pickupLocation.value.lng);
    //         const to = L.latLng(dropoffLocation.value.lat, dropoffLocation.value.lng);
    //         return from.distanceTo(to) / 1000; 
    //     }
    //     return 0;
    // });

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
                    pickupSearchQuery.value = data.results[0].formatted; // 
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
        })
            .addTo(map.value)
            .bindPopup('Pick-up Location')
            .on('dragend', (event) => handleMarkerDrag(event, 'pickup'));

        dropoffMarker = L.marker([dropoffLocation.value.lat, dropoffLocation.value.lng], {
            draggable: true,
            icon: dropoffIcon
        })
            .addTo(map.value)
            .bindPopup('Drop-off Location')
            .on('dragend', (event) => handleMarkerDrag(event, 'dropoff'));

        updateRoute();
    };


    const searchLocation = async (query, type) => {
        if (query.length < 2) return;

        try {
            const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&countrycode=lk`);
            const data = await response.json();

            if (data.results.length > 0) {
                const filteredResults = data.results.filter(result => 
                    allowedProvinces.includes(result.components.state)
                );

                if (type === 'pickup') {
                    pickupSuggestions.value = filteredResults.map(result => ({
                        label: result.formatted,
                        lat: result.geometry.lat,
                        lng: result.geometry.lng
                    }));
                } else {
                    dropoffSuggestions.value = filteredResults.map(result => ({
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

        updateRoute();
    };

    onMounted(() => {
        initMap();
    });


    let routeLine = null;

    const updateRoute = async () => {
        if (routeLine) {
            map.value.removeLayer(routeLine);
        }

        try {
            const response = await fetch(
                `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsApiKey}&start=${pickupLocation.value.lng},${pickupLocation.value.lat}&end=${dropoffLocation.value.lng},${dropoffLocation.value.lat}`
            );

            if (!response.ok) throw new Error('Failed to fetch route');

            const data = await response.json();
            const coordinates = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);

            distance.value = data.features[0].properties.segments[0].distance / 1000;

            routeLine = L.polyline(coordinates, {
                color: '#007bff', 
                weight: 4,
                opacity: 0.8,
                dashArray: null 
            }).addTo(map.value);

            map.value.fitBounds(routeLine.getBounds());
        } catch (error) {
            console.error('Error fetching route:', error);
        }
    };

    const handleMarkerDrag = async (event, type) => {
            const newCoords = event.target.getLatLng();

            if (type === 'pickup') {
                pickupLocation.value.lat = newCoords.lat;
                pickupLocation.value.lng = newCoords.lng;
                await getLocationDetails(newCoords.lat, newCoords.lng, 'pickup');
            } else if (type === 'dropoff') {
                dropoffLocation.value.lat = newCoords.lat;
                dropoffLocation.value.lng = newCoords.lng;
                await getLocationDetails(newCoords.lat, newCoords.lng, 'dropoff');
            }

            updateRoute(); 
        };

        const clearPickupSearch = () => {
            pickupSearchQuery.value = '';
            pickupSuggestions.value = [];
        };

        const clearDropoffSearch = () => {
            dropoffSearchQuery.value = '';
            dropoffSuggestions.value = [];
        };

        const handleSubmit = async () => {
            const today = new Date();
            const selected = new Date(selectedDate.value);

            if (!selectedDate.value) {
                toast.error('Please select a date.', { position: 'top-right', autoClose: 3000 });
                return;
            }

            if (selected <= today) {
                toast.error('Please select a future date.', { position: 'top-right', autoClose: 3000 });
                return;
            }

            if (!pickupLocation.value.lat || !pickupLocation.value.lng || !pickupSearchQuery.value) {
                toast.error('Please select a valid pick-up location.', { position: 'top-right', autoClose: 3000 });
                return;
            }

            if (!dropoffLocation.value.lat || !dropoffLocation.value.lng || !dropoffSearchQuery.value) {
                toast.error('Please select a valid drop-off location.', { position: 'top-right', autoClose: 3000 });
                return;
            }

            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user?.id;

            if (!userId) {
                toast.error('User not authenticated. Please log in again.', { position: 'top-right', autoClose: 3000 });
                return;
            }

            const requestData = {
                userId, 
                date: selectedDate.value,
                time: rideTime.value,
                message: rideNote.value,
                pickup: {
                    lat: pickupLocation.value.lat,
                    lng: pickupLocation.value.lng,
                    place: pickupSearchQuery.value,
                    province: pickupLocation.value.province,
                    district: pickupLocation.value.district,
                    city: pickupLocation.value.city,
                },
                dropoff: {
                    lat: dropoffLocation.value.lat,
                    lng: dropoffLocation.value.lng,
                    place: dropoffSearchQuery.value,
                    province: dropoffLocation.value.province,
                    district: dropoffLocation.value.district,
                    city: dropoffLocation.value.city,
                },
                distance: distance.value.toFixed(2),
            };
            

            try {
                const token = localStorage.getItem("authToken");

                const response = await axios.post(`${config.API_BASE_URL}/ride/submit`, requestData, {
                    headers: {
                        'Authorization': `Bearer ${token}`, 
                        'Content-Type': 'application/json',
                    }
                });

                if (response.status === 200 || response.status === 201) {
                    toast.success('Ride request submitted successfully!', {
                        position: 'top-right',
                        autoClose: 3000
                    });

                    setTimeout(() => {
                        router.push('/my-rides');
                    }, 1000);
                }

            } catch (error) {
                console.error('Error submitting ride request:', error);
                toast.error(error.response?.data?.message || 'Failed to submit ride request.', {
                    position: 'top-right',
                    autoClose: 3000
                });
            }
        };




</script>

<template>
<div class="container">

    <div style="width: 100%;">
        <button @click="router.push('/ride-offers')" class="create-ride-button">
            📋 Rides Offers
        </button>
    </div>

    <hr>

    <span>Create a Ride request</span>
        <div class="form-row">
            <div class="date-selector">
                <label class="input-label date-select">Select Date:</label>
                <input type="date" v-model="selectedDate" class="date-input" />
            </div>

            <div class="input-group">
                <label class="input-label">Time:</label>
                <input type="time" v-model="rideTime" class="date-input" />
            </div>

            <div class="input-group location-input">
                <label class="input-label">Pick-up Location:</label>
                <input 
                    v-model="pickupSearchQuery" 
                    @input="searchLocation(pickupSearchQuery, 'pickup')" 
                    placeholder="Search Pickup Location" 
                />
                <span v-if="pickupSearchQuery" class="clear-button" @click="clearPickupSearch">❌</span>
                <ul v-if="pickupSuggestions.length" class="location-search">
                    <li 
                        v-for="suggestion in pickupSuggestions" 
                        :key="suggestion.label" 
                        @click="selectLocation(suggestion.lat, suggestion.lng, 'pickup')"
                    >
                        {{ suggestion.label }}
                    </li>
                </ul>
            </div>

            <div class="input-group location-input">
                <label class="input-label">Drop-off Location:</label>
                <input 
                    v-model="dropoffSearchQuery" 
                    @input="searchLocation(dropoffSearchQuery, 'dropoff')" 
                    placeholder="Search Drop-off Location" 
                />
                <span v-if="dropoffSearchQuery" class="clear-button" @click="clearDropoffSearch">❌</span>
                <ul v-if="dropoffSuggestions.length" class="location-search">
                    <li 
                        v-for="suggestion in dropoffSuggestions" 
                        :key="suggestion.label" 
                        @click="selectLocation(suggestion.lat, suggestion.lng, 'dropoff')"
                    >
                        {{ suggestion.label }}
                    </li>
                </ul>
            </div>

    </div>

    <div id="map" class="map-container"></div>

    <div v-if="distance > 0" class="distance-info">
        <strong>Estimated Distance:</strong> {{ distance.toFixed(2) }} km
    </div>

    <div class="input-group">
        <textarea 
            v-model="rideNote" 
            rows="3" 
            placeholder="Note (optional)" 
            class="date-input"
        ></textarea>
    </div>

    <button @click="handleSubmit" class="submit-btn mt-2">Search Ride</button>
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

.date-select{
    margin-left: -80%;
}

/* ----- */
.input-group {
    position: relative;
    width: 100%;
    max-width: 400px;
}

.input-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #494949;
    margin-bottom: 5px;
}

.input-group input {
    width: 100%;
    padding: 12px 40px 12px 40px;
    border: 1px solid #ccc;
    font-size: 14px;
    outline: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    background-color: #fafafa;
    color: #333;
}

.input-group input::placeholder {
    color: #999;
    font-style: italic;
}

.input-group input:focus {
    border-color: #494949;
    box-shadow: 0 0 8px rgba(73, 73, 73, 0.2);
    background-color: #ffffff;
}

.location-search {
    position: absolute;
    left: 0;
    z-index: 10;
    width: 100%;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    margin-top: 5px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-height: 200px;
    overflow-y: auto;
    padding: 5px 0;
}

.location-search li {
    padding: 12px 15px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.location-search li:hover {
    background-color: #f5f5f5;
}

.location-search li:active {
    background-color: #e0e0e0;
}

/* Add a subtle highlight for active suggestion */
.location-search li.active {
    background-color: #f0f0f0;
    font-weight: 500;
}

/* Smooth scroll for better UX */
.location-search::-webkit-scrollbar {
    width: 5px;
}

.location-search::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 5px;
}

.location-search::-webkit-scrollbar-track {
    background-color: #f9f9f9;
}

/* Icon for the input field */
.location-input::before {
    content: '📍';
    position: absolute;
    left: 12px;
    top: 40px;
    font-size: 16px;
    color: #999;
    pointer-events: none;
    transition: color 0.3s ease;
}

.input-group input:focus + .input-group::before {
    color: #494949;
}


.clear-button {
    position: absolute;
    right: 15px;
    top: 70%;
    transform: translateY(-50%);
    font-size: 10px;
    color: #aaa;
    cursor: pointer;
    transition: color 0.2s ease;
}

.clear-button:hover {
    color: #000;
}

.distance-info {
    margin-top: 10px;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 500;
    color: #333;
    padding: 10px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 6px;
    text-align: center;
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

.ride-header-button {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.create-ride-button {
  background-color: #e2e3f3;
  color: #012970;
  font-weight: bold;
  padding: 12px;
  font-size: 15px;
  border-radius: 12px;
  border: none;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%; /* 👈 This makes it full width */
  max-width: 100%; /* 👈 Prevents shrinkage */
  margin: 10px 0; /* Optional spacing */
}

.create-ride-button:hover {
  background-color: #d0d1e8;
}
</style>