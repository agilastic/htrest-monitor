<template>
  <div class="parameters-page">
    <div class="page-header">
      <h1>Parameter Viewer</h1>
      <button @click="refreshParameters" class="btn btn-primary" :disabled="loading">
        <span v-if="loading">Loading...</span>
        <span v-else>Refresh</span>
      </button>
    </div>

    <div v-if="loading && !parameters" class="loading-container">
      <Spinner message="Lade Parameter..." />
    </div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="parameters && Object.keys(parameters).length > 0">
      <div class="parameter-grid">
        <div v-for="(value, key) in parameters" :key="key" class="parameter-item">
          <p><strong>{{ key }}:</strong> <span>{{ value }}</span></p>
          <!-- Optional: Tooltips -->
          <!-- <span class="tooltip-icon" title="Erläuterung für diesen Parameter">ⓘ</span> -->
        </div>
      </div>
    </div>
    <div v-else>
      <p>Keine Parameter gefunden.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getParameters } from '@/api/htrest';
import Spinner from '@/components/shared/Spinner.vue';

const parameters = ref(null);
const loading = ref(false);
const error = ref(null);

const refreshParameters = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await getParameters();
    parameters.value = response.data;
  } catch (err) {
    error.value = 'Fehler beim Laden der Parameter.';
    console.error('Error fetching parameters:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  refreshParameters();
});
</script>

<style scoped>
.parameters-page {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.page-header h1 {
  margin: 0;
}
.parameter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
  margin-top: 20px;
}
.parameter-item {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.parameter-item p {
  margin: 0;
  font-size: 1em;
}
.parameter-item span {
  font-weight: normal;
  color: #555;
  text-align: right;
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
.btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}
.btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error-message {
  color: red;
  font-weight: bold;
  margin-top: 20px;
}
</style>
