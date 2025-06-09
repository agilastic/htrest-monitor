<template>
  <div class="time-program-detail-page">
    <div class="page-header">
      <div class="header-left">
        <button @click="goBack" class="btn btn-secondary">
          ← Back to Time Programs
        </button>
        <h1>{{ program?.name || `Time Program ${programId}` }}</h1>
      </div>
      <div class="header-actions">
        <button 
          @click="toggleEditMode" 
          class="btn btn-secondary"
        >
          {{ isEditing ? 'Cancel' : 'Edit' }}
        </button>
        <button 
          v-if="isEditing"
          @click="saveProgram" 
          :disabled="saving || !hasChanges"
          class="btn btn-primary"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <Spinner />
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h3>Error Loading Time Program</h3>
        <p>{{ error }}</p>
        <button @click="loadProgram" class="btn btn-primary">Retry</button>
      </div>
    </div>

    <div v-else-if="program" class="program-content">
      <!-- Program Info -->
      <div class="program-info-card">
        <h2>Program Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Name</label>
            <div class="info-value">{{ program.name }}</div>
          </div>
          <div class="info-item">
            <label>Index</label>
            <div class="info-value">{{ program.index }}</div>
          </div>
          <div class="info-item">
            <label>Days active (ead)</label>
            <div class="info-value">{{ program.ead }}</div>
          </div>
          <div class="info-item">
            <label>Number of states (nos)</label>
            <div class="info-value">{{ program.nos }}</div>
          </div>
          <div class="info-item">
            <label>Step time (ste)</label>
            <div class="info-value">{{ program.ste }} minutes</div>
          </div>
          <div class="info-item">
            <label>Number of days (nod)</label>
            <div class="info-value">{{ program.nod }}</div>
          </div>
        </div>
      </div>

      <!-- Weekly Schedule -->
      <div class="schedule-card">
        <h2>Weekly Schedule</h2>
        <div class="days-container">
          <div 
            v-for="(dayEntries, dayIndex) in program.entries" 
            :key="dayIndex"
            class="day-schedule"
          >
            <h3 class="day-header">{{ getDayName(dayIndex) }}</h3>
            <div class="time-entries">
              <div 
                v-for="(entry, entryIndex) in dayEntries" 
                :key="entryIndex"
                class="time-entry"
                :class="[
                  getStateClass(entry.state, program.nos),
                  { editing: isEditing }
                ]"
              >
                <div v-if="!isEditing" class="time-range">
                  {{ entry.start }} - {{ entry.end }}
                </div>
                <div v-else class="time-edit-controls">
                  <div class="time-inputs">
                    <input 
                      v-model="entry.start" 
                      @input="formatTimeInput($event, 'start', dayIndex, entryIndex)"
                      @blur="validateTime($event, 'start', dayIndex, entryIndex)"
                      type="text" 
                      pattern="^([01]\d|2[0-4]):([0-5]\d)$"
                      placeholder="HH:MM"
                      class="form-input time-input"
                      maxlength="5"
                    />
                    <span class="time-separator">-</span>
                    <input 
                      v-model="entry.end" 
                      @input="formatTimeInput($event, 'end', dayIndex, entryIndex)"
                      @blur="validateTime($event, 'end', dayIndex, entryIndex)"
                      type="text" 
                      pattern="^([01]\d|2[0-4]):([0-5]\d)$"
                      placeholder="HH:MM"
                      class="form-input time-input"
                      maxlength="5"
                    />
                  </div>
                  <div class="entry-actions">
                    <button 
                      @click="addEntry(dayIndex, entryIndex + 1)"
                      class="btn btn-success btn-xs"
                      title="Add entry after this one"
                    >
                      +
                    </button>
                    <button 
                      v-if="dayEntries.length > 1"
                      @click="removeEntry(dayIndex, entryIndex)"
                      class="btn btn-danger btn-xs"
                      title="Remove this entry"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div class="state-controls">
                  <div v-if="!isEditing" class="state-indicator">
                    {{ getStateLabel(entry.state, program.nos) }}
                  </div>
                  <div v-else class="state-selection">
                    <select 
                      v-if="program.nos === 3"
                      v-model="entry.state" 
                      @change="markChanged"
                      class="form-select state-select"
                    >
                      <option :value="0">Normal</option>
                      <option :value="1">Absenk</option>
                      <option :value="2">Komfort</option>
                    </select>
                    <label v-else class="toggle-switch">
                      <input 
                        type="checkbox" 
                        :checked="entry.state === 1"
                        @change="toggleState(dayIndex, entryIndex)"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-label">{{ getStateLabel(entry.state, program.nos) }}</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div v-if="isEditing" class="add-entry-section">
                <button 
                  @click="addEntry(dayIndex)"
                  class="btn btn-outline btn-sm"
                >
                  + Add Time Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Success Message -->
      <div v-if="saveSuccess" class="success-message">
        Time program saved successfully!
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getTimeProgram, updateTimeProgram } from '@/api/htrest'
import Spinner from '@/components/shared/Spinner.vue'

