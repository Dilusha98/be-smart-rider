<template>
  <div class="completed-container">
    <h2>✅ Ride Completed</h2>

    <div class="ride-header">
      <div class="ride-summary-card">
        <p><strong>From:</strong> {{ ride?.start_place }}</p>
        <p><strong>To:</strong> {{ ride?.end_place }}</p>
        <p><strong>Date:</strong> {{ ride?.date }} {{ ride?.time }}</p>
      </div>

      <div class="earnings-box">
        💵 <strong>Total Earnings:</strong> Rs. {{ totalEarnings }}
      </div>
    </div>

    <!-- 🚫 Ride didn’t happen -->
    <div v-if="rideNotGone" class="not-gone-box">
      ⚠️ This ride did not take place. It was scheduled but never started.
    </div>

    <!-- ✅ Ride went ahead -->
    <template v-else>
      <div id="map" class="map-view"></div>

      <h3>Passengers</h3>
      <ul class="passenger-list">
        <li v-for="offer in offers" :key="offer.id" class="passenger-card">
          <div class="passenger-header">
            <strong>{{ offer.passenger_user?.name }}</strong>
            <span :class="offer.picked_up ? 'status-picked' : 'status-missed'">
              {{ offer.picked_up ? 'Picked Up' : 'Not Picked Up' }}
            </span>
          </div>

          <div class="pickup-info">
            📍 {{ offer.request?.pickup_place || 'Unknown' }}
          </div>

          <div class="amount">
            💰 <strong>Rs. {{ offer.price }}</strong>
          </div>

          <div v-if="offer.picked_up && !offer.feedback_given" class="feedback-section">
            <label>Leave Feedback:</label>
            <div class="stars">
              <span
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{ active: feedbackRatings[offer.id] >= star }"
                @click="setFeedbackRating(offer.id, star)"
              >★</span>
            </div>
            <button class="feedback-btn" @click="submitFeedback(offer.id)">
              Submit Feedback
            </button>
          </div>

          <div v-if="offer.feedback_given" class="feedback-submitted">
            ✅ Feedback submitted
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>


<script setup>
import { ref, onMounted ,computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import config from '@/config';
import L from 'leaflet';
import { toast } from 'vue3-toastify';
import dayjs from 'dayjs';

const route = useRoute();
const rideId = route.params.id;

const ride = ref(null);
const offers = ref([]);
const locations = ref([]);
let map = null;
const feedbackRatings = ref({});

const totalEarnings = computed(() =>
  offers.value.reduce((sum, o) => sum + (o.price || 0), 0)
);

const setFeedbackRating = (offerId, rating) => {
  feedbackRatings.value[offerId] = rating;
};

const rideNotGone = computed(() => {
  if (!ride.value || ride.value.status !== 0) return false;

  const rideDateTime = dayjs(`${ride.value.date} ${ride.value.time}`);
  const isPast = dayjs().isAfter(rideDateTime);
  const hasTracking = locations.value.length > 0;

  return isPast && !hasTracking;
});

const submitFeedback = async (offerId) => {
  const rating = feedbackRatings.value[offerId];
  if (!rating) return toast.warning("Please select a rating");
    console.log(offerId);
    
  try {
    const token = localStorage.getItem("authToken");
    await axios.post(`${config.API_BASE_URL}/ride/feedback`, {
        offer_id: offerId,
        rating: rating
        }, {
        headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("Feedback submitted");
    const target = offers.value.find(o => o.id === offerId);
    if (target) target.feedback_given = true;
  } catch (err) {
    console.error("Feedback failed", err);
    toast.error("Could not submit feedback");
  }
};

const loadMap = () => {
  if (!locations.value.length) return;

  const routeCoords = locations.value.map(loc => [parseFloat(loc.lat), parseFloat(loc.lng)]);

  map = L.map('map');

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Draw polyline
  const polylineLayer = L.polyline(routeCoords, { color: 'green', weight: 4 }).addTo(map);

  // Fit map to route
  map.fitBounds(polylineLayer.getBounds());

  // Add passenger markers
  offers.value.forEach((offer) => {
    const req = offer.request;
    if (req?.pickup_lat && req?.pickup_lng) {
      const lat = parseFloat(req.pickup_lat);
      const lng = parseFloat(req.pickup_lng);

      L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          iconSize: [32, 32]
        })
      }).bindTooltip(`<strong>${offer.passenger_user?.name}</strong>`, {
        permanent: true,
        direction: 'top',
        offset: [0, -10]
      }).addTo(map);
    }
  });
};


const fetchCompletedRide = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await axios.get(`${config.API_BASE_URL}/ride/driver/completed/${rideId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    ride.value = res.data.ride;
    offers.value = res.data.offers;
    locations.value = res.data.locations;

    loadMap();
  } catch (err) {
    console.error('Failed to load completed ride data:', err);
  }
};

onMounted(fetchCompletedRide);
</script>

<style scoped>
.completed-container {
  max-width: 500px;
  margin: auto;
  padding: 16px;
  font-family: 'Segoe UI', sans-serif;
}

.ride-summary {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.map-view {
  height: 400px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 20px;
}

.passenger-list {
  list-style: none;
  padding: 0;
}

.passenger-list li {
  background: #eef;
  padding: 8px;
  margin-bottom: 6px;
  border-radius: 4px;
}

/* ----------- */

.passenger-list {
  list-style: none;
  padding: 0;
}

.passenger-card {
  background: #f9f9ff;
  border: 1px solid #ccc;
  padding: 14px;
  margin-bottom: 12px;
  border-radius: 8px;
}

.passenger-header {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  margin-bottom: 4px;
}

.status-picked {
  color: green;
  font-weight: bold;
}

.status-missed {
  color: gray;
  font-style: italic;
}

.pickup-info {
  font-size: 14px;
  margin-bottom: 4px;
  color: #555;
}

.amount {
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
}

.feedback-section label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.stars {
  display: flex;
  gap: 5px;
  font-size: 22px;
  margin-bottom: 10px;
}

.star {
  color: #ccc;
  cursor: pointer;
  transition: color 0.3s;
}

.star.active {
  color: #ffc107;
}

.feedback-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.feedback-btn:hover {
  background-color: #0056b3;
}

.feedback-submitted {
  color: #28a745;
  font-weight: 500;
}

/* ---------- */

.earnings-box {
  background: #e6ffe6;
  padding: 10px 14px;
  margin-bottom: 16px;
  border: 1px solid #a3e6a3;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  color: #2e7d32;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ------- */

.ride-header {
  margin-bottom: 16px;
}

.ride-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0f8ff;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  border: 1px solid #d0eaff;
  margin-bottom: 12px;
}

.ride-status {
  background-color: #d4edda;
  color: #155724;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  border: 1px solid #c3e6cb;
}

.ride-summary-card {
  background: #f9f9f9;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 12px;
  font-size: 15px;
}

.not-gone-box {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
  padding: 16px;
  border-radius: 6px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 20px;
}
</style>
