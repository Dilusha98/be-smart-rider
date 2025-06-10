<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { toast } from 'vue3-toastify';
import config from '@/config';

const route = useRoute();
const requestId = route.params.id;

const rideRequest = ref(null);
const offers = ref([]);
const acceptedOffer = ref(null);
const token = localStorage.getItem("authToken");

// Fetch the ride request
const fetchRideRequest = async () => {
  try {
    const res = await axios.get(`${config.API_BASE_URL}/ride-request/${requestId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    rideRequest.value = res.data.ride;
  } catch (err) {
    toast.error('Failed to load ride request.');
  }
};

// Fetch the offers for the ride request
const fetchRideOffers = async () => {
  try {
    const res = await axios.get(`${config.API_BASE_URL}/ride/offers/${requestId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    offers.value = res.data.offers || [];
    acceptedOffer.value = offers.value.find(o => o.status === 1) || null;
    console.log(acceptedOffer.value);
    
  } catch (err) {
    //toast.error('Failed to load ride offers.');
  }
};

// Approve an offer
const approveOffer = async (offerId) => {
  try {
    await axios.post(`${config.API_BASE_URL}/ride-request/approve-offer`, {
      offer_id: offerId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success("Offer approved successfully.");
    await fetchRideOffers();
    await fetchRideRequest();
  } catch (err) {
    toast.error("Failed to approve offer.");
  }
};

// Reject an offer
const rejectOffer = async (offerId) => {
  try {
    await axios.post(`${config.API_BASE_URL}/ride-request/reject-offer`, {
      offer_id: offerId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("Offer rejected.");
    await fetchRideOffers();
  } catch (err) {
    toast.error("Failed to reject offer.");
  }
};

// Panic button
const panic = async () => {
  try {
    await axios.post(`${config.API_BASE_URL}/ride-request/panic`, {
      request_id: requestId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("Emergency alert sent!");
  } catch (err) {
    toast.error("Failed to send alert.");
  }
};

const refreshData = async () => {
  await fetchRideRequest();
  await fetchRideOffers();
};

onMounted(() => {
  fetchRideRequest();
  fetchRideOffers();
});
</script>


<template>
  <div v-if="rideRequest" style="margin-top: 80px;">
    <div style="text-align:center;">
      <h2>Passenger Ride</h2>
    </div>
    <!-- Status: UPCOMING -->
    <div v-if="rideRequest.status === 0" class="offers-wrapper">
      <!-- Show only accepted offer if one is accepted -->
      <div v-if="acceptedOffer" class="accepted-offer-card">
        <div class="offer-header accepted">
          <h4>Accepted Offer from {{ acceptedOffer.driver?.name }}</h4>
        </div>
        <div class="offer-info">
          <p><strong>Rating:</strong> ⭐ {{ acceptedOffer.driver?.rating ?? 'N/A' }}</p>
          <p><strong>Vehicle:</strong> 🚗 {{ acceptedOffer.ride?.vehicle?.brand }} {{ acceptedOffer.ride?.vehicle?.model }}</p>
          <p><strong>Plate:</strong> {{ acceptedOffer.ride?.vehicle?.plate_number }}</p>
          <p><strong>Price:</strong> 💰 Rs. {{ acceptedOffer.price }}</p>
          <p><strong>Start Time:</strong> 🕒 {{ acceptedOffer.ride?.date }} {{ acceptedOffer.ride?.time }}</p>
        </div>
      </div>

      <!-- Otherwise show all pending offers -->
      <div v-else-if="offers.length">
        <div v-for="offer in offers" :key="offer.id" class="offer-card">
          <div class="offer-header">
            <h4>Offer from {{ offer.driver?.name }}</h4>
          </div>
          <div class="offer-info">
            <p><strong>Rating:</strong> ⭐ {{ offer.driver?.rating ?? 'N/A' }}</p>
            <p><strong>Vehicle:</strong> 🚗 {{ offer.ride?.vehicle?.brand }} {{ offer.ride?.vehicle?.model }}</p>
            <p><strong>Plate:</strong> {{ offer.ride?.vehicle?.plate_number }}</p>
            <p><strong>Price:</strong> 💰 Rs. {{ offer.price }}</p>
          </div>
          <div class="offer-actions">
            <button class="approve" @click="approveOffer(offer.id)">✅ Approve</button>
            <button class="reject" @click="rejectOffer(offer.id)">❌ Reject</button>
          </div>
        </div>
      </div>

      <p v-else class="empty-text">No offers yet.</p>
    </div>

    <!-- Status: ONGOING -->
    <div v-else-if="rideRequest.status === 1" class="ongoing-wrapper">
      <h3 class="ongoing-title">🛣️ Ongoing Ride</h3>

      <div class="ongoing-card">
        <div class="ride-info">
          <p><strong>🔑 Ride Key:</strong> 
            <span class="ride-key" v-if="acceptedOffer?.ride?.status === 1">
              {{ rideRequest.ride_key }}
            </span>
            <span v-else style="color: #999; font-style: italic;">
              Ride not started yet
            </span>
          </p>
          <p><strong>👨‍✈️ Driver:</strong> {{ acceptedOffer?.driver?.name ?? 'N/A' }}</p>
          <p><strong>🚗 Vehicle:</strong> {{ acceptedOffer?.ride?.vehicle?.brand ?? '' }} {{ acceptedOffer?.ride?.vehicle?.model ?? '' }}</p>
        </div>

        <div class="map-container">
          <p class="map-placeholder-text">🗺️ Map will be shown here</p>
        </div>

        <div class="ongoing-actions">
          <button class="refresh-btn" @click="refreshData">
            🔄 Refresh
          </button>
          <a href="tel:119" class="panic-btn">
            🚨 Panic
          </a>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  overflow-x: hidden;
}

.offers-wrapper {
  width: 100%;
  padding: 0;
  margin: 0;
}

.offer-card {
  width: 100vw;
  max-width: 100vw;
  padding: 16px;
  margin: 10px 0;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
  box-sizing: border-box;
}

.btn-group {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.empty-text {
  text-align: center;
  color: #777;
  font-style: italic;
  margin-top: 10px;
}

/* /////////////////////// */

.offer-card {
  width: 100%;
  max-width: 100%;
  padding: 16px;
  margin: 10px 0;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
  box-sizing: border-box;
}

.offer-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.offer-header {
  margin-bottom: 12px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 6px;
}

.offer-header h4 {
  margin: 0;
  color: #007bff;
  font-size: 18px;
}

.offer-info p {
  margin: 6px 0;
  font-size: 14px;
  color: #333;
}

.offer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.offer-actions button {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.offer-actions .approve {
  background-color: #28a745;
  color: white;
}

.offer-actions .reject {
  background-color: #dc3545;
  color: white;
}

.offers-wrapper {
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (max-width: 480px) {
  .offer-card {
    width: 100vw;
    max-width: 100vw;
    border-radius: 0;
    margin: 0;
    box-shadow: none;
  }
}


/* /////////// */

.accepted-offer-card {
  width: 100%;
  padding: 16px;
  margin: 15px auto;
  background: #e8f6ef;
  border-left: 6px solid #28a745;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  box-sizing: border-box;
}

.offer-header.accepted h4 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #28a745;
}

.driver-name {
  color: #007bff;
  font-weight: 600;
}

.offer-info p {
  margin: 6px 0;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.offer-info i {
  color: #555;
  min-width: 18px;
}

/* ---------------------- */

.ongoing-title {
  text-align: center;
  color: #004085;
  font-size: 20px;
  margin-bottom: 10px;
}

.ongoing-card {
  background-color: #fefefe;
  border: 1px solid #d1d1d1;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  margin: 0 10px;
}

.ride-info p {
  font-size: 15px;
  margin: 8px 0;
  color: #333;
}

.ride-key {
  background-color: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 14px;
}

.map-container {
  height: 400px;
  background-color: #eaeaea;
  border-radius: 10px;
  margin: 15px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed #ccc;
}

.map-placeholder-text {
  color: #777;
  font-style: italic;
}


/* ---------- */

.ongoing-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.refresh-btn,
.panic-btn {
  flex: 1;
  padding: 12px 0;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: 0.2s ease-in-out;
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Button-specific styles */
.refresh-btn {
  background-color: #17a2b8;
  color: white;
}

.panic-btn {
  background-color: #dc3545;
  color: white;
}

/* Hover effects */
.refresh-btn:hover {
  background-color: #138496;
}

.panic-btn:hover {
  background-color: #bd2130;
}


</style>