<script setup>
defineProps({
  image: String,
  title: String,
  description: String,
  route: String,
});
</script>

<template>
  <router-link :to="route" class="card-link">
    <div class="card">
      <img :src="image" alt="Card Image" class="card-image" />
      <div class="card-content text-center">
        <h4>{{ title }}</h4>
        <p>{{ description }}</p>
      </div>
    </div>
  </router-link>
</template>


<style scoped>
.card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  width: 90%;
}

.card {
  display:flex;
  height: 130px;
  flex-direction:row;
  /* justify-content:center; */
  align-items:center;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card-image {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    margin-right: 15px;
    object-fit: cover;
}

.card-content {
  padding: 25px;
  justify-content:center;
}
</style>