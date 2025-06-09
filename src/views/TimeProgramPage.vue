<template>
  <div class="time-program-page">
    <div class="page-header">
      <h1>Time Programs</h1>
      <p class="page-description">Manage heating and cooling time programs</p>
    </div>

    <div v-if="loading" class="loading-container">
      <Spinner />
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h3>Error Loading Time Programs</h3>
        <p>{{ error }}</p>
        <button @click="loadTimePrograms" class="btn btn-primary">Retry</button>
      </div>
    </div>

    <div v-else class="time-programs-grid">
      <div 
        v-for="program in timePrograms" 
        :key="program.index"
        class="time-program-card"
        @click="viewProgram(program.index)"
      >
        <div class="program-header">
          <h3>{{ program.name || `Program ${program.index}` }}</h3>
          <span class="program-id">Index: {{ program.index }}</span>
        </div>
        
        <div class="program-details">
          <div class="detail-item">
            <span class="label">Days active:</span>
            <span class="value">{{ program.ead }}</span>
          </div>
          <div class="detail-item">
            <span class="label">System Type:</span>
            <span class="value">{{ getSystemType(program.nos) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Step time:</span>
            <span class="value">{{ program.ste }} min</span>
          </div>
          <div class="detail-item">
            <span class="label">Total days:</span>
            <span class="value">{{ program.nod }}</span>
          </div>
        </div>

        <div class="program-actions">
          <button 
            @click.stop="viewProgram(program.index)" 
            class="btn btn-primary btn-sm"
          >
            View/Edit
          </button>
        </div>
      </div>
    </div>

    <div v-if="!loading && !error && timePrograms.length === 0" class="empty-state">
      <h3>No Time Programs Found</h3>
      <p>No time programs are currently configured.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTimePrograms } from '@/api/htrest'
import Spinner from '@/components/shared/Spinner.vue'

const router = useRouter()
const timePrograms = ref([])
const loading = ref(true)
const error = ref('')

const loadTimePrograms = async () => {
  try {
    loading.value = true
    error.value = ''
    console.log('Attempting to load time programs...')
    const response = await getTimePrograms()
    console.log('Time programs response:', response)
    timePrograms.value = response.data
  } catch (err) {
    console.error('Error loading time programs:', err)
    console.error('Error details:', {
      message: err.message,
      response: err.response,
      request: err.request,
      config: err.config
    })
    
    let errorMessage = 'Failed to load time programs'
    if (err.response) {
      errorMessage += ` (Status: ${err.response.status})`
      if (err.response.data) {
        errorMessage += ` - ${JSON.stringify(err.response.data)}`
      }
    } else if (err.request) {
      errorMessage += ' - No response from server (Network or CORS issue?)'
    } else {
      errorMessage += ` - ${err.message}`
    }
    
    error.value = errorMessage
  } finally {
    loading.value = false
  }
}

const viewProgram = (id) => {
  router.push(`/timeprog/${id}`)
}

const getSystemType = (nos) => {
  switch (nos) {
    case 2: return '2-State (ON/OFF)'
    case 3: return '3-State (Normal/Absenk/Komfort)'
    default: return `${nos}-State`
  }
}

onMounted(() => {
  loadTimePrograms()
})
</script>

<style scoped>
.time-program-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: var(--text-muted);
  margin: 0;
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error-message {
  text-align: center;
  background: var(--surface-color);
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.error-message h3 {
  color: var(--danger-color);
  margin: 0 0 1rem 0;
}

.time-programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.time-program-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.time-program-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.program-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.1rem;
}

.program-id {
  font-size: 0.85rem;
  color: var(--text-muted);
  background: var(--bg-color);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.program-details {
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.label {
  color: var(--text-muted);
  font-weight: 500;
}

.value {
  color: var(--text-color);
}

.value.active {
  color: var(--success-color);
  font-weight: 600;
}

.value.three-state {
  color: #fbbf24;
  font-weight: 600;
}

.program-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: var(--surface-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.empty-state p {
  margin: 0;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .time-program-page {
    padding: 1rem;
  }
  
  .time-programs-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .program-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>