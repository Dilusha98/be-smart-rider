<script setup>
import { ref } from 'vue';

const vehicleCategories = ref(['Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle']);
const selectedCategory = ref('');
const vehicleModel = ref('');
const vehicleNumber = ref('');
const images = ref([]);

const heroImage = ref(new URL('/assets/img/bcgrnd.png', import.meta.url).href);

const handleImageUpload = (event) => {
    const files = event.target.files;
    if (files.length + images.value.length > 10) {
        alert('You can upload a maximum of 10 images.');
        return;
    }
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
            images.value.push(e.target.result);
        };
        reader.readAsDataURL(file);
    }
};

const removeImage = (index) => {
    images.value.splice(index, 1);
};

const handleSubmit = () => {
    const vehicleData = {
        category: selectedCategory.value,
        model: vehicleModel.value,
        number: vehicleNumber.value,
        images: images.value,
    };
    console.log('Vehicle Registered:', vehicleData);
    alert('Vehicle Registered Successfully!');
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
            <label for="model">Vehicle Model</label>
            <input type="text" id="model" v-model="vehicleModel" class="form-control" placeholder="Enter vehicle model" />
        </div>

        <div class="form-group">
            <label for="number">Vehicle Number</label>
            <input type="text" id="number" v-model="vehicleNumber" class="form-control" placeholder="Enter vehicle number" />
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
