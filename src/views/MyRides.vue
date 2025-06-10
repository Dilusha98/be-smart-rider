<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { toast } from "vue3-toastify";
import 'vue3-toastify/dist/index.css';
import '@/assets/toast-styles.css';
import config from "@/config";
import { useRouter } from 'vue-router';

const mapMarker = ref(new URL('/assets/img/map-marker.png', import.meta.url).href);
const mapHome = ref(new URL('/assets/img/map-home.png', import.meta.url).href);

const upcomingRides = ref([]);
const pastRides = ref([]);
const selectedRide = ref(null);
const showModal = ref(false);
const selectedTab = ref('passenger');
const driverRides = ref([]);
const modalType = ref('');
const router = useRouter();

// const openModal = (ride, context = 'passenger') => {
//   selectedRide.value = ride;

//   const now = new Date();
//   const rideDateTime = new Date(`${ride.date} ${ride.time}`);

//   const isCompleted = rideDateTime < now;

//   modalType.value = `${context}-${isCompleted ? 'completed' : 'upcoming'}`;
//   showModal.value = true;
// };

const openModal = (ride, context = 'passenger') => {
  selectedRide.value = ride;

  const now = new Date();
  const rideDateTime = new Date(`${ride.date} ${ride.time}`);

  const isCompleted = ride.status === 2 || rideDateTime < now;

  modalType.value = `${context}-${isCompleted ? 'completed' : 'upcoming'}`;
  showModal.value = true;
};

// const goToRideDetails = () => {
//   if (!selectedRide?.value?.id) return;

//   const now = new Date();
//   const rideDate = new Date(`${selectedRide.value.date} ${selectedRide.value.time}`);
//   const isPast = rideDate < now;

//   let path = '';

//   if (modalType.value === 'passenger-upcoming' || (selectedTab.value === 'passenger' && !isPast)) {
//     path = `/ride/passenger/upcoming/${selectedRide.value.id}`;
//   } else if (modalType.value === 'passenger-completed' || (selectedTab.value === 'passenger' && isPast)) {
//     path = `/ride/passenger/completed/${selectedRide.value.id}`;
//   } else if (modalType.value === 'driver-upcoming' || (selectedTab.value === 'driver' && !isPast)) {
//     path = `/ride/driver/upcoming/${selectedRide.value.id}`;
//   } else if (modalType.value === 'driver-completed' || (selectedTab.value === 'driver' && isPast)) {
//     path = `/ride/driver/completed/${selectedRide.value.id}`;
//   }

//   router.push(path);
// };

const goToRideDetails = () => {
  if (!selectedRide?.value?.id) return;

  const now = new Date();
  const rideDate = new Date(`${selectedRide.value.date} ${selectedRide.value.time}`);
  const isPast = selectedRide.value.status === 2 || rideDate < now;


  let path = '';

  if (selectedRide.value.status === 1 && selectedTab.value === 'driver') {
    path = `/ride/driver/ongoing/${selectedRide.value.id}`;
  } else if (modalType.value === 'passenger-upcoming' || (selectedTab.value === 'passenger' && !isPast)) {
    path = `/ride/passenger/upcoming/${selectedRide.value.id}`;
  } else if (modalType.value === 'passenger-completed' || (selectedTab.value === 'passenger' && isPast)) {
    path = `/ride/passenger/completed/${selectedRide.value.id}`;
  } else if (modalType.value === 'driver-upcoming' || (selectedTab.value === 'driver' && !isPast)) {
    path = `/ride/driver/upcoming/${selectedRide.value.id}`;
  } else if (modalType.value === 'driver-completed' || (selectedTab.value === 'driver' && isPast)) {
    path = `/ride/driver/completed/${selectedRide.value.id}`;
  }

  router.push(path);
};


const closeModal = () => {
    showModal.value = false;
    selectedRide.value = null;
};

