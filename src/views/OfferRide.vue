<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import L from 'leaflet';
import axios from 'axios';
import { toast } from "vue3-toastify";
import 'leaflet/dist/leaflet.css';
import config from '@/config';

const apiKey = '9d27823c14f4462cb49d23f11f9ca0fe';
const orsApiKey = '5b3ce3597851110001cf6248aa82c8b7a5e04858b8df6b89702eae2d';
const showOfferModal = ref(false);
const selectedRequestId = ref(null);
const offerPrice = ref('');
const myRides = ref([]);
const selectedRideId = ref(null);

const showCreateRideModal = ref(false);
let mapInstance = null;
const vehicles = ref([]);
const rideForm = ref({
  date: '',
  time: '',  
  message: '', 
  start: { lat: null, lng: null, place: '' },
  end: { lat: null, lng: null, place: '' },
  startSearch: '',
  endSearch: '',
  seats: 1,
  vehicleId: ''
});


const rideRequests = ref([]);
const startQuery = ref('');
const endQuery = ref('');
const startSuggestions = ref([]);
const endSuggestions = ref([]);
const map = ref(null);
let startMarker, endMarker, routeLine;
const distance = ref(0);
const selectedVehicleMaxSeats = ref(0);

const fetchVehicles = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${config.API_BASE_URL}/vehicles`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    vehicles.value = response.data.vehicleList;
    // console.log(response.data.vehicleList);
    
  } catch (err) {
    console.error('Vehicle fetch error:', err);
  }
};

const initMap = () => {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    rideForm.value.start.lat = latitude;
    rideForm.value.start.lng = longitude;

    const offsetLat = latitude + 0.03;
    const offsetLng = longitude + 0.03;
    rideForm.value.end.lat = offsetLat;
    rideForm.value.end.lng = offsetLng;

    map.value = L.map('ride-map').setView([latitude, longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map.value);

    startMarker = L.marker([latitude, longitude], { draggable: true }).addTo(map.value).bindPopup('Start');
    endMarker = L.marker([offsetLat, offsetLng], { draggable: true }).addTo(map.value).bindPopup('End');

    startMarker.on('dragend', e => updateCoords(e.target.getLatLng(), 'start'));
    endMarker.on('dragend', e => updateCoords(e.target.getLatLng(), 'end'));

    await updateLocationName(latitude, longitude, 'start');
    await updateLocationName(offsetLat, offsetLng, 'end');

    updateRoute();
  });
};

const updateCoords = async ({ lat, lng }, type) => {
  rideForm.value[type].lat = lat;
  rideForm.value[type].lng = lng;
  await updateLocationName(lat, lng, type);
  updateRoute();
};

const updateLocationName = async (lat, lng, type) => {
  const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&countrycode=lk`);
  const data = await response.json();
  const label = data.results[0]?.formatted || `${lat}, ${lng}`;
rideForm.value[type].place = label;
rideForm.value[type + 'Search'] = label;
};

const searchLocation = async (type) => {
  const query = rideForm.value[type + 'Search'];
  if (query.length < 2) return;

  const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&countrycode=lk`);
  const data = await res.json();
  const suggestions = data.results.map(r => ({
    label: r.formatted,
    lat: r.geometry.lat,
    lng: r.geometry.lng
  }));
  if (type === 'start') startSuggestions.value = suggestions;
  else endSuggestions.value = suggestions;
};

const selectSuggestion = async (s, type) => {
  rideForm.value[type].lat = s.lat;
  rideForm.value[type].lng = s.lng;
  rideForm.value[type].place = s.label;
  if (type === 'start') {
    startMarker.setLatLng([s.lat, s.lng]);
    startSuggestions.value = [];
  } else {
    endMarker.setLatLng([s.lat, s.lng]);
    endSuggestions.value = [];
  }
  updateRoute();
};

const updateRoute = async () => {
  if (routeLine) map.value.removeLayer(routeLine);
  const { start, end } = rideForm.value;
  const res = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsApiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`);
  const data = await res.json();
  const coords = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  distance.value = data.features[0].properties.segments[0].distance / 1000;
  routeLine = L.polyline(coords, { color: '#007bff', weight: 4 }).addTo(map.value);
  map.value.fitBounds(routeLine.getBounds());
};

