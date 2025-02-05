<script setup>
import { ref } from 'vue';

const mapMarker = ref(new URL('/assets/img/map-marker.png', import.meta.url).href);
const mapHome = ref(new URL('/assets/img/map-home.png', import.meta.url).href);

const upcomingRides = ref([
    { id: 1, date: '2024-06-15', time: '10:00 AM', pickup: 'Peradeniya', dropoff: 'Colombo', driver: 'Nimal', amount: 'RS:500', status: 'Upcoming' },
    { id: 2, date: '2024-06-18', time: '2:30 PM', pickup: 'Colombo', dropoff: 'Kandy', driver: 'Kamal', amount: 'RS:750', status: 'Upcoming' }
]);

const pastRides = ref([
    { id: 3, date: '2024-05-10', time: '3:00 PM', pickup: 'Kandy', dropoff: 'Kotte', driver: 'Amal', amount: 'RS:400', status: 'Completed' },
    { id: 4, date: '2024-05-05', time: '8:00 AM', pickup: 'Pettah', dropoff: 'Peradeniya', driver: 'Saman', amount: 'RS:600', status: 'Completed' }
]);
</script>

<template>
    <div class="container">
        <h2>My Rides</h2>

        <div v-if="upcomingRides.length" class="rides-list">
            <div v-for="ride in upcomingRides" :key="ride.id" class="ride-card upcoming">
                <div class="ride-content">
                    <div class="ride-left">
                        <img :src="mapHome" alt="Home" class="icon-img" />
                        <p>{{ ride.pickup }}</p>
                    </div>
                    <div class="ride-status">
                        <p class="status-text info">{{ ride.status }}</p>
                    </div>
                    <div class="ride-right">
                        <img :src="mapMarker" alt="Map Pin" class="icon-img" />
                        <p>{{ ride.dropoff }}</p>
                    </div>
                </div>
                <div class="ride-details">
                    <p>{{ ride.date }}</p>
                    <p>Driver: {{ ride.driver }}</p>
                    <p>{{ ride.amount }}</p>
                </div>
            </div>
        </div>
        <p v-else>No upcoming rides.</p>

        <div v-if="pastRides.length" class="rides-list">
            <div v-for="ride in pastRides" :key="ride.id" class="ride-card past">
                <div class="ride-content">
                    <div class="ride-left">
                        <img :src="mapHome" alt="Home" class="icon-img" />
                        <p>{{ ride.pickup }}</p>
                    </div>
                    <div class="ride-status">
                        <p class="status-text success">{{ ride.status }}</p>
                    </div>
                    <div class="ride-right">
                        <img :src="mapMarker" alt="Map Pin" class="icon-img" />
                        <p>{{ ride.dropoff }}</p>
                    </div>
                </div>
                <div class="ride-details">
                    <p>{{ ride.date }}</p>
                    <p>Driver: {{ ride.driver }}</p>
                    <p>{{ ride.amount }}</p>
                </div>
            </div>
        </div>
        <p v-else>No past rides.</p>
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

.rides-list {
    display: flex;
    flex-direction: column;
    /* gap: 10px; */
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

.ride-card.upcoming {
    border-color: #007bff;
}

.ride-card.past {
    border-color: #28a745;
}
</style>
