<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import axios from 'axios';
import config from '@/config';
import { computed } from 'vue';

const token = localStorage.getItem("authToken");
console.log(token);

const user = JSON.parse(localStorage.getItem("user"));
const userType = user?.user_type;

const files = ref({});
const previews = ref({});
const existingFiles = ref({});
const statuses = ref({});

const displayFields = {
  id_front: "NIC Front",
  id_back: "NIC Back",
  license_front: "License Front",
  license_back: "License Back",
  student_id: "Student ID",
  work_id: "Work ID",
  selfie: "Selfie"
};

const showField = (key) => {
    console.log(key);
  if (key === 'student_id' && userType !== 'student') return false;
  if (key === 'work_id' && userType !== 'professional') return false;
  return true;
};

const isSubmitDisabled = computed(() => {
  const visibleKeys = Object.keys(displayFields).filter(showField);

  return visibleKeys.every(key => {
    const status = getStatus(key);
    return status === 'Approved' || status === 'Pending';
  });
});

const handleFileUpload = (event, type) => {
  const file = event.target.files[0];
  if (file) {
    files.value[type] = file;
    previews.value[type] = URL.createObjectURL(file);
  }
};

const previewOrExisting = (type) => {
  return previews.value[type] || existingFiles.value[type] || '';
};

const getStatus = (type) => {
  return statuses.value[type] || '';
};

const isUploadDisabled = (type) => {
  const status = getStatus(type);
  return status === 'Approved' || status === 'Pending';
};

const fetchExistingDocuments = async () => {
  try {
    const res = await axios.get(`${config.API_BASE_URL}/user-verification`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = res.data?.documents || [];
    data.forEach(doc => {
      existingFiles.value[doc.type] = `${config.API_image_URL}/storage/user_verifications/${doc.file_name}`;
      statuses.value[doc.type] = doc.status_text;
    });
  } catch (err) {
    console.error("Failed to load verification details.", err);
  }
};

onMounted(() => {
  fetchExistingDocuments();
});

const submitVerification = async () => {
  const isImageFile = (file) => file && file.type.startsWith('image/');
  const formData = new FormData();

  Object.entries(files.value).forEach(([type, file]) => {
    if (file && isImageFile(file)) {
      formData.append(type, file);
    } else if (file) {
      toast.error(`${displayFields[type]} must be an image.`);
      return;
    }
  });

  try {
    await axios.post(`${config.API_BASE_URL}/verify-user`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });
    toast.success("Verification submitted successfully!");
    fetchExistingDocuments();
  } catch (err) {
    toast.error(err.response?.data?.message || "Verification failed.");
  }
};
</script>

<template>
    <div class="verify-container">
      <h2>User Verification</h2>
      <p class="desc">Upload your NIC, Driving License, and a selfie for secure verification.</p>
  
      <!-- Loop over fields safely -->
      <template v-for="(label, key) in displayFields" :key="key">
        <div v-if="showField(key)" class="form-group">
          <div class="label-row">
            <label :for="key">{{ label }}</label>
            <span v-if="getStatus(key) === 'Approved'" class="status-label success">✔</span>
            <span v-else-if="getStatus(key) === 'Pending'" class="status-label pending">⏳ Pending</span>
            <span v-else-if="getStatus(key) === 'Rejected'" class="status-label rejected">❌ Rejected - Resubmit</span>
          </div>
  
          <div class="image-upload">
            <input
              type="file"
              accept="image/*"
              :id="key"
              :capture="key === 'selfie' ? 'user' : undefined"
              @change="(e) => handleFileUpload(e, key)"
              :disabled="isUploadDisabled(key)"
            />
            <div class="preview-box" :class="{ empty: !previewOrExisting(key) }">
              <img v-if="previewOrExisting(key)" :src="previewOrExisting(key)" :alt="label" />
              <span v-else>Preview</span>
            </div>
          </div>
        </div>
      </template>
  
      <button class="submit-btn" @click="submitVerification" :disabled="isSubmitDisabled"> Submit for Verification </button>

    </div>
  </template>
  
  
  <style scoped>
.verify-container {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.desc {
  font-size: 14px;
  margin-bottom: 20px;
  color: #555;
}

.form-group {
  margin-bottom: 20px;
}

.image-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-box {
  width: 100%;
  height: 160px;
  border: 1px dashed #ccc;
  border-radius: 6px;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 14px;
  color: #999;
}

.preview-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-box.empty {
  background-color: #f1f1f1;
}

.submit-btn {
  width: 100%;
  padding: 10px;
  background: #012970;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 6px;
}


.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.status-label {
  font-size: 0.85rem;
  font-weight: 600;
}

.status-label.success {
  color: green;
}

.status-label.pending {
  color: orange;
}

.status-label.rejected {
  color: red;
}
</style>

  
  