<template>
  <div class="system-control">
    <h2>System Control Panel</h2>
    
    <div v-if="heatpumpStore.error" class="error-message">
      {{ heatpumpStore.error }}
    </div>
    
    <div class="control-grid">
      <!-- Target Temperature Control -->
      <div class="control-group">
                <h3 class="control-subtitle">Inhouse Room Temperature</h3>

        <SliderInput
          label="Target Temperature"
          v-model="targetTemp"
          :min="15"
          :max="25"
          :step="0.5"
          unit="°C"
          :disabled="heatpumpStore.loading"
        />
      </div>
      
      
      <!-- Hot Water Force Control -->
      <div class="control-group">
        <h3 class="control-subtitle">🔥 Hot Water Force</h3>
        <div class="force-controls">
          <div class="force-status" :class="{ 'active': heatpumpStore.hotWaterForceActive }">
            Status: {{ heatpumpStore.hotWaterForceActive ? 'ACTIVE' : 'INACTIVE' }}
          </div>
          <div class="button-group">
            <button 
              @click="forceHotWater"
              :disabled="heatpumpStore.hotWaterForceLoading || heatpumpStore.hotWaterForceActive"
              class="force-btn"
            >
              {{ heatpumpStore.hotWaterForceLoading ? 'Forcing...' : 'Force Hot Water (48°C)' }}
            </button>
            <button 
              @click="stopForceHotWater"
              :disabled="heatpumpStore.hotWaterForceLoading || !heatpumpStore.hotWaterForceActive"
              class="stop-force-btn"
            >
              {{ heatpumpStore.hotWaterForceLoading ? 'Stopping...' : 'Stop Force' }}
            </button>
          </div>
          <div class="force-info">
            <small>Force sets temp to 48°C with 2°C hysteresis. Stop resets to 46°C with 5°C hysteresis.</small>
          </div>
        </div>
      </div>
      
      
    </div>
    
    <div class="control-actions">
      <button 
        @click="refreshParameters" 
        :disabled="heatpumpStore.loading"
        class="refresh-btn"
      >
        {{ heatpumpStore.loading ? 'Loading...' : 'Refresh Parameters' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useHeatpumpStore } from '@/stores/heatpump'
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue'
import SliderInput from '@/components/shared/SliderInput.vue'

const heatpumpStore = useHeatpumpStore()

// Local reactive refs for UI components
const targetTemp = ref(heatpumpStore.targetTemperature)
const warmWaterTemp = ref(heatpumpStore.warmWaterTemperature)
const operatingMode = ref(heatpumpStore.operatingMode)
const systemEnabled = ref(heatpumpStore.heatingEnabled)

// Debounced update function to avoid excessive API calls
let updateTimeout = null
const debounceUpdate = (paramId, value) => {
  if (updateTimeout) clearTimeout(updateTimeout)
  updateTimeout = setTimeout(async () => {
    try {
      await heatpumpStore.updateParameter(paramId, value)
    } catch (error) {
      // Error is already handled in the store
      console.error(`Failed to update ${paramId}:`, error)
    }
  }, 500) // 500ms debounce
}

// Watch for changes and update via store
watch(targetTemp, (newValue) => {
  if (newValue !== heatpumpStore.targetTemperature) {
    debounceUpdate('targetTemperature', newValue)
  }
})

watch(warmWaterTemp, (newValue) => {
  if (newValue !== heatpumpStore.warmWaterTemperature) {
    debounceUpdate('warmWaterTemperature', newValue)
  }
})

watch(operatingMode, async (newValue) => {
  if (newValue !== heatpumpStore.operatingMode) {
    try {
      await heatpumpStore.updateParameter('operatingMode', newValue)
    } catch (error) {
      // Revert to previous value on error
      operatingMode.value = heatpumpStore.operatingMode
      console.error('Failed to update operating mode:', error)
    }
  }
})

watch(systemEnabled, async (newValue) => {
  if (newValue !== heatpumpStore.heatingEnabled) {
    try {
      await heatpumpStore.updateParameter('heatingEnabled', newValue)
    } catch (error) {
      // Revert to previous value on error
      systemEnabled.value = heatpumpStore.heatingEnabled
      console.error('Failed to update system enabled state:', error)
    }
  }
})

// Initialize component
const refreshParameters = async () => {
  await heatpumpStore.fetchAllParameters()
  heatpumpStore.initializeControlParameters()
  
  // Update local refs with store values
  targetTemp.value = heatpumpStore.targetTemperature
  warmWaterTemp.value = heatpumpStore.warmWaterTemperature
  operatingMode.value = heatpumpStore.operatingMode
  systemEnabled.value = heatpumpStore.heatingEnabled
}

// Hot water force functions
const forceHotWater = async () => {
  try {
    await heatpumpStore.forceHotWater(48)
    // Update local ref to reflect the forced temperature
    warmWaterTemp.value = 48
  } catch (error) {
    console.error('Failed to force hot water:', error)
  }
}

const stopForceHotWater = async () => {
  try {
    await heatpumpStore.stopForceHotWater()
    // Update local ref to reflect the normal temperature
    warmWaterTemp.value = 46
  } catch (error) {
    console.error('Failed to stop hot water force:', error)
  }
}

onMounted(() => {
  refreshParameters()
})
</script>

<style scoped>
.system-control {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.system-control h2 {
  color: var(--text-color);
  margin-bottom: 24px;
  text-align: center;
}

.error-message {
  background-color: var(--color-danger, #F44336);
  color: white;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.control-group {
  background: var(--color-background, #fff);
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: var(--color-text, #333);
  font-size: 0.9em;
}

.mode-select {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border, #e0e0e0);
  background-color: var(--color-background, #fff);
  color: var(--color-text, #333);
  font-size: 1em;
  transition: border-color 0.3s ease;
}

.mode-select:focus {
  outline: none;
  border-color: var(--color-primary, #4CAF50);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.mode-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.refresh-btn {
  background-color: var(--color-primary, #4CAF50);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-subtitle {
  margin: 0 0 12px 0;
  color: var(--color-text, #333);
  font-size: 1.1em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.force-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.force-status {
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 600;
  text-align: center;
  background-color: var(--color-border, #e0e0e0);
  color: var(--color-text-secondary, #666);
}

.force-status.active {
  background-color: var(--color-secondary, #FFC107);
  color: #000;
}

.button-group {
  display: flex;
  gap: 8px;
}

.force-btn {
  flex: 1;
  background-color: var(--color-secondary, #FFC107);
  color: #000;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.force-btn:hover:not(:disabled) {
  background-color: #e0a800;
}

.stop-force-btn {
  flex: 1;
  background-color: var(--color-text-secondary, #666);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.stop-force-btn:hover:not(:disabled) {
  background-color: #555;
}

.force-btn:disabled,
.stop-force-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.force-info {
  text-align: center;
  color: var(--color-text-secondary, #666);
}

@media (max-width: 768px) {
  .control-grid {
    grid-template-columns: 1fr;
  }
  
  .system-control {
    padding: 16px;
  }
  
  .button-group {
    flex-direction: column;
  }
}
</style>