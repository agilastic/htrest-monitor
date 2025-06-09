<template>
  <header class="nav-header">
    <div class="nav-container">
      <div class="header-left">
        <h1 class="nav-brand">HtREST Monitor</h1>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/" class="nav-link" :class="{ active: $route.name === 'dashboard' }">
          Dashboard
        </router-link>
        <router-link to="/control" class="nav-link" :class="{ active: $route.name === 'control' }">
          Control
        </router-link>
        <router-link to="/parameters" class="nav-link" :class="{ active: $route.name === 'parameters' }">
          Parameters
        </router-link>
        <router-link to="/faults" class="nav-link" :class="{ active: $route.name === 'faults' }">
          Faults
        </router-link>
        <router-link to="/timeprog" class="nav-link" :class="{ active: $route.name === 'timeprog' || $route.name === 'timeprogDetail' }">
          Time Programs
        </router-link>
        <router-link 
          v-if="authStore.user?.isAdmin" 
          to="/api-tester" 
          class="nav-link" 
          :class="{ active: $route.name === 'apiTester' }"
        >
          API Tester
        </router-link>
      </nav>

      <div class="nav-actions">
        <button @click="toggleTheme" class="theme-toggle" title="Toggle theme">
          <span v-if="isDark">🌙 Dark</span>
          <span v-else>☀️ Light</span>
        </button>
        
        <div class="user-menu">
          <span class="user-info">{{ authStore.user?.username || 'User' }}</span>
          <button @click="logout" class="btn btn-danger logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})
</script>

<style scoped>
.header-left {
  display: flex;
  align-items: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Mobile responsiveness for user menu */
@media (max-width: 768px) {
  .user-info {
    display: none;
  }
  
  .logout-btn {
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>