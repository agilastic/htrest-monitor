<template>
  <div class="not-found-page">
    <h1>404 - Seite nicht gefunden</h1>
    <p>Entschuldigung, die von Ihnen gesuchte Seite existiert nicht.</p>
    <router-link to="/">Zurück zum Dashboard</router-link>
  </div>
</template>

<script setup>
// Keine spezifische Logik für diese einfache Komponente erforderlich
</script>

<style scoped>
.not-found-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh; /* Mindesthöhe, um es in der Mitte zu zentrieren */
  text-align: center;
  padding: 20px;
  background-color: #f8f8f8;
  color: #333;
}

.not-found-page h1 {
  font-size: 3em;
  color: #e74c3c; /* Rote Farbe für Fehler */
  margin-bottom: 20px;
}

.not-found-page p {
  font-size: 1.2em;
  margin-bottom: 30px;
}

.not-found-page a {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.not-found-page a:hover {
  background-color: #0056b3;
}
</style>
