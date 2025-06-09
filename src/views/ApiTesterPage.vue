<template>
  <div class="api-tester-page">
    <h1>Manueller API Tester</h1>
    <p class="description">
      Senden Sie manuelle API-Anfragen an den HtREST-Endpunkt. Vorsicht bei der Verwendung!
    </p>

    <div class="api-form">
      <div class="form-group">
        <label for="method">HTTP Methode:</label>
        <select id="method" v-model="method">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div class="form-group">
        <label for="endpoint">Endpunkt (relativ zur Basis-URL, z.B. /fastquery oder /param/targetTemperature):</label>
        <input type="text" id="endpoint" v-model="endpoint" placeholder="/api/v1/fastquery" />
      </div>

      <div class="form-group" v-if="['POST', 'PUT'].includes(method)">
        <label for="body">Request Body (JSON):</label>
        <textarea id="body" v-model="requestBody" rows="8" placeholder='{"value": 22.5}'></textarea>
        <p class="hint">Für POST/PUT Anfragen. Muss gültiges JSON sein.</p>
      </div>

      <button @click="sendApiRequest" :disabled="isLoading">
        {{ isLoading ? 'Sende...' : 'Anfrage senden' }}
      </button>
    </div>

    <div class="api-response-section">
      <h2>API Antwort</h2>
      <div v-if="isLoading" class="loading-container">
        <Spinner message="Sending request..." />
      </div>
      <div v-else-if="response" class="response-display">
        <h3>Status: <span :class="{'status-ok': response.status >= 200 && response.status < 300, 'status-error': response.status >= 400}">{{ response.status }} {{ response.statusText }}</span></h3>
        <h3>Daten:</h3>
        <pre :class="{'success': isSuccessResponse, 'error': !isSuccessResponse}">{{ JSON.stringify(response.data, null, 2) }}</pre>
      </div>
      <div v-else-if="error" class="error-message">
        <h3>Fehler:</h3>
        <pre>{{ error }}</pre>
      </div>
      <div v-else class="no-response">
        Noch keine Anfrage gesendet.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { htrestApi } from '@/api/htrest'; // Importieren Sie die konfigurierte Axios-Instanz
import Spinner from '@/components/shared/Spinner.vue';

const method = ref('GET');
const endpoint = ref('/fastquery');
const requestBody = ref(''); // String für JSON Input
const response = ref(null);
const error = ref(null);
const isLoading = ref(false);

const isSuccessResponse = computed(() => {
  return response.value && response.value.status >= 200 && response.value.status < 300;
});

const sendApiRequest = async () => {
  isLoading.value = true;
  response.value = null;
  error.value = null;

  let data = null;
  if (['POST', 'PUT'].includes(method.value)) {
    if (requestBody.value) {
      try {
        data = JSON.parse(requestBody.value);
      } catch (e) {
        error.value = 'Ungültiges JSON im Request Body: ' + e.message;
        isLoading.value = false;
        return;
      }
    }
  }

  try {
    let res;
    switch (method.value) {
      case 'GET':
        res = await htrestApi.get(endpoint.value);
        break;
      case 'POST':
        res = await htrestApi.post(endpoint.value, data);
        break;
      case 'PUT':
        res = await htrestApi.put(endpoint.value, data);
        break;
      case 'DELETE':
        res = await htrestApi.delete(endpoint.value);
        break;
      default:
        error.value = 'Unbekannte HTTP-Methode.';
        isLoading.value = false;
        return;
    }
    response.value = res;
  } catch (err) {
    if (err.response) {
      // Fehler vom Server
      error.value = `API Fehler: ${err.response.status} ${err.response.statusText}\n${JSON.stringify(err.response.data, null, 2)}`;
    } else if (err.request) {
      // Keine Antwort erhalten
      error.value = 'Keine Antwort vom Server erhalten. Möglicherweise ist die API nicht erreichbar oder ein Netzwerkproblem.';
    } else {
      // Anderer Fehler
      error.value = `Fehler bei der Anfrage: ${err.message}`;
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.api-tester-page {
  padding: 25px;
  max-width: 900px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 15px;
}

.description {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-style: italic;
}

.api-form {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input[type="text"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box; /* Ensures padding doesn't increase width */
}

.form-group select {
  height: 40px;
}

.form-group textarea {
  resize: vertical; /* Allow vertical resizing */
}

.hint {
  font-size: 0.85em;
  color: #888;
  margin-top: 5px;
}

button {
  background-color: #007bff;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  width: 100%;
  transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.api-response-section {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.api-response-section h2 {
  margin-top: 0;
  color: #333;
  margin-bottom: 15px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
  padding: 20px;
}

.no-response {
  text-align: center;
  color: #888;
  padding: 20px;
  font-style: italic;
}

.response-display pre {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto; /* For long lines */
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
  color: #333;
  max-height: 400px;
}

.response-display .success {
  border-color: #28a745; /* Green for success */
}

.response-display .error {
  border-color: #dc3545; /* Red for error */
}

.response-display h3 span {
  font-weight: normal;
}

.status-ok {
  color: #28a745;
}

.status-error {
  color: #dc3545;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 15px;
  border-radius: 5px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
}
</style>
