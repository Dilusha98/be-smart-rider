import axios from 'axios';
import router from './router';
import { toast } from 'vue3-toastify';

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('verificationStatus');

      toast.error("Session expired. Please log in again.");
      router.push('/');
    }
    return Promise.reject(error);
  }
);
