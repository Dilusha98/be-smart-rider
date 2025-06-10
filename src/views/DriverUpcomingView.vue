<script setup>
import { ref, onMounted } from 'vue';
import { useRoute,useRouter } from 'vue-router';
import axios from 'axios';
import { toast } from "vue3-toastify";
import config from "@/config";

const route = useRoute();
const router = useRouter();
const rideId = route.params.id;

const ride = ref(null);
const offers = ref([]);
const loading = ref(true);

const fetchRideDetails = async () => {
  try {
    const token = localStorage.getItem("authToken");

    const res = await axios.get(`${config.API_BASE_URL}/ride/driver/detail/${rideId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    ride.value = res.data.ride;
    offers.value = res.data.offers;

  } catch (err) {
    toast.error("Failed to load ride data.");
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const acceptOffer = async (offerId) => {
  try {
    const token = localStorage.getItem("authToken");

    await axios.post(`${config.API_BASE_URL}/ride/offer/${offerId}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("Offer accepted!");
    fetchRideDetails();
  } catch (err) {
    toast.error("Could not accept offer.");
  }
};

const rejectOffer = async (offerId) => {
  try {
    const token = localStorage.getItem("authToken");

    await axios.post(`${config.API_BASE_URL}/ride/offer/${offerId}/reject`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("Offer rejected.");
    fetchRideDetails();
  } catch (err) {
    toast.error("Could not reject offer.");
  }
};

const startRide = async () => {
  const acceptedCount = offers.value.filter(o => o.status === 1).length;

  if (acceptedCount === 0) {
    toast.warning("Please accept at least one offer before starting the ride.");
    return;
  }

  try {
    const token = localStorage.getItem("authToken");

    await axios.post(`${config.API_BASE_URL}/ride/driver/start/${rideId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // toast.success("Ride started!");
    router.push(`/ride/driver/ongoing/${rideId}`);

  } catch (err) {
    toast.error("Failed to start ride.");
    console.error(err);
  }
};


onMounted(fetchRideDetails);
</script>

<template>
  <div class="container" v-if="!loading">
    <h1 class="app-title">Drive Ride</h1>

    <div class="ride-info-card">
      <p><strong>Date:</strong> {{ ride.date }} {{ ride.time }}</p>
      <p><strong>From:</strong> {{ ride.start_place }}</p>
      <p><strong>To:</strong> {{ ride.end_place }}</p>
      <p><strong>Seats Offered:</strong> {{ ride.seats }}</p>
    </div>

    <div v-if="ride.status === 0" class="start-section">
        <button class="start-btn" @click="startRide">🚗 Start Ride</button>
    </div>

    <!-- Pending Offers -->
    <div class="offers-section">
      <h2>Pending Offers</h2>
      <div v-if="offers.filter(o => o.status === 0).length">
        <div
          v-for="offer in offers.filter(o => o.status === 0)"
          :key="offer.id"
          class="offer-card"
        >
          <div class="offer-info">
            <p><strong>👤 Passenger:</strong> {{ offer.passenger_user?.name || 'N/A' }}</p>
            <p><strong>📍 Pickup:</strong> {{ offer.request?.pickup_place || 'N/A' }}</p>
            <p><strong>📍 Drop:</strong> {{ offer.request?.drop_place || 'N/A' }}</p>
            <p><strong>💰 Price:</strong> Rs. {{ offer.price }}</p>
          </div>
          <div class="actions">
            <button class="accept-btn" @click="acceptOffer(offer.id)">Accept</button>
            <button class="reject-btn" @click="rejectOffer(offer.id)">Reject</button>
          </div>
        </div>
      </div>
      <p v-else class="empty-note">No pending offers.</p>
    </div>

    <!-- Accepted Offers -->
    <div class="offers-section">
      <h2>Accepted Offers</h2>
      <div v-if="offers.filter(o => o.status === 1).length">
        <div
          v-for="offer in offers.filter(o => o.status === 1)"
          :key="offer.id"
          class="offer-card accepted"
        >
          <div class="offer-info">
            <p><strong>👤 Passenger:</strong> {{ offer.passenger_user?.name || 'N/A' }}</p>
            <p><strong>📍 Pickup:</strong> {{ offer.request?.pickup_place || 'N/A' }}</p>
            <p><strong>📍 Drop:</strong> {{ offer.request?.drop_place || 'N/A' }}</p>
            <p><strong>💰 Price:</strong> Rs. {{ offer.price }}</p>
          </div>
        </div>
      </div>
      <p v-else class="empty-note">No accepted offers yet.</p>
    </div>
  </div>
</template>


<style scoped>
.container {
  max-width: 500px;
  margin: auto;
  padding: 16px;
  background: #f9f9f9;
  font-family: 'Segoe UI', sans-serif;
}

.app-title {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #007bff;
}

.ride-info-card {
  background: #fff;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.badge-upcoming {
  color: #007bff;
  font-weight: bold;
}

.badge-completed {
  color: #28a745;
  font-weight: bold;
}

.offers-section {
  margin-top: 25px;
}

.offers-section h2 {
  font-size: 1.2rem;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 4px;
  margin-bottom: 12px;
}

.offer-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px 15px;
  margin-bottom: 14px;
  border: 1px solid #ddd;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.offer-card.accepted {
  border-left: 4px solid #28a745;
  background: #f3fff3;
}

.offer-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #333;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.accept-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.accept-btn:hover {
  background-color: #218838;
}

.reject-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.reject-btn:hover {
  background-color: #c82333;
}

.empty-note {
  color: #888;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}

/* ////////// */

.start-section {
  text-align: center;
  margin-top: 16px;
}

.start-btn {
  background: linear-gradient(135deg, #007bff, #3399ff);
  color: white;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover {
  background: linear-gradient(135deg, #0056b3, #1e90ff);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
}


</style>
