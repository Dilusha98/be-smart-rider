<script setup>
import { ref} from "vue";
import Card from "../components/UserHomeCard.vue";

const cards = ref([
  {
    image: "./assets/img/user-side/offerRide.png",
    title: "Offer Ride",
    description: "Share your ride and save costs",
    url: "/offer-ride",
  },
  {
    image: "./assets/img/user-side/findRide.png",
    title: "Find Ride",
    description: "Get a ridewith trusted drivers",
    url: "/find-ride",
  },
  {
    image: "./assets/img/user-side/registerCar.png",
    title: "Register Vehicle",
    description: "List your car. Start earning.",
    url: "/register-vehicle",
  },
  {
    image: "./assets/img/user-side/RideHistory.png",
    title: "My Rides",
    description: "Track your past and upcoming trips",
    url: "/my-rides",
  },
]);
</script>

<template>
    <div class="card-container">
      <Card
        v-for="(card, index) in cards"
        :key="index"
        :image="card.image"
        :title="card.title"
        :description="card.description"
        :route="card.url"
      />
    </div>
</template>

<style scoped>
.card-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top:100px;
}
</style>