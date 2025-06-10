<script setup>
import { reactive,ref } from "vue";
import { useRouter } from 'vue-router';
import axios from "axios";
import config from "@/config";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const router = useRouter();
const logoImage = ref(new URL('/assets/img/car-logo.png', import.meta.url).href);

const form = reactive({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
  userType: "",
  agreeToTerms: false,
});

// Function to handle registration
const handleRegister = async () => {

  if (!form.fullName || !form.email) {
    toast.error("Please fill name and email", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
    return;
  }

  if (!form.password || !form.confirmPassword) {
    toast.error("Please fill password and confirm!", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
    return;
  }

  if (form.password !== form.confirmPassword) {
    toast.error("Password and confirm password do not match!", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
    return;
  }

  if (!form.gender) {
    toast.error("Please select your gender.", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
    return;
  }

  if (!form.userType) {
    toast.error("Please select your user type.", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
    return;
  }


  try {
    const response = await axios.post(`${config.API_BASE_URL}/appuser/register`, {
      name: form.fullName,
      email: form.email,
      password: form.password,
      password_confirmation: form.confirmPassword,
      gender: form.gender,
      user_type: form.userType,
    });

    sessionStorage.setItem("success", response.data.message);

    if (response.data.success == true) {
      router.push("/");
    }
    

  } catch (error) {
    if (error.response) {
      toast.error(error.response.data.message || "Registration failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } else {
      toast.error("Network error. Please check your connection.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  }
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
                  <div class="mb-3">
                    <label class="form-label">Gender</label>
                    <select class="form-select" v-model="form.gender" required>
                      <option disabled value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">User Type</label>
                    <select class="form-select" v-model="form.userType" required>
                      <option disabled value="">User type</option>
                      <option value="student">University Student</option>
                      <option value="professional">Working Professional</option>
                    </select>
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