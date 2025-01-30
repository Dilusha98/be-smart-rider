<script setup>
  import Navbar from './components/Navbar.vue';
  import { RouterView } from 'vue-router';


</script>

<template>
  <Navbar></Navbar>
  <div class="content">
    <RouterView />
  </div>
</template>

<style scoped>
  .content {
    margin-top: 60px;
    /* padding: 20px; */
  }
</style>