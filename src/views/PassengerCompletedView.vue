<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { toast } from 'vue3-toastify';
import config from '@/config';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const route = useRoute();
const rideId = route.params.id;
const token = localStorage.getItem("authToken");

const ride = ref(null);
const loading = ref(true);
const map = ref(null);
const selectedRating = ref(0);
const ratingSubmitted = ref(false);
const averageRating = ref(null);

const orsApiKey = '5b3ce3597851110001cf6248aa82c8b7a5e04858b8df6b89702eae2d';

const initMap = async () => {
  if (!ride.value?.start_lat || !ride.value?.start_lng || !ride.value?.end_lat || !ride.value?.end_lng) return;

  const start = [ride.value.start_lat, ride.value.start_lng];
  const end = [ride.value.end_lat, ride.value.end_lng];

  map.value = L.map('rideMap').setView(start, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map.value);

  L.marker(start).addTo(map.value).bindPopup("Start").openPopup();
  L.marker(end).addTo(map.value).bindPopup("End");

  try {
    const res = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        coordinates: [start.slice().reverse(), end.slice().reverse()],
      },
      {
        headers: {
          Authorization: orsApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const route = L.geoJSON(res.data, {
      style: {
        color: '#007bff',
        weight: 4,
      },
    }).addTo(map.value);

    map.value.fitBounds(route.getBounds());
  } catch (err) {
    console.error('Failed to draw route:', err);
  }
};

const fetchRideDetails = async () => {
  try {
    const res = await axios.get(`${config.API_BASE_URL}/ride/passenger/completed/${rideId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    ride.value = res.data.ride;
    averageRating.value = res.data.ride?.driver_rating ?? null;
    ratingSubmitted.value = !!averageRating.value;

    if (ride.value?.status === 1) {
      await nextTick();
      initMap();
    }
  } catch (err) {
    toast.error("Failed to load ride details.");
  } finally {
    loading.value = false;
  }
};

const submitRating = async () => {
  if (selectedRating.value < 1 || selectedRating.value > 5) {
    toast.warning("Please select a rating between 1 and 5.");
    return;
  }

  try {
    await axios.post(`${config.API_BASE_URL}/ride/rate-driver`, {
      ride_id: rideId,
      rating: selectedRating.value,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    averageRating.value = selectedRating.value;
    ratingSubmitted.value = true;
    toast.success("Thank you for rating the driver!");
  } catch (err) {
    toast.error("Failed to submit rating.");
  }
};

onMounted(fetchRideDetails);
</script>

<template>
  <div class="ride-details-wrapper">
    <h2>🚘 Passenger Ride Summary</h2>

    <div v-if="loading" class="loading">Loading ride details...</div>

    <div v-else-if="ride" class="card">
      <div class="ride-summary">
        <p><strong>📅 Date:</strong> {{ ride.date }} {{ ride.time }}</p>
        <p><strong>📍 Pickup:</strong> {{ ride.pickup_place }}</p>
        <p><strong>📍 Drop:</strong> {{ ride.drop_place }}</p>
        <p><strong>📏 Distance:</strong> {{ ride.distance ?? '-' }} km</p>
        <p><strong>👨‍✈️ Driver:</strong> {{ ride.driver || 'N/A' }}</p>
        <p>
          <strong>🚘 Vehicle:</strong>
          <span v-if="ride.vehicle">{{ ride.vehicle.brand }} - {{ ride.vehicle.model }} ({{ ride.vehicle.plate_number }})</span>
          <span v-else>N/A</span>
        </p>
        <p v-if="ride.message" class="warning">❌ {{ ride.message }}</p>
        <p v-else class="success">✅ Ride completed successfully</p>
      </div>

      <div class="rating-block" v-if="ride.status === 1">
        <div v-if="!ratingSubmitted">
          <h4>Rate your driver</h4>
          <div class="stars">
            <span
              v-for="i in 5"
              :key="i"
              class="star"
              :class="{ active: selectedRating >= i }"
              @click="selectedRating = i"
            >★</span>
          </div>
          <button class="submit-rating" @click="submitRating">Submit Rating</button>
        </div>
        <div v-else class="rated-message">
          ⭐ You Have Rated Your Driver <strong>{{ averageRating }}/5</strong>
        </div>
      </div>

      <div class="map-container" v-if="ride.status === 1">
        <div id="rideMap"></div>
      </div>
    </div>

    <div v-else>
      <p>No ride details found.</p>
    </div>
  </div>
</template>

<style scoped>
.ride-details-wrapper {
  max-width: 640px;
  margin: 2rem auto;
  padding: 16px;
}

.card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  padding: 20px;
}

h2 {
  text-align: center;
  color: #012970;
  margin-bottom: 20px;
}

.ride-summary p {
  margin: 8px 0;
  font-size: 15px;
  color: #444;
}

.success {
  color: #28a745;
  font-weight: 600;
}

.warning {
  color: #dc3545;
  font-weight: 600;
}

.map-container {
  height: 400px;
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
}

#rideMap {
  height: 100%;
  width: 100%;
}

.rating-block {
  text-align: center;
  margin: 25px 0;
}

.stars {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.star {
  font-size: 30px;
  color: #ccc;
  margin: 0 6px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.star.active {
  color: #ffc107;
}

.submit-rating {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.submit-rating:hover {
  background-color: #0056b3;
}

.rated-message {
  color: #333;
  font-size: 16px;
  margin-top: 10px;
  font-weight: 500;
  text-align: center;
}
</style>