watch(showCreateRideModal, async (val) => {
  if (val) {
    await nextTick();
    setTimeout(() => {
        const mapEl = document.getElementById("ride-map");
      if (mapEl) {
        initMap(); 
        fetchVehicles();
      } else {
        console.warn("Map container not found");
      }
    }, 100);
  }
});


const submitRide = async () => {
  const today = new Date();
  const selectedDate = new Date(rideForm.value.date);

  // --- Basic required fields ---
  if (!rideForm.value.date) {
    toast.error("Please select a date.");
    return;
  }

  if (selectedDate < today.setHours(0, 0, 0, 0)) {
    toast.error("Date cannot be in the past.");
    return;
  }

  if (!rideForm.value.time) {
    toast.error("Please select a time.");
    return;
  }

  if (!rideForm.value.vehicleId) {
    toast.error("Please select a vehicle.");
    return;
  }

  if (
    rideForm.value.seats < 1 ||
    rideForm.value.seats > selectedVehicleMaxSeats.value
  ) {
    toast.error(`Seats can not be more than ${selectedVehicleMaxSeats.value}`);
    return;
  }

  if (
    !rideForm.value.start.lat ||
    !rideForm.value.start.lng ||
    !rideForm.value.end.lat ||
    !rideForm.value.end.lng
  ) {
    toast.error("Please select both start and end locations.");
    return;
  }

  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));

  const payload = {
    user_id: user.id,
    vehicle_id: rideForm.value.vehicleId,
    date: rideForm.value.date,
    time: rideForm.value.time,
    message: rideForm.value.message || null,
    seats: rideForm.value.seats,
    start_lat: rideForm.value.start.lat,
    start_lng: rideForm.value.start.lng,
    start_place: rideForm.value.start.place,
    end_lat: rideForm.value.end.lat,
    end_lng: rideForm.value.end.lng,
    end_place: rideForm.value.end.place
  };

  try {
    await axios.post(`${config.API_BASE_URL}/rides`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success("Ride created!");
    showCreateRideModal.value = false;

    rideForm.value = {
      date: '',
      time: '',
      message: '',
      start: { lat: null, lng: null, place: '' },
      end: { lat: null, lng: null, place: '' },
      startSearch: '',
      endSearch: '',
      seats: 1,
      vehicleId: ''
    };

    selectedVehicleMaxSeats.value = 0;

    if (map.value && map.value.remove) {
      map.value.remove();
      map.value = null;
    }

  } catch (err) {
    toast.error(
      err.response?.data?.message || "Server rejected the request."
    );
  }
};

const handleVehicleSelect = () => {
  const selected = vehicles.value.find(v => v.id === rideForm.value.vehicleId);
  selectedVehicleMaxSeats.value = selected?.max_seats || 0;
};

const openOfferModal = async (requestId) => {
  selectedRequestId.value = requestId;
  offerPrice.value = '';
  selectedRideId.value = null;
  showOfferModal.value = true;

  try {
    const token = localStorage.getItem("authToken");
  const res = await axios.get(`${config.API_BASE_URL}/rides/my-available`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { request_id: selectedRequestId.value }
  });

    myRides.value = res.data || [];

  } catch (err) {
    // toast.error("Failed to fetch your rides.");
    myRides.value = [];
  }
};

