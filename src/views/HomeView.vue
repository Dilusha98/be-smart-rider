<script setup>
import { ref } from 'vue';
import 'aos/dist/aos.css';
import AOS from 'aos';
AOS.init();

const heroTitle = ref('Drive Smarter, Ride Better');
const heroDescription = ref(
  'Empowering Your Journey with Smart Solutions'
);
const heroImage = ref(new URL('/assets/img/left-side-pic.png', import.meta.url).href);
const logoImage = ref(new URL('/assets/img/car-logo.png', import.meta.url).href);
</script>

<template>
    <div>
      <section id="hero" class="hero section">
        <div class="container">
          <div class="row gy-4">

            <!-- Left Side: Hero Content -->
            <div class="col-lg-6 order-1 order-lg-1 d-flex flex-column justify-content-center" id="left">
              <div class="hero-img" data-aos="zoom-out">
                <img :src="heroImage" class="img-fluid animated" alt="Hero Image" />
                <h1 data-aos="fade-up">{{ heroTitle }}</h1>
                <p data-aos="fade-up" data-aos-delay="100">{{ heroDescription }}</p>
              </div>
            </div>
  
            <!-- Right Side: Login Form -->
            <div class="col-lg-6 order-2 order-lg-2 d-flex flex-column justify-content-center">
              <div class="login-card p-4 rounded shadow-lg">

                <!-- Logo -->
                <div class="text-center mb-4">
                  <img :src="logoImage" alt="App Logo" class="mb-3" style="width:150px;" />
                  <h5>Welcome back to the Smart Ride</h5>
                </div>
  
                <!-- Login Form -->
                <form>
                  <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <input type="email" id="email" class="form-control" placeholder="Enter your email" required/>
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" id="password" class="form-control" placeholder="Enter your password" required/>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <a href="#" class="text-decoration-none">Forgot Password?</a>
                  </div>
                  <button class="btn btn-primary w-100 mt-4">Login</button>
                  <p style="font-size:small" class="text-center mt-3">
                    Don't have an account? <router-link to="/user-register" class="text-primary">Create an account</router-link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  
  <style scoped>
    .login-card {
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    margin: auto;
    }

    .btn-primary {
    background-color: #4f46e5;
    border: none;
    }

    .btn-primary:hover {
    background-color: #3b3ba8;
    }

    @media (max-width: 768px) {
    #left {
        background-color: #f0f0f0;
        padding: 20px;
        text-align: center;
    }
    }
</style>
  