const fetchRides = async () => {
    try {
        const token = localStorage.getItem("authToken");
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id;

        const response = await axios.get(`${config.API_BASE_URL}/ride/get`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (response.status === 200) {
            upcomingRides.value = response.data.upcomingRides;
            pastRides.value = response.data.pastRides;
        }
    } catch (error) {
        console.error('Failed to fetch rides:', error);
        toast.error('Failed to load ride data. Please try again later.', {
            position: 'top-right',
            autoClose: 3000
        });
    }
};

const getPassengerRideStatusText = (ride) => {
  const now = new Date();
  const rideDate = new Date(`${ride.date} ${ride.time}`);

  if (ride.status === 2) return 'Completed';
  if (ride.status === 1) return 'Ongoing';
  if (ride.status === 0 && rideDate > now) return 'Upcoming';
  if (ride.status === 0 && rideDate <= now) return 'Missed';

  return 'Unknown';
};

const fetchDriverRides = async () => {
    try {
        const token = localStorage.getItem("authToken");

        const response1 = await axios.get(`${config.API_BASE_URL}/ride/driver`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        console.log(response1);
        

        if (response1.status === 200) {
            driverRides.value = response1.data.driverRides || [];
        }
    } catch (error) {
        console.error('Failed to fetch driver rides:', error);
        toast.error('Failed to load driver ride data.', {
            position: 'top-right',
            autoClose: 3000
        });
    }
};

const getDriverRideStatusText = (ride) => {
  const now = new Date();
  const rideDate = new Date(`${ride.date} ${ride.time}`);

  if (ride.status === 2) return 'Completed';
  if (ride.status === 1 && rideDate > now) return 'Ongoing';
  if (ride.status === 0 && rideDate > now) return 'Upcoming';
  if (rideDate < now) return 'Completed';
  
  return 'Unknown';
};

const getDriverRideStatusClass = (ride) => {
  const now = new Date();
  const rideDate = new Date(`${ride.date} ${ride.time}`);

  if (ride.status === 2 || rideDate < now) return 'success'; // Green
  if (ride.status === 1 && rideDate > now) return 'warning'; // Orange
  if (ride.status === 0 && rideDate > now) return 'info';    // Blue

  return 'muted'; // Default gray
};


onMounted(() => {
    fetchRides();
});

// Watch for tab change to trigger driver ride fetch
watch(selectedTab, (newTab) => {
    if (newTab === 'driver' && driverRides.value.length === 0) {
        fetchDriverRides();
    }
});
</script>

<template>
  <div class="container">
    <h2>My Rides</h2>

    <!-- Tabs -->
    <div class="tabs">
      <button 
        :class="{ active: selectedTab === 'passenger' }" 
        @click="selectedTab = 'passenger'"
      >
        Passenger Rides
      </button>
      <button 
        :class="{ active: selectedTab === 'driver' }" 
        @click="selectedTab = 'driver'"
      >
        Driver Rides
      </button>
    </div>

    <!-- Passenger Tab -->
    <div v-if="selectedTab === 'passenger'">
      <!-- Upcoming Rides -->
      <div v-if="upcomingRides.length" class="rides-list">
        <div 
          v-for="ride in upcomingRides" 
          :key="ride.id" 
          class="ride-card upcoming"
          @click="openModal(ride, 'passenger')"
        >
          <div class="ride-content">
            <div class="ride-left">
              <img :src="mapHome" alt="Home" class="icon-img" />
              <p>{{ ride.pickup_place }}</p>
            </div>
            <p class="status-text info">
              {{ ride.status === 1 ? 'Ongoing' : 'Upcoming' }}
            </p>
            <div class="ride-right">
              <img :src="mapMarker" alt="Map Pin" class="icon-img" />
              <p>{{ ride.drop_place }}</p>
            </div>
          </div>
          <div class="ride-details">
            <p>{{ ride.date }}</p>
            <p>Driver: {{ ride.driver || 'N/A' }}</p>
            <p>{{ ride.distance }} km</p>
          </div>
        </div>
      </div>
      <p v-else>No upcoming rides.</p>

      <!-- Past Rides -->
      <div v-if="pastRides.length" class="rides-list">
        <div 
          v-for="ride in pastRides" 
          :key="ride.id" 
          class="ride-card past"
          @click="openModal(ride, 'passenger')"
        >
          <div class="ride-content">
            <div class="ride-left">
              <img :src="mapHome" alt="Home" class="icon-img" />
              <p>{{ ride.pickup_place }}</p>
            </div>
            <div class="ride-status">
              <p class="status-text success">
                {{ getPassengerRideStatusText(ride) }}
              </p>
            </div>
            <div class="ride-right">
              <img :src="mapMarker" alt="Map Pin" class="icon-img" />
              <p>{{ ride.drop_place }}</p>
            </div>
          </div>
          <div class="ride-details">
            <p>{{ ride.date }}</p>
            <p>Driver: {{ ride.driver || 'N/A' }}</p>
            <p>{{ ride.distance }} km</p>
          </div>
        </div>
      </div>
      <p v-else>No past rides.</p>
    </div>

    <!-- Driver Tab -->
    <div v-else>
    <div v-if="driverRides.length" class="rides-list">
        <div 
        v-for="ride in driverRides" 
        :key="ride.id" 
        class="ride-card"
        :class="ride.status === 1 ? 'past' : 'upcoming'"
        @click="openModal(ride, 'driver')"
        >
        <div class="ride-content">
            <div class="ride-left">
            <img :src="mapHome" alt="Home" class="icon-img" />
            <p>{{ ride.start_place }}</p>
            </div>
            <div class="ride-status">
            <p
              class="status-text"
              :class="getDriverRideStatusClass(ride)"
            >
              {{ getDriverRideStatusText(ride) }}
            </p>
            </div>
            <div class="ride-right">
            <img :src="mapMarker" alt="Map Pin" class="icon-img" />
            <p>{{ ride.end_place }}</p>
            </div>
        </div>
        <div class="ride-details">
            <p>{{ ride.date }} {{ ride.time }}</p>
            <p>Driver: You</p>
            <p>{{ ride.distance ?? '0' }} km</p>
        </div>
        </div>
    </div>
    <p v-else>No driver rides available.</p>
    </div>

    <!-- Ride Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">

        <!-- Passenger - Upcoming -->
        <div v-if="modalType === 'passenger-upcoming'">
        <h3>Upcoming Passenger Ride</h3>
        <p><strong>Date:</strong> {{ selectedRide.date }} {{ selectedRide.time }}</p>
        <p><strong>Pickup:</strong> {{ selectedRide.pickup_place }}</p>
        <p><strong>Drop:</strong> {{ selectedRide.drop_place }}</p>
        <p><strong>Driver:</strong> {{ selectedRide.driver || 'N/A' }}</p>
        </div>

        <!-- Passenger - Completed -->
        <div v-else-if="modalType === 'passenger-completed'">
        <h3>Completed Passenger Ride</h3>
        <p><strong>Date:</strong> {{ selectedRide.date }} {{ selectedRide.time }}</p>
        <p><strong>From:</strong> {{ selectedRide.pickup_place }}</p>
        <p><strong>To:</strong> {{ selectedRide.drop_place }}</p>
        <p><strong>Driver:</strong> {{ selectedRide.driver || 'N/A' }}</p>
        </div>

        <!-- Driver - Upcoming -->
        <div v-else-if="modalType === 'driver-upcoming'">
        <h3>Upcoming Drive</h3>
        <p><strong>Date:</strong> {{ selectedRide.date }} {{ selectedRide.time }}</p>
        <p><strong>Start:</strong> {{ selectedRide.start_place }}</p>
        <p><strong>End:</strong> {{ selectedRide.end_place }}</p>
        <p><strong>Seats Offered:</strong> {{ selectedRide.seats }}</p>
        </div>

        <!-- Driver - Completed -->
        <div v-else-if="modalType === 'driver-completed'">
        <h3>Completed Drive</h3>
        <p><strong>Date:</strong> {{ selectedRide.date }} {{ selectedRide.time }}</p>
        <p><strong>Route:</strong> {{ selectedRide.start_place }} → {{ selectedRide.end_place }}</p>
        <p><strong>Passengers:</strong> {{ selectedRide.seats }}</p>
        <p><strong>Status:</strong> Completed</p>
        </div>

        <!-- Common action buttons for all modal types -->
        <div class="modal-actions">
          <button @click="goToRideDetails" class="details-btn">View Ride Details</button>
          <button @click="closeModal">Close</button>
        </div>
    </div>
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

.tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 15px;
    gap: 10px;
}

.tabs button {
    padding: 8px 16px;
    border: 1px solid #ccc;
    background: #f1f1f1;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
}

.tabs button.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
}

.rides-list {
    display: flex;
    flex-direction: column;
}

.ride-card {
    padding: 8px;
    background: #f8f9fa;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-left: 5px solid;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    transition: background 0.2s;
}
.ride-card:hover {
    background: #e9ecef;
}

.ride-card.upcoming {
    border-color: #007bff;
}

.ride-card.past {
    border-color: #28a745;
}

.ride-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.ride-left, .ride-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    width: 25%;
}

.ride-status {
    text-align: center;
    flex-grow: 1;
}

.status-text {
    font-size: 14px;
    font-weight: bold;
}

.status-text.info {
    color: #17a2b8;
}

.status-text.success {
    color: #28a745;
}

.ride-details {
    display: flex;
    justify-content: space-around;
    font-size: 12px;
    color: #555;
}

.icon-img {
    width: 40px;
    height: 40px;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.modal-content {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
    margin-top: 0;
    color: #333;
}

.modal-content button {
    margin-top: 15px;
    padding: 6px 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.details-btn {
  background-color: #28a745;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.details-btn:hover {
  background-color: #218838;
}

/* ---------- */
.status-text.warning {
  color: #fd7e14; /* orange for ongoing */
}

.status-text.muted {
  color: #6c757d; /* grey for unknown/default */
}

</style>
