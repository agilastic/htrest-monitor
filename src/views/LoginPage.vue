<template>
  <div class="login-page">
    <h2>Anmeldung zum HtREST Web UI</h2>
    <LoginForm />
    <p class="login-info">
      Bitte geben Sie Ihre Zugangsdaten ein, um das Wärmepumpensystem zu überwachen und zu steuern.
    </p>
  </div>
</template>

<script setup>
import LoginForm from '@/components/auth/LoginForm.vue';
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh; /* Mindesthöhe, um es in der Mitte zu zentrieren */
  padding: 20px;
  background-color: #f4f7f6; /* Heller Hintergrund für die Seite */
}

.login-page h2 {
  color: #333;
  margin-bottom: 25px;
  font-size: 1.8em;
  text-align: center;
}

.login-info {
  margin-top: 20px;
  font-size: 0.9em;
  color: #666;
  text-align: center;
  max-width: 800px;
}

/* Stil für LoginForm, da es in der Komponente definiert ist */
/* Es wäre gut, LoginForm.vue eigene Stile zu geben oder globalere Stile zu verwenden */
/* Beispiel: Styling für die Form im LoginForm.vue */
</style>
