<template>
  <div class="fault-list-page">
    <div class="page-header">
      <h1>Fault List</h1>
      <button @click="refreshFaultList" class="btn btn-primary" :disabled="loading">
        <span v-if="loading">Loading...</span>
        <span v-else>Refresh</span>
      </button>
    </div>

    <div v-if="loading && !faults.length" class="loading-container">
      <Spinner />
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h3>Error loading fault list</h3>
        <p>{{ error }}</p>
        <button @click="refreshFaultList" class="btn btn-primary">
          Try Again
        </button>
      </div>
    </div>

    <div v-else-if="!faults.length" class="empty-state">
      <h3>No faults found</h3>
      <p>The system is currently fault-free.</p>
    </div>

    <div v-else class="fault-list">
      <div class="fault-item" v-for="fault in sortedFaults" :key="fault.index" :class="{ 'no-fault': isNoFault(fault) }">
        <div class="fault-header">
          <span class="fault-code" :class="getErrorCodeClass(fault.error)">ID: {{ fault.error }}</span>
          <span class="fault-timestamp">{{ formatTimestamp(fault.datetime) }}</span>
        </div>
        <div class="fault-description">
          {{ fault.message }}
        </div>
        <div class="fault-meta">
          <span class="fault-index">Index: {{ fault.index }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getFaultList } from '@/api/htrest'
import Spinner from '@/components/shared/Spinner.vue'

const faults = ref([])
const loading = ref(false)
const error = ref(null)

const sortedFaults = computed(() => {
  return [...faults.value].sort((a, b) => {
    const dateA = new Date(a.datetime || 0)
    const dateB = new Date(b.datetime || 0)
    return dateB - dateA // DESC order (newest first)
  })
})

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown'
  
  try {
    const date = new Date(timestamp)
    return date.toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return timestamp
  }
}

const isNoFault = (fault) => {
  return fault.error === 65534 || fault.message === 'Keine Stoerung'
}

const getErrorCodeClass = (errorCode) => {
  if (errorCode === 65534) return 'error-no-fault'
  if (errorCode === 31) return 'error-expansion-valve'
  return 'error-unknown'
}

const refreshFaultList = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await getFaultList()
    faults.value = response.data || []
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load fault list'
    console.error('Error fetching fault list:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshFaultList()
})
</script>

<style scoped>
.fault-list-page {
  padding: 1rem;
  width: 100%;
  max-width: none;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: var(--text-color);
}

.loading-container,
.error-container,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error-message {
  text-align: center;
  padding: 2rem;
  background: var(--surface-color);
  border-radius: 8px;
  border: 1px solid var(--error-color);
}

.error-message h3 {
  color: var(--error-color);
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
}

.fault-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fault-item {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.fault-item:hover {
  box-shadow: var(--shadow);
}

.fault-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.fault-code {
  font-family: monospace;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  min-width: 80px;
  text-align: center;
}

.error-no-fault {
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
}

.error-expansion-valve {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.error-unknown {
  color: var(--primary-color);
  background: rgba(37, 99, 235, 0.1);
}

.fault-timestamp {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.fault-description {
  color: var(--text-color);
  margin-bottom: 0.75rem;
  font-weight: bold;
  font-size: larger;
}

.fault-meta {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.fault-index {
  color: var(--text-muted);
  font-size: 0.8rem;
  font-family: monospace;
}

.no-fault {
  opacity: 0.7;
  border-color: rgba(5, 150, 105, 0.3);
}

.no-fault .fault-description {
  color: var(--text-muted);
  font-style: italic;
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

/* Mobile responsiveness */
@media (max-width: 768px) {
  .fault-list-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .fault-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .fault-timestamp {
    font-size: 0.8rem;
  }
}
</style>