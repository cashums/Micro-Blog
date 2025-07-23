import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import UserProfileView from "../views/UserProfileView.vue";
import LoginView from "../views/LoginView.vue";
import TimelineView from "../views/TimelineView.vue";
import ArchiveWizardView from "../views/ArchiveWizardView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView
    },
    {
      path: "/timeline",
      name: "timeline",
      component: TimelineView
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
      path: "/archiveWizard",
      name: "archiveWizard",
      component: ArchiveWizardView
    }
  ]
});

export default router;
