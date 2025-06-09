<template>
  <form @submit.prevent="handleLogin">
    <div>
      <label for="username">Benutzername:</label>
      <input type="text" id="username" v-model="username" required />
    </div>
    <div>
      <label for="password">Passwort:</label>
      <input type="password" id="password" v-model="password" required />
    </div>
    <button type="submit" :disabled="isLoading">Login</button>
    <p v-if="error" class="error-message">{{ error }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const username = ref('');
const password = ref('');
const error = ref(null);
const isLoading = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await authStore.login(username.value, password.value);
    router.push('/'); // Weiterleitung zur Startseite nach erfolgreichem Login
  } catch (err) {
    error.value = 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>
