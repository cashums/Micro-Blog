import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import UserProfileView from "../views/UserProfileView.vue";
import LoginView from "../views/LoginView.vue";
import ArchiveView from "../views/ArchiveView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView
    },
    {
      path: "/users/:id",
      name: "user",
      component: UserProfileView
    },
    {
      path: "/login",
      name: "login",
      component: LoginView
    },
    {
      path: "/archives",
      name: "archives",
      component: ArchiveView
    }
  ]
});

export default router;