const router = useRouter()
const route = useRoute()

const programId = computed(() => route.params.id)
const program = ref(null)
const originalProgram = ref(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const saveSuccess = ref(false)
const isEditing = ref(false)
const hasChanges = ref(false)

const dayNames = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
  'Friday', 'Saturday', 'Sunday'
]

const getDayName = (index) => {
  return dayNames[index] || `Day ${index + 1}`
}

const getStateLabel = (state, nos) => {
  if (nos === 3) {
    switch (state) {
      case 0: return 'Normal'
      case 1: return 'Absenk'
      case 2: return 'Komfort'
      default: return `State ${state}`
    }
  } else {
    return state === 1 ? 'ON' : 'OFF'
  }
}

const getStateClass = (state, nos) => {
  if (nos === 3) {
    switch (state) {
      case 0: return 'state-normal'
      case 1: return 'state-absenk'
      case 2: return 'state-komfort'
      default: return 'state-unknown'
    }
  } else {
    return state === 1 ? 'state-active' : 'state-inactive'
  }
}

const loadProgram = async () => {
  try {
    loading.value = true
    error.value = ''
    console.log('Loading time program:', programId.value)
    const response = await getTimeProgram(programId.value)
    console.log('Time program response:', response)
    program.value = response.data
    originalProgram.value = JSON.parse(JSON.stringify(response.data))
    hasChanges.value = false
    isEditing.value = false
  } catch (err) {
    console.error('Error loading time program:', err)
    console.error('Error details:', {
      message: err.message,
      response: err.response,
      request: err.request,
      config: err.config
    })
    
    let errorMessage = 'Failed to load time program'
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

const toggleEditMode = () => {
  if (isEditing.value && hasChanges.value) {
    if (confirm('You have unsaved changes. Cancel editing will lose these changes. Continue?')) {
      program.value = JSON.parse(JSON.stringify(originalProgram.value))
      hasChanges.value = false
      isEditing.value = false
    }
  } else {
    isEditing.value = !isEditing.value
  }
}

const markChanged = () => {
  hasChanges.value = true
}

const toggleState = (dayIndex, entryIndex) => {
  program.value.entries[dayIndex][entryIndex].state = 
    program.value.entries[dayIndex][entryIndex].state === 1 ? 0 : 1
  markChanged()
}

const formatTimeInput = (event, field, dayIndex, entryIndex) => {
  let value = event.target.value.replace(/[^\d]/g, '') // Remove non-digits
  
  // Auto-format as user types
  if (value.length >= 3) {
    value = value.substring(0, 2) + ':' + value.substring(2, 4)
  }
  
  // Update the model and input value
  if (field === 'start') {
    program.value.entries[dayIndex][entryIndex].start = value
  } else {
    program.value.entries[dayIndex][entryIndex].end = value
  }
  event.target.value = value
  
  markChanged()
}

const validateTime = (event, field, dayIndex, entryIndex) => {
  const value = event.target.value
  const timePattern = /^([01]\d|2[0-4]):([0-5]\d)$/
  
  if (value && !timePattern.test(value)) {
    // If invalid, revert to previous value or set to 00:00
    if (field === 'start') {
      program.value.entries[dayIndex][entryIndex].start = '00:00'
    } else {
      program.value.entries[dayIndex][entryIndex].end = '00:00'
    }
    event.target.value = program.value.entries[dayIndex][entryIndex][field]
  }
}

const addEntry = (dayIndex, insertIndex = null) => {
  const newEntry = {
    state: program.value.nos === 3 ? 0 : 0, // Default to Normal/OFF
    start: "00:00",
    end: "24:00"
  }
  
  if (insertIndex !== null) {
    program.value.entries[dayIndex].splice(insertIndex, 0, newEntry)
  } else {
    program.value.entries[dayIndex].push(newEntry)
  }
  markChanged()
}

const removeEntry = (dayIndex, entryIndex) => {
  if (program.value.entries[dayIndex].length > 1) {
    program.value.entries[dayIndex].splice(entryIndex, 1)
    markChanged()
  }
}

const saveProgram = async () => {
  try {
    saving.value = true
    saveSuccess.value = false
    error.value = ''
    
    console.log('Saving time program:', program.value)
    await updateTimeProgram(programId.value, program.value)
    
    originalProgram.value = JSON.parse(JSON.stringify(program.value))
    hasChanges.value = false
    isEditing.value = false
    saveSuccess.value = true
    
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } catch (err) {
    console.error('Error saving time program:', err)
    console.error('Error details:', {
      message: err.message,
      response: err.response,
      request: err.request,
      config: err.config
    })
    
    let errorMessage = 'Failed to save time program'
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
    saving.value = false
  }
}

const goBack = () => {
  if (hasChanges.value) {
    if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
      router.push('/timeprog')
    }
  } else {
    router.push('/timeprog')
  }
}

// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadProgram()
  }
})

