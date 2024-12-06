import { createRouter , createWebHashHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import FindRideView from "@/views/FindRideView.vue";

const router = createRouter({
    history:createWebHashHistory(import.meta.env.BASE_URL),
    routes:[
        { path:'/', name:'home', component:HomeView},
        { path:'/find-ride', name:'findride', component:FindRideView},
    ],
});

export default router;