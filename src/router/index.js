import { createRouter , createWebHistory ,createWebHashHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import FindRideView from "@/views/FindRideView.vue";
import UserRegister from "@/views/UserRegister.vue";
import UserHome from "@/views/UserHome.vue";
import OfferRide from "@/views/OfferRide.vue";
import RegisterVehicle from "@/views/RegisterVehicle.vue";
import MyRides from "@/views/MyRides.vue";

const router = createRouter({
    history:createWebHashHistory (import.meta.env.BASE_URL),
    routes:[
        { path:'/', name:'home', component:HomeView},
        { path:'/find-ride', name:'findride', component:FindRideView},
        { path:'/user-register', name:'user_register', component:UserRegister},
        { path:'/user-dashboard', name:'user_dashboard', component:UserHome},
        { path:'/offer-ride', name:'offer_ride', component:OfferRide},
        { path:'/register-vehicle', name:'register_ride', component:RegisterVehicle},
        { path:'/my-rides', name:'my_rides', component:MyRides},
    ],
});

export default router;