onMounted(() => {
  loadProgram()
})
</script>

<style scoped>
.time-program-detail-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h1 {
  margin: 0;
  color: var(--text-color);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
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

.program-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.program-info-card,
.schedule-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.program-info-card h2,
.schedule-card h2 {
  margin: 0 0 1.5rem 0;
  color: var(--text-color);
  font-size: 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-weight: 500;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.info-value {
  color: var(--text-color);
  font-weight: 600;
  font-size: 1rem;
}

.days-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.day-schedule {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.day-header {
  background: var(--bg-color);
  padding: 1rem;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
}

.time-entries {
  padding: 0.5rem;
}

.time-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
}

.time-entry:last-child {
  margin-bottom: 0;
}

/* Legacy 2-state support */
.time-entry.state-active {
  background: rgba(34, 197, 94, 0.1);
  border-color: var(--success-color);
}

.time-entry.state-inactive {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger-color);
}

/* 3-state system colors */
.time-entry.state-normal {
  background: rgba(251, 191, 36, 0.1);
  border-color: #fbbf24;
}

.time-entry.state-absenk {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

.time-entry.state-komfort {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.time-range {
  font-weight: 500;
  color: var(--text-color);
}

.state-indicator {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* Legacy state indicators */
.time-entry.state-active .state-indicator {
  background: var(--success-color);
  color: white;
}

.time-entry.state-inactive .state-indicator {
  background: var(--danger-color);
  color: white;
}

/* 3-state indicators */
.time-entry.state-normal .state-indicator {
  background: #fbbf24;
  color: black;
}

.time-entry.state-absenk .state-indicator {
  background: #3b82f6;
  color: white;
}

.time-entry.state-komfort .state-indicator {
  background: #ef4444;
  color: white;
}

.time-entry.editing {
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
}

.time-edit-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-input {
  width: 80px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  text-align: center;
  font-family: monospace;
}

.time-input:invalid {
  border-color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.time-input::placeholder {
  color: var(--text-muted);
  opacity: 0.6;
}

.time-separator {
  color: var(--text-muted);
  font-weight: 500;
}

.entry-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-controls {
  display: flex;
  align-items: center;
}

.state-selection {
  display: flex;
  align-items: center;
}

.state-select {
  min-width: 100px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* Toggle switches use global styles from components.css */
.toggle-label {
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 50px;
  white-space: nowrap;
  color: var(--text-color);
}

.add-entry-section {
  padding: 0.75rem;
  text-align: center;
  border-top: 1px dashed var(--border-color);
  margin-top: 0.5rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.btn-outline:hover {
  background: var(--bg-color);
  border-color: var(--primary-color);
}

.success-message {
  background: var(--success-color);
  color: white;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  margin-top: 1rem;
}

.form-input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color);
  color: var(--text-color);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

@media (max-width: 768px) {
  .time-program-detail-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .days-container {
    grid-template-columns: 1fr;
  }
}
</style>