import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Importieren Sie Ihren Auth Store

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage.vue')
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/control',
      name: 'control',
      component: () => import('@/views/ControlPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/parameters',
      name: 'parameters',
      component: () => import('@/views/ParametersPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/faults',
      name: 'faults',
      component: () => import('@/views/FaultListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/timeprog',
      name: 'timeprog',
      component: () => import('@/views/TimeProgramPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/timeprog/:id',
      name: 'timeprogDetail',
      component: () => import('@/views/TimeProgramDetailPage.vue'),
      meta: { requiresAuth: true }
    },
    // Optional: API Tester Page
    {
      path: '/api-tester',
      name: 'apiTester',
      component: () => import('@/views/ApiTesterPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true } // Für Admin-Zugriff
    },
    // Catch-all für 404 (optional)
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: () => import('@/views/NotFoundPage.vue')
    }
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'login' }); // Weiterleiten zur Login-Seite
  } else if (to.name === 'login' && authStore.isLoggedIn) {
    next({ name: 'dashboard' }); // Wenn schon eingeloggt, nicht zur Login-Seite
  } else {
    next();
  }
});

export default router;
