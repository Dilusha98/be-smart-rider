import { createRouter , createWebHistory ,createWebHashHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import FindRideView from "@/views/FindRideView.vue";
import UserRegister from "@/views/UserRegister.vue";
import UserHome from "@/views/UserHome.vue";
import OfferRide from "@/views/OfferRide.vue";
import RegisterVehicle from "@/views/RegisterVehicle.vue";
import MyRides from "@/views/MyRides.vue";
import userVerification from '@/views/userVerification.vue';
import rideOffers from '@/views/rideOffers.vue';
import PassengerUpcomingView from '@/views/PassengerUpcomingView.vue';
import PassengerCompletedView from '@/views/PassengerCompletedView.vue';
import DriverUpcomingView from '@/views/DriverUpcomingView.vue';
import DriverCompletedView from '@/views/DriverCompletedView.vue';
import DriverOngoingRideView from '@/views/DriverOngoingRide.vue';

import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import "@/assets/toast-styles.css";

const router = createRouter({
    history:createWebHashHistory (import.meta.env.BASE_URL),
    routes:[
        { path:'/', name:'home', component:HomeView},
        { path:'/user-register', name:'user_register', component:UserRegister },
        { path:'/find-ride', name:'findride', component:FindRideView , meta: { requiresAuth: true }},
        { path:'/user-dashboard', name:'user_dashboard', component:UserHome , meta: { requiresAuth: true }},
        { path:'/offer-ride', name:'offer_ride', component:OfferRide , meta: { requiresAuth: true }},
        { path:'/register-vehicle', name:'register_ride', component:RegisterVehicle , meta: { requiresAuth: true }},
        { path:'/my-rides', name:'my_rides', component:MyRides , meta: { requiresAuth: true }},
        { path:'/user-verification', name:'user_verification', component:userVerification , meta: { requiresAuth: true }},
        { path:'/ride-offers', name:'ride_offers', component:rideOffers , meta: { requiresAuth: true }},
        { path: '/ride/passenger/upcoming/:id', name: 'PassengerUpcomingRide',component:PassengerUpcomingView , meta: { requiresAuth: true }},
        { path: '/ride/passenger/completed/:id', name: 'PassengerCompletedRide',component:PassengerCompletedView , meta: { requiresAuth: true }},
        { path: '/ride/driver/upcoming/:id', name: 'DriverUpcomingRide',component:DriverUpcomingView , meta: { requiresAuth: true }},
        { path: '/ride/driver/completed/:id', name: 'DriverCompletedRide',component:DriverCompletedView , meta: { requiresAuth: true }},
        { path: '/ride/driver/ongoing/:id', name: 'DriverOngoingRide', component: DriverOngoingRideView, meta: { requiresAuth: true } },
    ],
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  const verification = JSON.parse(localStorage.getItem("verification_status") || '{}');

  const openRoutes = ['/', '/user-register', '/user-verification'];

  if (to.meta.requiresAuth && !isAuthenticated) {
    toast.error("You must be logged in to access this page!");
    return next('/');
  }

  if (isAuthenticated && !openRoutes.includes(to.path)) {
    const userType = user?.user_type;

    const requiredDocs = ['id_front', 'id_back', 'selfie'];
    if (userType === 'student') {
      requiredDocs.push('student_id');
    } else if (userType === 'professional') {
      requiredDocs.push('work_id');
    }

    const allVerified = requiredDocs.every(type => verification[type] === 1); 

    if (!allVerified && to.path !== '/user-verification') {
      toast.error("You must complete user verification to access this feature.");
      return next('/user-verification');
    }

    // 🔒 ADDITION: specific check for offer-ride
    if (to.path === '/offer-ride') {
      const hasLicense = verification['license_front'] === 1 && verification['license_back'] === 1;
      if (!hasLicense) {
        toast.error("You must have an approved driving license to offer a ride.");
        return next('/user-verification');
      }
    }
  }

  next();
});



export default router;