const fetchRideRequests = async () => {
  try {
    console.log("fetchRideRequests is running");
    const token = localStorage.getItem("authToken");
    const res = await axios.get(`${config.API_BASE_URL}/rides/requests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    rideRequests.value = res.data.upcomingRides;
  } catch (err) {
    // toast.error("Could not load ride requests.");
  }
};

const submitOffer = async () => {
  if (!offerPrice.value || isNaN(offerPrice.value) || offerPrice.value <= 0) {
    toast.error("Please enter a valid price");
    return;
  }

  try {
    const token = localStorage.getItem("authToken");
    if (!selectedRideId.value) {
      toast.error("Please select your ride");
      return;
    }

    await axios.post(`${config.API_BASE_URL}/ride/make-offer`, {
      request_id: selectedRequestId.value,
      ride_id: selectedRideId.value,
      price: offerPrice.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("Offer submitted successfully");
    showOfferModal.value = false;
  } catch (err) {
    toast.error(err.response?.data?.message || "Offer failed");
  }
};


onMounted(() => {
  fetchRideRequests();
});


</script>

<template>
    <!-- Create Ride Trigger Card -->
    <div class="create-ride-card" @click="showCreateRideModal = true">
      <img src="/assets/img/user-side/createRide.png" alt="Create Ride" class="card-icon" />
      <span class="card-label">Create Ride</span>
    </div>

    <hr>

    <span class="title">Ride requests</span>
  
    <!-- Modal -->
    <div v-if="showCreateRideModal" class="modal-backdrop">
      <div class="modal-container">
        <h3 class="modal-title">Create a Ride</h3>
  
        <label class="modal-label">Select Date:</label>
        <input type="date" v-model="rideForm.date" class="modal-input" />
  
        <label class="modal-label">Start Location:</label>
        <div class="input-wrapper">
            <input type="text" v-model="rideForm.startSearch" @input="searchLocation('start')" placeholder="Search Start Location" class="modal-input" />
            <ul v-if="startSuggestions.length" class="location-search">
                <li v-for="suggestion in startSuggestions" :key="suggestion.label" @click="selectSuggestion(suggestion, 'start')">
                    {{ suggestion.label }}
                </li>
            </ul>
        </div>
  
        <label class="modal-label">End Location:</label>
        <div class="input-wrapper">
            <input type="text" v-model="rideForm.endSearch" @input="searchLocation('end')" placeholder="Search End Location" class="modal-input" />
            <ul v-if="endSuggestions.length" class="location-search">
                <li v-for="suggestion in endSuggestions" :key="suggestion.label" @click="selectSuggestion(suggestion, 'end')">
                    {{ suggestion.label }}
                </li>
            </ul>
        </div>
  
        <div id="ride-map" class="map-container"></div>
  
        <div v-if="distance > 0" class="distance-info">
          <strong>Estimated Distance:</strong> {{ distance.toFixed(2) }} km
        </div>
  
        <label class="modal-label">Seats</label>
        <input type="number" v-model="rideForm.seats" min="1" class="modal-input" />
  
        <label class="modal-label">Vehicle</label>
        <select v-model="rideForm.vehicleId" class="modal-input" @change="handleVehicleSelect">
            <option disabled value="">Select a vehicle</option>
            <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                {{ vehicle.plate_number }} - {{ vehicle.brand }} ({{ vehicle.model }})
            </option>
        </select>

        <label class="modal-label">Start Time:</label>
        <input type="time" v-model="rideForm.time" class="modal-input" />

        <label class="modal-label">Message (optional):</label>
        <textarea v-model="rideForm.message" class="modal-input" rows="2" placeholder="Any notes for the ride..."></textarea>

  
        <div class="modal-actions">
          <button class="btn cancel" @click="showCreateRideModal = false">Cancel</button>
          <button class="btn submit" @click="submitRide">Submit</button>
        </div>
      </div>
    </div>

    <div class="ride-request-list">

    <div v-if="rideRequests.length === 0" class="empty-text">
        No ride requests found.
    </div>

    <div v-else>
        <div v-for="request in rideRequests" :key="request.id" class="ride-request-card">
            <p><strong>Date:</strong> {{ request.date }}</p>
            <p><strong>From:</strong> {{ request.pickup_place }}</p>
            <p><strong>To:</strong> {{ request.drop_place }}</p>
            <p><strong>Distance:</strong> {{ parseFloat(request.distance).toFixed(2) }} km</p>
            <p><strong>Seats Requested:</strong> {{ request.seats }}</p>
            <button class="make-offer-btn" @click="openOfferModal(request.id)">
              Make Offer
            </button>
        </div>
    </div>
    </div>

    <div v-if="showOfferModal" class="modal-backdrop">
      <div class="modal-container">
        <h3 class="modal-title">Make an Offer</h3>

        <label class="modal-label">Select Your Ride:</label>
        <select v-model="selectedRideId" class="modal-input">
          <option disabled value="">-- Select Ride --</option>
          <option v-for="ride in myRides" :key="ride.id" :value="ride.id">
            {{ ride.start_place }} → {{ ride.end_place }} ({{ ride.date }})
          </option>
        </select>

        <label class="modal-label">Offer Price (LKR):</label>
        <input type="number" v-model="offerPrice" placeholder="Enter your offer" class="modal-input" />

        <div class="modal-actions">
          <button class="btn cancel" @click="showOfferModal = false">Cancel</button>
          <button class="btn submit" @click="submitOffer">Submit</button>
        </div>
      </div>
    </div>


  </template>
  
  <style scoped>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
  }
  
  .modal-container {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    width: 95%;
    max-width: 400px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  .modal-title {
    font-size: 20px;
    font-weight: 600;
    color: #012970;
    margin-bottom: 15px;
    text-align: center;
  }
  
  .modal-label {
    font-size: 14px;
    margin: 8px 0 4px;
    color: #333;
  }
  
  .modal-input {
    width: 100%;
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    margin-bottom: 10px;
    font-size: 14px;
  }
  
  .map-container {
    height: 250px;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin: 10px 0;
  }
  
  .location-search {
    list-style: none;
    padding: 0;
    margin: 5px 0;
    border: 1px solid #ddd;
    max-height: 150px;
    overflow-y: auto;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    z-index: 10;
  }
  
  .location-search li {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .location-search li:hover {
    background-color: #f1f1f1;
  }
  
  .distance-info {
    text-align: center;
    background: #f9f9f9;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 10px;
  }
  
  .modal-actions {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }
  
  .btn {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
  }
  
  .btn.cancel {
    background-color: #ccc;
    color: #000;
  }
  
  .btn.submit {
    background-color: #012970;
    color: #fff;
  }
  
  .create-ride-card {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background-color: #d0d0db;
    color: #190562;
    padding: 12px;
    margin: 80px auto 30px auto;
    border-radius: 10px;
    border-color: #012970;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 4px 10px rgba(2, 10, 108, 0.1);
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .create-ride-card:hover {
    transform: translateY(-2px);
  }
  
  .card-icon {
    width: 28px;
    height: 28px;
  }
  
  .card-label {
    font-size: 16px;
    font-weight: 500;
  }

  .input-wrapper {
  position: relative;
}

.location-search {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 9999;
}

.location-search {
  max-height: 160px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-container {
  overflow-y: auto;
  max-height: 90vh;
}

.ride-request-list {
  margin-top: 30px;
  padding: 0 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #012970;
}

.ride-request-card {
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fdfdfd;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.empty-text {
  color: #888;
  font-size: 14px;
  text-align: center;
}

span {
    font-size: 14px;
    color: #555;
}

.title{
    display: flex;
    align-items: center;
    justify-content: center;
}

/* ------- */

.make-offer-btn {
  background-color: #012970;
  color: white;
  padding: 6px 12px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  margin-top: 10px;
  width: 100%;
  cursor: pointer;
}

.make-offer-btn:hover {
  background-color: #041c58;
}

</style>
  
  
  
