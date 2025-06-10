<script setup>
import { ref, onMounted, onUnmounted ,computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import config from '@/config';
import L from 'leaflet';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const rideId = route.params.id;

const ride = ref(null);
const offers = ref([]);
let map = null;
let driverMarker = null;
let locationInterval = null;
const rideKeys = ref({});
const showConfirmModal = ref(false);
const pendingPickupCount = computed(() => offers.value.filter(o => !o.picked_up).length);

const addPassengerMarkersAndRoute = (driverLat, driverLng) => {
  const passengers = offers.value.map(o => ({
    lat: parseFloat(o.request.pickup_lat),
    lng: parseFloat(o.request.pickup_lng),
    name: o.passenger_user?.name || 'Passenger'
  })).sort((a, b) => {
    return map.distance([driverLat, driverLng], [a.lat, a.lng]) - map.distance([driverLat, driverLng], [b.lat, b.lng]);
  });

  const routePoints = [[driverLat, driverLng]];

  passengers.forEach(p => {
    routePoints.push([p.lat, p.lng]);
    L.marker([p.lat, p.lng], {
      icon: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        iconSize: [32, 32]
      })
    })
    .bindTooltip(`<strong>${p.name}</strong>`, {
      permanent: true,
      direction: 'top',
      offset: [0, -10],
      className: 'passenger-tooltip'
    })
    .addTo(map);
  });

};

const loadMap = (lat, lng) => {
  map = L.map('map').setView([lat, lng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  driverMarker = L.marker([lat, lng], {
    title: 'Your Location',
    icon: L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [30, 30]
    })
  }).addTo(map);

  addPassengerMarkersAndRoute(lat, lng);
};

const apiKey = '9d27823c14f4462cb49d23f11f9ca0fe';
const orsApiKey = '5b3ce3597851110001cf6248aa82c8b7a5e04858b8df6b89702eae2d'; 

const drawRoute = async (from, to) => {
  try {
    const orsRes = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        coordinates: [from, to]
      },
      {
        headers: {
          Authorization: orsApiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const routeCoords = orsRes.data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);

    L.polyline(routeCoords, {
      color: 'blue',
      weight: 4,
      opacity: 0.8
    }).addTo(map);
  } catch (err) {
    console.error('Failed to fetch route from ORS:', err);
  }
};

const updateDriverLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log(`[Driver Pos] ${latitude}, ${longitude}`);

        // update map marker
        if (driverMarker) {
          driverMarker.setLatLng([latitude, longitude]);
          map.setView([latitude, longitude]);
        }

        // log to backend
        try {
          const token = localStorage.getItem("authToken");
          await axios.post(`${config.API_BASE_URL}/ride/${rideId}/location`, {
            lat: latitude,
            lng: longitude
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (err) {
          console.error("Failed to store driver location:", err);
        }
      },
      (err) => console.error('Geolocation error:', err),
      { enableHighAccuracy: true }
    );
  }
};


const stopRide = async () => {
  if (pendingPickupCount.value > 0) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You haven’t picked up all passengers. Do you still want to stop the ride?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, stop ride',
    });

    if (!result.isConfirmed) return;
  }

  await performStopRide();
};

