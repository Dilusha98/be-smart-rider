<script setup>
import { ref } from 'vue';
import { toast } from "vue3-toastify";
import axios from 'axios';
import "vue3-toastify/dist/index.css";
import '@/assets/toast-styles.css';
import config from "@/config";

const vehicleCategories = ref(['Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle']);
const fuelTypes = ref(['Petrol', 'Diesel', 'Electric', 'Hybrid']);
const selectedCategory = ref('');
const year = ref('');
const brand = ref('');
const model = ref('');
const vehicleNumber = ref('');
const images = ref([]);
const vehicleBrand = ref('');
const vehicleModel = ref('');
const yearOfManufacture = ref('');
const fuelType = ref('');
const rawFiles = ref([]); 
const maxSeats = ref('');


const heroImage = ref(new URL('/assets/img/bcgrnd.png', import.meta.url).href);

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);
  if (files.length + rawFiles.value.length > 10) {
    alert('You can upload a maximum of 10 images.');
    return;
  }

  files.forEach(file => {
    rawFiles.value.push(file);
    const reader = new FileReader();
    reader.onload = (e) => images.value.push(e.target.result);
    reader.readAsDataURL(file);
  });
};

const removeImage = (index) => {
    images.value.splice(index, 1);
};

const handleSubmit = async () => {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));

    if(!selectedCategory.value) {
    toast.error("Please select a vehicle category.");
    return;
    }

    if (!vehicleBrand.value.trim()) {
    toast.error("Vehicle brand is required.");
    return;
    }

    if (!vehicleModel.value.trim()) {
    toast.error("Vehicle model is required.");
    return;
    }

    if (!vehicleNumber.value.trim()) {
    toast.error("Vehicle number is required.");
    return;
    }

    const yearPattern = /^\d{4}$/;
    const currentYear = new Date().getFullYear();

    if (
    !yearOfManufacture.value ||
    !yearPattern.test(yearOfManufacture.value) ||
    yearOfManufacture.value < 1900 ||
    yearOfManufacture.value > currentYear
    ) {
    toast.error(`Please enter a valid year between 1900 and ${currentYear}.`);
    return;
    }

    if (!fuelType.value) {
    toast.error("Please select a fuel type.");
    return;
    }

    if (rawFiles.value.length > 10) {
    toast.error("You can upload a maximum of 10 images.");
    return;
    }

    if (!maxSeats.value || isNaN(maxSeats.value) || maxSeats.value < 1) {
    toast.error("Please enter a valid number of seats.");
    return;
    }

    const platePattern = /^[A-Z]{2,3}-\d{3,4}$/i;
    if (!platePattern.test(vehicleNumber.value.trim())) {
    toast.error("Enter a valid plate number (e.g., CAB-6678).");
    return;
    }


  const formData = new FormData();
  formData.append("category", selectedCategory.value);
  formData.append("brand", vehicleBrand.value);
  formData.append("model", vehicleModel.value);
  formData.append("plate_number", vehicleNumber.value);
  formData.append("year", yearOfManufacture.value);
  formData.append("fuel_type", fuelType.value);
  formData.append("max_seats", maxSeats.value);

  // Attach images
  for (let i = 0; i < rawFiles.value.length; i++) {
    formData.append("images[]", rawFiles.value[i]);
  }

  try {
    await axios.post(`${config.API_BASE_URL}/register_vehicles`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });

    toast.success("Vehicle registered successfully!");
    // Reset fields...
  } catch (err) {
    console.error("Vehicle registration error:", err.response || err);
    toast.error(err.response?.data?.message || "Failed to register vehicle.");
  }
};


</script>

<template>
    <div class="container">
        <h2>Register Your Vehicle</h2>

        <div class="form-group">
            <label for="category">Vehicle Category</label>
            <select id="category" v-model="selectedCategory" class="form-control">
                <option value="" disabled>Select a category</option>
                <option v-for="category in vehicleCategories" :key="category" :value="category">{{ category }}</option>
            </select>
        </div>

        <div class="form-group">
            <label for="brand">Vehicle Brand</label>
            <input type="text" id="brand" v-model="vehicleBrand" class="form-control" placeholder="Enter vehicle brand" />
        </div>

        <div class="form-group">
            <label for="model">Vehicle Model</label>
            <input type="text" id="model" v-model="vehicleModel" class="form-control" placeholder="Enter vehicle model" />
        </div>

        <div class="form-group">
            <label for="number">Vehicle Number</label>
            <input type="text" id="number" v-model="vehicleNumber" class="form-control" placeholder="Enter vehicle number" />
        </div>

        <div class="form-group">
            <label for="fuel">Fuel Type</label>
            <select id="fuel" v-model="fuelType" class="form-control">
                <option value="" disabled>Select fuel type</option>
                <option v-for="type in fuelTypes" :key="type" :value="type">{{ type }}</option>
            </select>
        </div>

        <div class="form-group">
            <label for="year">Year of Manufacture</label>
            <input type="number" id="year" v-model="yearOfManufacture" class="form-control" placeholder="e.g. 2020" min="1900" max="2099" />
        </div>

        <div class="form-group">
            <label for="seats">Maximum Seats</label>
            <input type="number" id="seats" v-model="maxSeats" class="form-control" placeholder="Enter number of seats" min="1" />
        </div>

        <div class="form-group">
            <label>Upload Vehicle Images (Max: 10)</label>
            <input type="file" @change="handleImageUpload" multiple accept="image/*" class="form-control" />
            <div class="image-preview">
                <div v-for="(image, index) in images" :key="index" class="image-container">
                    <img :src="image" alt="Vehicle Image" class="preview-img" />
                    <button @click="removeImage(index)" class="remove-btn">&times;</button>
                </div>
            </div>
        </div>

        <button @click="handleSubmit" class="submit-btn">Register Vehicle</button>
    </div>
</template>

<style scoped>
.container {
    max-width: 400px;
    margin: 20px auto;
    padding: 15px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
    text-align: center;
    color: #333;
}

.form-group {
    margin-bottom: 15px;
}

label {
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
}

.form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
}

.image-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
}

.image-container {
    position: relative;
    width: 80px;
    height: 80px;
}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 5px;
    border: 1px solid #ccc;
}

.remove-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: red;
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    cursor: pointer;
}

.submit-btn {
    width: 100%;
    padding: 10px;
    background-color: #012970;
    color: white;
    border: none;
    font-size: 16px;
    cursor: pointer;
    margin-top: 15px;
}

.submit-btn:hover {
    background-color: #0056b3;
}
</style>
