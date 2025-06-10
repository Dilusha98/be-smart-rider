<script setup>
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import Swal from 'sweetalert2';

const router = useRouter();
const isLoggedIn = computed(() => !!localStorage.getItem("authToken"));

const logout = () => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to logout?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#012970',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Yes, logout',
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("verification_status");
      localStorage.setItem("justLoggedOut", "true"); // optional
      router.push('/');
      setTimeout(() => window.location.reload(), 100); // refresh after redirect
    }
  });
};
</script>



<template>
  <header class="header fixed-top">
    <div class="navbar-container d-flex align-items-center justify-content-between">

      <div v-if="isLoggedIn" class="logout-icon-wrapper" @click="logout">
        <i class="fas fa-sign-out-alt logout-icon" title="Logout"></i>
      </div>

      <router-link to="/user-dashboard" class="logo d-flex align-items-center">
        <img src="/assets/img/car-logo.png" alt="Logo" class="logo-img" />
        <h5 class="brand-name">Smart Ride</h5>
      </router-link>

    </div>
  </header>
</template>


<style scoped>
.header {
  background-color: #fff;
  padding: 10px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logout-icon-wrapper {
  cursor: pointer;
}

.logout-icon {
  font-size: 24px;
  color: #012970;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-img {
  width: 40px;
  margin-right: 8px;
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: #012970;
  margin: 0;
}
</style>
