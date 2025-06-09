<script setup>
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/shared/Header.vue'

const authStore = useAuthStore()
</script>

<template>
  <div id="app">
    <Header v-if="authStore.isLoggedIn" />
    <main class="main-content" :class="{ 'with-header': authStore.isLoggedIn }">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-color, #f5f5f5);
  color: var(--text-color, #333);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}

.main-content.with-header {
  margin-top: 0;
  width: 100%;
  max-width: 100%;
}

/* CSS Variables for theming */
:root {
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --bg-color: #f9fafb;
  --surface-color: #ffffff;
  --text-color: #111827;
  --text-muted: #6b7280;
  --border-color: #e5e7eb;
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

/* Dark theme */
[data-theme="dark"] {
  --bg-color: #111827;
  --surface-color: #1f2937;
  --text-color: #f9fafb;
  --text-muted: #9ca3af;
  --border-color: #374151;
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
}

.card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-ok {
  background: #dcfce7;
  color: #166534;
}

.status-warning {
  background: #fef3c7;
  color: #92400e;
}

.status-error {
  background: #fee2e2;
  color: #991b1b;
}

[data-theme="dark"] .status-ok {
  background: #064e3b;
  color: #a7f3d0;
}

[data-theme="dark"] .status-warning {
  background: #451a03;
  color: #fde68a;
}

[data-theme="dark"] .status-error {
  background: #7f1d1d;
  color: #fecaca;
}
</style>