const performStopRide = async () => {
  try {
    const token = localStorage.getItem('authToken');

    await axios.post(`${config.API_BASE_URL}/ride/driver/stop/${rideId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    clearInterval(locationInterval);
    toast.success("Ride stopped and marked as completed.");
    router.push(`/ride/driver/completed/${rideId}`);
  } catch (error) {
    toast.error("Failed to stop ride.");
    console.error(error);
  }
};

const submitRideKey = async (offerId) => {
  const key = rideKeys.value[offerId];
  if (!key) return toast.warning('Please enter the ride key');

  try {
    const token = localStorage.getItem('authToken');
    await axios.post(`${config.API_BASE_URL}/ride/offer/${offerId}/verify-key`, {
      ride_key: key
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // ✅ Optimistically update the local offer
    const target = offers.value.find(o => o.id === offerId);
    if (target) target.picked_up = 1;

    toast.success("Passenger marked as picked up");
    // await fetchRideData();
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to verify key");
  }
};


const fetchRideData = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const res = await axios.get(`${config.API_BASE_URL}/ride/driver/detail/${rideId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    ride.value = res.data.ride;
    offers.value = res.data.offers.filter(o => o.status === 1);

        navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        console.log(`[Init Driver Location] Lat: ${latitude}, Lng: ${longitude}`);
        loadMap(latitude, longitude);

        // Sort passengers by distance (optional)
        const sortedOffers = offers.value.slice().sort((a, b) => {
            const distA = Math.hypot(a.request.pickup_lat - latitude, a.request.pickup_lng - longitude);
            const distB = Math.hypot(b.request.pickup_lat - latitude, b.request.pickup_lng - longitude);
            return distA - distB;
        });

        const routePoints = [[longitude, latitude]];

        sortedOffers.forEach((offer) => {
            if (offer.request?.pickup_lat && offer.request?.pickup_lng) {
            routePoints.push([
                offer.request.pickup_lng,
                offer.request.pickup_lat
            ]);
            }
        });

        // draw route from driver to all passengers in order
        for (let i = 0; i < routePoints.length - 1; i++) {
            drawRoute(routePoints[i], routePoints[i + 1]);
        }
        });

    locationInterval = setInterval(updateDriverLocation, 10000);
  } catch (error) {
    console.error('Failed to load ride data:', error);
  }
};

onMounted(fetchRideData);

onUnmounted(() => {
  if (map) map.remove();
  if (locationInterval) clearInterval(locationInterval);
});
</script>

<template>
  <div class="ongoing-container">
    <h2>🚗 Ongoing Ride</h2>

    <div class="ride-summary">
      <p><strong>From:</strong> {{ ride?.start_place }}</p>
      <p><strong>To:</strong> {{ ride?.end_place }}</p>
    </div>

    <div id="map" class="map-view"></div>

    <button class="stop-btn" @click="stopRide">🛑 Stop Ride</button>

    <h3>Passengers</h3>
    <ul class="passenger-list">
        <li v-for="offer in offers" :key="offer.id">
        <div>
            <strong>{{ offer.passenger_user?.name || 'N/A' }}</strong> — {{ offer.request?.pickup_place || 'Unknown Pickup' }}
        </div>

        <div v-if="offer.picked_up">
            ✅ Picked Up
        </div>
        
        <div v-else class="ride-key-entry">
            <input
            v-model="rideKeys[offer.id]"
            type="text"
            placeholder="Enter ride key"
            />
            <button @click="submitRideKey(offer.id)">Submit</button>
        </div>
        </li>
    </ul>
  </div>

    <!-- Stop Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
        <div class="modal">
            <p>You haven’t picked up all passengers. Are you sure you want to stop the ride?</p>
            <div class="modal-actions">
            <button @click="performStopRide">Yes, Stop</button>
            <button @click="showConfirmModal = false">Cancel</button>
            </div>
        </div>
    </div>


</template>

<style scoped>
.ongoing-container {
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
  height: 420px;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
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
  font-size: 14px;
}

.passenger-tooltip {
  background: #007bff;
  color: white;
  font-size: 12px;
  padding: 4px 6px;
  border-radius: 4px;
  font-weight: 500;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}
/* ----------- */

.stop-btn {
  background-color: #dc3545;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 20px;
  width: 100%;
}
.stop-btn:hover {
  background-color: #c82333;
}

/* ---------------- */

.ride-key-entry {
  margin-top: 6px;
  display: flex;
  gap: 6px;
}
.ride-key-entry input {
  flex: 1;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.ride-key-entry button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.ride-key-entry button:hover {
  background-color: #0056b3;
}

/* ------------ */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999; /* MAX value */
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 300px;
  text-align: center;
  z-index: 100000; /* MAX value */
  position: relative;
}


.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.modal-actions button {
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.modal-actions button:first-child {
  background-color: #dc3545;
  color: white;
}

.modal-actions button:last-child {
  background-color: #6c757d;
  color: white;
}

</style>
