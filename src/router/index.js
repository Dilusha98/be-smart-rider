import { createRouter , createWebHistory  } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import FindRideView from "@/views/FindRideView.vue";
import UserRegister from "@/views/UserRegister.vue";

const router = createRouter({
    history:createWebHistory (import.meta.env.BASE_URL),
    routes:[
        { path:'/', name:'home', component:HomeView},
        { path:'/find-ride', name:'findride', component:FindRideView},
        { path:'/user-register', name:'findride', component:UserRegister},
    ],
});

export default router;