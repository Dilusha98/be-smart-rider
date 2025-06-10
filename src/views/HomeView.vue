<script setup>
import { reactive,ref,onMounted  } from 'vue';
import { toast } from "vue3-toastify";
import { useRouter } from "vue-router";
import axios from "axios";
import "vue3-toastify/dist/index.css";
import "@/assets/toast-styles.css";
import 'aos/dist/aos.css';
import AOS from 'aos';
import config from "@/config";
AOS.init();

const router = useRouter();

const form = reactive({
  email:"",
  password:""
});

const email = ref("");
const password = ref("");
const loading = ref(false);

const heroTitle = ref('Drive Smarter, Ride Better');
const heroDescription = ref(
  'Empowering Your Journey with Smart Solutions'
);
const heroImage = ref(new URL('/assets/img/left-side-pic.png', import.meta.url).href);
const logoImage = ref(new URL('/assets/img/car-logo.png', import.meta.url).href);
const successMessage = ref(null);
const errorMessage = ref(null);

onMounted(() => {

  successMessage.value = sessionStorage.getItem("success");
  errorMessage.value = sessionStorage.getItem("error");

  // Check if successMessage exists and is not empty/null
  if (successMessage.value && successMessage.value !== "null" && successMessage.value.trim() !== "") {
    toast.success(successMessage.value, {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
  }

  // Check if errorMessage exists and is not empty/null
  if (errorMessage.value && errorMessage.value !== "null" && errorMessage.value.trim() !== "") {
    toast.error(errorMessage.value, {
      position: "top-right",
      autoClose: 3000,
      theme: "colored"
    });
  }

  sessionStorage.removeItem("success");
  sessionStorage.removeItem("error");
});



const handleLogin = async () => {
  
  if (!form.email || !form.password) {
    toast.error("Please enter a valid username and password!", { position: "top-right", autoClose: 3000 });
    return;
  }

  try {
    const response = await axios.post(`${config.API_BASE_URL}/appuser/login`, {
      email: form.email,
      password: form.password,
    });

    localStorage.setItem("authToken", response.data.access_token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("verification_status", JSON.stringify(response.data.verification_status));
    localStorage.setItem("justLoggedIn", "true"); 

    toast.success("Login successful!", { position: "top-right", autoClose: 3000 });

    setTimeout(() => {
      router.push("/user-dashboard");
    }, 2000);
    
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed. Please try again.", {
      position: "top-right",
      autoClose: 3000,
    });
  } finally {
    loading.value = false;
  }
};

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
                <form @submit.prevent="handleLogin">
                  <div class="mb-3">
                    <label for="email" class="form-label">Email / Username</label>
                    <input type="email" id="email" class="form-control" v-model="form.email" placeholder="Enter your email" required/>
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" id="password" class="form-control"  v-model="form.password" placeholder="Enter your password" required/>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <a href="#" class="text-decoration-none">Forgot Password?</a>
                  </div>
                  <button :disabled="loading" class="btn btn-primary w-100 mt-4">
                    {{ loading ? "Logging in..." : "Login" }}
                  </button>
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
  

