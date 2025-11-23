import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { AUTH_CONFIG } from '../config/api'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  // New Dashboards Routes
  {
    path: '/dashboard/technicien',
    name: 'TechnicienDashboard',
    component: () => import('../views/TechnicienDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/pannes',
    name: 'AdminPannesDashboard',
    component: () => import('../views/AdminPannesDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/ecole',
    name: 'EcoleDashboard',
    component: () => import('../views/EcoleDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-school',
    name: 'MySchool',
    component: () => import('../views/MySchoolView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rapports',
    name: 'RapportsList',
    component: () => import('../views/RapportsListPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/auth/otp',
    name: 'OTP',
    component: () => import('../views/OTPView.vue'),
    meta: { guest: true }
  },
  {
    path: '/schools',
    name: 'Schools',
    component: () => import('../views/SchoolsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/schools/:id',
    name: 'SchoolDetail',
    component: () => import('../views/SchoolDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout/:ecoleId/:abonnementId',
    name: 'Checkout',
    component: () => import('../views/CheckoutView.vue'),
    meta: { requiresAuth: false } // Public pour scan QR code
  },
  {
    path: '/paiement/callback',
    name: 'PaymentCallback',
    component: () => import('../views/PaymentCallbackView.vue'),
    meta: { requiresAuth: false } // Public pour retour de paiement
  },
  {
    path: '/sirens',
    name: 'Sirens',
    component: () => import('../views/SirensView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/programmations',
    name: 'Programmations',
    component: () => import('../views/ProgrammationsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/breakdowns',
    name: 'Breakdowns',
    component: () => import('../views/BreakdownsView.vue'),
    meta: { requiresAuth: true }
  },
  // New Pannes Routes (with composables)
  {
    path: '/pannes',
    name: 'PannesList',
    component: () => import('../views/PannesListPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pannes/:id',
    name: 'PanneDetail',
    component: () => import('../views/PanneDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  // New Interventions Routes (with composables)
  {
    path: '/interventions',
    name: 'InterventionsList',
    component: () => import('../views/InterventionsListPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/interventions/:interventionId/rapport',
    name: 'RapportForm',
    component: () => import('../views/RapportFormPage.vue'),
    meta: { requiresAuth: true }
  },
  // New Ordres de Mission Routes (with composables)
  {
    path: '/ordres-mission',
    name: 'OrdresMissionList',
    component: () => import('../views/OrdreMissionListPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ordres-mission/:id',
    name: 'OrdreMissionDetail',
    component: () => import('../views/OrdreMissionDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/technicians',
    name: 'Technicians',
    component: () => import('../views/TechniciansView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/technicians/:id',
    name: 'TechnicianDetail',
    component: () => import('../views/TechnicianDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/subscriptions',
    name: 'Subscriptions',
    component: () => import('../views/SubscriptionsView.vue'),
    meta: { requiresAuth: true }
  },
  // New Abonnements Routes (with composables)
  {
    path: '/abonnements',
    name: 'AbonnementsList',
    component: () => import('../views/AbonnementsListPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/abonnements/nouveau',
    name: 'AbonnementNew',
    component: () => import('../views/AbonnementFormPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/abonnements/:id',
    name: 'AbonnementDetail',
    component: () => import('../views/AbonnementDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/CalendarView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/countries',
    name: 'Countries',
    component: () => import('../views/CountriesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/UsersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/roles',
    name: 'Roles',
    component: () => import('../views/RolesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/siren-models',
    name: 'SirenModels',
    component: () => import('../views/SirenModelsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/work-orders',
    name: 'WorkOrders',
    component: () => import('../views/WorkOrdersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/work-orders/:id',
    name: 'WorkOrderDetail',
    component: () => import('../views/WorkOrderDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/ReportsView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem(AUTH_CONFIG.tokenKey)
  const isAuthenticated = !!token

  console.log('Navigation Guard:', {
    to: to.path,
    from: from.path,
    hasToken: !!token,
    requiresAuth: to.meta.requiresAuth,
    isGuest: to.meta.guest
  })

  // If route requires authentication and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Redirecting to login: no token and route requires auth')
    next('/login')
    return
  }

  // If route is for guests only and user is authenticated
  if (to.meta.guest && isAuthenticated) {
    console.log('Redirecting to dashboard: has token and route is for guests only')
    next('/dashboard')
    return
  }

  console.log('Navigation allowed')
  next()
})

export default router
