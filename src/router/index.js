import { createRouter , createWebHistory ,createWebHashHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import FindRideView from "@/views/FindRideView.vue";
import UserRegister from "@/views/UserRegister.vue";
import UserHome from "@/views/UserHome.vue";
import OfferRide from "@/views/OfferRide.vue";

const router = createRouter({
    history:createWebHashHistory (import.meta.env.BASE_URL),
    routes:[
        { path:'/', name:'home', component:HomeView},
        { path:'/find-ride', name:'findride', component:FindRideView},
        { path:'/user-register', name:'user_register', component:UserRegister},
        { path:'/user-dashboard', name:'user_dashboard', component:UserHome},
        { path:'/offer-ride', name:'offer_ride', component:OfferRide},
    ],
});

export default router;