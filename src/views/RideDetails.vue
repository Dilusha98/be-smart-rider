<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { toast } from 'vue3-toastify';
import config from '@/config';

const route = useRoute();
const rideId = route.params.id;

const ride = ref(null);
const offers = ref([]);
const acceptedOffer = ref(null);
const token = localStorage.getItem("authToken");

const fetchRideDetails = async () => {
  try {
    const res = await axios.get(`${config.API_BASE_URL}/get-ride/${rideId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    ride.value = res.data.ride;
            console.log(res.data.ride);
  } catch (err) {
    toast.error("Failed to load ride details");
  }
};

const fetchRideOffers = async () => {
  try {    
    const res = await axios.get(`${config.API_BASE_URL}/ride/offers/${rideId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    offers.value = res.data.offers || [];
    acceptedOffer.value = offers.value.find(o => o.status === 'accepted') || null;
  } catch (err) {
    // toast.error("Failed to load ride offers");
  }
};

const acceptOffer = async (offerId) => {
  try {
    await axios.post(`${config.API_BASE_URL}/ride/accept-offer`, { offer_id: offerId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success("Offer accepted successfully");
    fetchRideOffers();
  } catch (err) {
    toast.error("Could not accept the offer");
  }
};

onMounted(() => {
  fetchRideDetails();
  fetchRideOffers();
});
</script>

<template>
  <div class="container">
    <h2>Upcoming Passenger Ride</h2>

    <div v-if="ride">
      <p><strong>Date:</strong> {{ ride.date }} {{ ride.time }}</p>
      <p><strong>Pickup:</strong> {{ ride.pickup_place }}</p>
      <p><strong>Drop:</strong> {{ ride.drop_place }}</p>
      <p><strong>Seats:</strong> {{ ride.seats }}</p>
    </div>

    <div v-if="acceptedOffer">
      <h3>Accepted Offer</h3>
      <p><strong>Driver:</strong> {{ acceptedOffer.driver_name }}</p>
      <p><strong>Start Time:</strong> {{ acceptedOffer.start_time }}</p>
      <p><strong>Status:</strong> {{ acceptedOffer.is_started ? 'Ride has started' : 'Waiting to start' }}</p>
    </div>

    <div v-else-if="offers.length">
      <h3>Available Offers</h3>
      <ul>
        <li v-for="offer in offers" :key="offer.id">
          {{ offer.driver_name }} – starts at {{ offer.start_time }}
          <button @click="acceptOffer(offer.id)">Accept</button>
        </li>
      </ul>
    </div>

    <div v-else>
      <p>No ride offers available at this time.</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 500px;
  margin: 20px auto;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2, h3 {
  text-align: center;
  color: #333;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: #f1f1f1;
  border-radius: 4px;
  margin-top: 8px;
}

button {
  padding: 4px 8px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
