<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { toast } from "vue3-toastify";
import config from "@/config";

const rideOffers = ref([]);
const userRequests = ref([]);
const showModal = ref(false);
const selectedOffer = ref(null);
const selectedRequestId = ref('');
const offerPrice = ref('');


const openOfferModal = async (offer) => {
  selectedOffer.value = offer;
  showModal.value = true; 
  await fetchUserRequests(offer.id);
};


const closeModal = () => {
  showModal.value = false;
  selectedRequestId.value = '';
  offerPrice.value = '';
};

const fetchRides = async () => {    
  const token = localStorage.getItem('authToken');
  const response = await axios.get(`${config.API_BASE_URL}/ride-offers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  rideOffers.value = response.data;
};

const fetchUserRequests = async (rideId) => {
  const token = localStorage.getItem('authToken');

  try {
    const response = await axios.get(`${config.API_BASE_URL}/my-rides`, {
      params: { ride_id: rideId },
      headers: { Authorization: `Bearer ${token}` },
    });

    userRequests.value = response.data;
  } catch (error) {
    console.error("Failed to fetch ride requests:", error);
    //toast.error("Could not fetch your ride requests.");
    userRequests.value = [];
  }
};

const submitOffer = async () => {
  if (!selectedRequestId.value || !offerPrice.value) {
    toast.error('All fields are required.');
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    await axios.post(`${config.API_BASE_URL}/api/send-ride-offer`, {
      ride_id: selectedOffer.value.id,
      request_id: selectedRequestId.value,
      price: offerPrice.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success('Offer sent successfully!');
    closeModal();
  } catch (error) {
    toast.error('Failed to send offer.');
  }
};

onMounted(() => {
  fetchRides();
});

</script>

<template>
    <div class="container">
      <h2 class="title">Ride Offers</h2>
  
      <div 
        v-for="(offer, index) in rideOffers" 
        :key="index" 
        class="card"
      >
        <p><strong>Date:</strong> {{ offer.date }}</p>
        <p><strong>Time:</strong> {{ offer.time }}</p>
        <p><strong>From:</strong> {{ offer.pickup.place }}</p>
        <p><strong>To:</strong> {{ offer.dropoff.place }}</p>
        <p><strong>Seats Available:</strong> {{ offer.seats }}</p>
        <p><strong>Driver:</strong> {{ offer.driver.name }}</p>
        <p><strong>Rating:</strong> ⭐ {{ offer.driver.rating }}</p>
        
        <button @click="openOfferModal(offer)" class="btn submit">Give Offer</button>
      </div>
  
    <!-- Modal -->
    <div v-if="showModal" class="modal-backdrop">
    <div class="modal-container">
        <h3 class="modal-title">Make an Offer</h3>

        <label class="modal-label">Select Your Ride Request:</label>
        <select v-model="selectedRequestId" class="modal-input">
            <option disabled value="">-- Select Request --</option>
            <option 
                v-for="request in userRequests" 
                :key="request.id" 
                :value="request.id"
            >
                {{ request.pickup_place }} → {{ request.drop_place }} ({{ request.date }})
            </option>
        </select>
        <label class="modal-label">Offer Price (LKR):</label>
        <input type="number" v-model="offerPrice" class="modal-input" placeholder="Enter your price" />

        <div class="modal-actions">
        <button class="btn cancel" @click="closeModal">Cancel</button>
        <button class="btn submit" @click="submitOffer">Submit</button>
        </div>
    </div>
    </div>


    </div>
  </template>
  

<style scoped>
.container {
  padding: 20px;
  max-width: 600px;
  margin: auto;
}

.title {
  font-size: 24px;
  color: #012970;
  text-align: center;
  margin-bottom: 20px;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #eee;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.05);
  text-align: left;
}

/* ---------- */

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


</style>
