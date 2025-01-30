<script setup>
import { reactive,ref } from "vue";

const logoImage = ref(new URL('/assets/img/car-logo.png', import.meta.url).href);

const form = reactive({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
});

const handleRegister = () => {
  if (form.password !== form.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

    alert("Registration successful!");
    console.log("Form data:", form);
};
</script>

<template>
    <div class="hero">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-6 col-md-8 col-sm-10">
            <div class="card shadow-lg">
              <div class="card-body p-5">
                <div class="text-center">
                  <img :src="logoImage" alt="Logo" class="logo mb-3" />
                </div>
                <h3 class="text-center mb-4">Create an Account</h3>
                <form @submit.prevent="handleRegister">
                  <div class="mb-3">
                    <label for="fullName" class="form-label">Full Name</label>
                    <input type="text" id="fullName" class="form-control" v-model="form.fullName"  placeholder="Enter your full name" required />
                  </div>
                  <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <input type="email" id="email" class="form-control" v-model="form.email" placeholder="Enter your email" required />
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" id="password" class="form-control" v-model="form.password" placeholder="Create a password" required/>
                  </div>
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Confirm Password</label>
                    <input type="password" id="confirmPassword" class="form-control" v-model="form.confirmPassword" placeholder="Confirm your password" required />
                  </div>
                  <div class="form-check mb-4">
                    <input class="form-check-input" type="checkbox" id="terms" v-model="form.agreeToTerms" required/>
                    <label class="form-check-label" for="terms">
                      I agree to the <a href="#" class="text-primary">Terms and Conditions</a>.
                    </label>
                  </div>
                  <button class="btn btn-primary w-100" type="submit">Sign Up</button>
                </form>
                <p style="font-size:small" class="text-center mt-3">
                  Already have an account? 
                  <router-link to="/" class="text-primary">Login</router-link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

<style scoped>
.hero {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url(/assets/img/hero-bg.png) top center no-repeat;
  background-size: cover;
}

.logo {
  width: 80px;
}
</style>