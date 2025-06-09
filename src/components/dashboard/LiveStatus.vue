<template>
  <div class="live-status">
    <div class="status-header">
      <h2>Live Status</h2>
      <div class="refresh-info">
        <span class="last-update">Last update: {{ formatTime(lastUpdated) }}</span>
        <div class="auto-refresh">
          <span class="refresh-indicator" :class="{ active: isRefreshing }">�</span>
          Auto-refresh
        </div>
      </div>
    </div>

    <div v-if="loading && !currentValues" class="loading-container">
      <Spinner message="Loading live data..." />
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <span class="error-icon">�</span>
        {{ error }}
      </div>
      <button @click="refresh" class="btn btn-primary retry-btn">
        Retry
      </button>
    </div>

    <div v-else-if="currentValues" class="status-grid">
      <!-- Core Temperatures -->
      <div class="status-card temperature-card">
        <h3>🌡️ Core Temperatures</h3>
        <div class="temp-values">
          <div class="temp-item">
            <span class="temp-label">Indoor Target</span>
            <span class="temp-value">{{ formatTemperature(currentValues.indoor_temp) }}</span>
          </div>
          <div class="temp-item">
            <span class="temp-label">Outdoor</span>
            <span class="temp-value">{{ formatTemperature(currentValues.outdoor_temp) }}</span>
          </div>
          <div class="temp-item">
            <span class="temp-label">Flow</span>
            <span class="temp-value">{{ formatTemperature(currentValues.flow_temp) }}</span>
          </div>
          <div class="temp-item">
            <span class="temp-label">Return</span>
            <span class="temp-value">{{ formatTemperature(currentValues.return_temp) }}</span>
          </div>
          <div class="temp-item">
            <span class="temp-label">Hot Water</span>
            <span class="temp-value">{{ formatTemperature(currentValues.hot_water_temp) }}</span>
          </div>
        </div>
      </div>

      <!-- System Temperatures -->
      <div class="status-card temperature-card">
        <h3>🔧 System Temperatures</h3>
        <div class="temp-values">
          <div class="temp-item">
            <span class="temp-label">Hot Gas</span>
            <span class="temp-value">{{ formatTemperature(currentValues.hot_gas_temp) }}</span>
          </div>
          <div class="temp-item">
            <span class="temp-label">Suction Gas</span>
            <span class="temp-value">{{ formatTemperature(currentValues.suction_gas_temp) }}</span>
          </div>
          <div class="temp-item">
            <span class="temp-label">Condensation</span>
            <span class="temp-value">{{ formatTemperature(currentValues.condensation_temp) }}</span>
          </div>
          <div class="temp-item">
            <span class="temp-label">Evaporation</span>
            <span class="temp-value">{{ formatTemperature(currentValues.evaporation_temp) }}</span>
          </div>
          <div class="temp-item">
            <span class="temp-label">Fresh Water</span>
            <span class="temp-value">{{ formatTemperature(currentValues.fresh_water_temp) }}</span>
          </div>
        </div>
      </div>

      <!-- System Status -->
      <div class="status-card system-card">
        <h3>⚙️ System Status</h3>
        <div class="system-values">
          <div class="status-item">
            <span class="status-label">Main Switch</span>
            <span class="status-indicator" :class="currentValues.main_switch ? 'status-ok' : 'status-error'">
              {{ currentValues.main_switch ? 'ON' : 'OFF' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Compressor</span>
            <span class="status-indicator" :class="getCompressorStatus(currentValues.compressor_status)">
              {{ currentValues.compressor_status || 'Unknown' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Operating Mode</span>
            <span class="status-indicator" :class="getOperatingModeClass(currentValues.operating_mode)">
              {{ currentValues.operating_mode || 'Unknown' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">System Health</span>
            <span class="status-indicator" :class="currentValues.fault_status ? 'status-error' : 'status-ok'">
              {{ currentValues.fault_status ? 'FAULT' : 'OK' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pumps & Components -->
      <div class="status-card system-card">
        <h3>💧 Pumps & Components</h3>
        <div class="system-values">
          <div class="status-item">
            <span class="status-label">Heating Pump</span>
            <span class="status-indicator" :class="currentValues.heating_active ? 'status-warning' : 'status-ok'">
              {{ currentValues.heating_active ? 'Running' : 'Off' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Hot Water Priority</span>
            <span class="status-indicator" :class="currentValues.hot_water_active ? 'status-warning' : 'status-ok'">
              {{ currentValues.hot_water_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Fresh Water Pump</span>
            <span class="status-indicator" :class="currentValues.fresh_water_pump ? 'status-warning' : 'status-ok'">
              {{ currentValues.fresh_water_pump ? 'Running' : 'Off' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Circulation Pump</span>
            <span class="status-indicator" :class="currentValues.circulation_pump ? 'status-warning' : 'status-ok'">
              {{ currentValues.circulation_pump ? 'Running' : 'Off' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">EQ Pump/Fan</span>
            <span class="status-indicator" :class="currentValues.eq_pump ? 'status-warning' : 'status-ok'">
              {{ currentValues.eq_pump ? 'Running' : 'Off' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pressures -->
      <div class="status-card performance-card">
        <h3>🔧 Pressures</h3>
        <div class="performance-values">
          <div class="metric-item">
            <span class="metric-label">High Pressure</span>
            <span class="metric-value">{{ formatPressure(currentValues.high_pressure) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Low Pressure</span>
            <span class="metric-value">{{ formatPressure(currentValues.low_pressure) }}</span>
          </div>
        </div>
      </div>

      <!-- Runtime Statistics -->
      <div class="status-card performance-card">
        <h3>📊 Runtime Statistics</h3>
        <div class="performance-values">
          <div class="metric-item">
            <span class="metric-label">Compressor Total Hours</span>
            <span class="metric-value">{{ formatHours(currentValues.compressor_total_hours) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Compressor Heating Hours</span>
            <span class="metric-value">{{ formatHours(currentValues.compressor_heating_hours) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Compressor Hot Water Hours</span>
            <span class="metric-value">{{ formatHours(currentValues.compressor_hotwater_hours) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Heating Pump Hours</span>
            <span class="metric-value">{{ formatHours(currentValues.heating_pump_hours) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Compressor Switches</span>
            <span class="metric-value">{{ formatCount(currentValues.compressor_switches) }}</span>
          </div>
        </div>
      </div>

      <!-- Configuration -->
      <div class="status-card performance-card">
        <h3>⚙️ Configuration</h3>
        <div class="performance-values">
          <div class="metric-item">
            <span class="metric-label">Room Target Temp</span>
            <span class="metric-value">{{ formatTemperature(currentValues.room_target_temp) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Heating Limit</span>
            <span class="metric-value">{{ formatTemperature(currentValues.heating_limit) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Hot Water Min Temp</span>
            <span class="metric-value">{{ formatTemperature(currentValues.hotwater_min_temp) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Hot Water Normal Temp</span>
            <span class="metric-value">{{ formatTemperature(currentValues.hotwater_normal_temp) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">System Type</span>
            <span class="metric-value">{{ currentValues.system_type }}</span>
          </div>
        </div>
      </div>

      <!-- Alarms/Errors -->
      <div class="status-card alarms-card">
        <h3>System Health</h3>
        <div class="alarms-container">
          <div v-if="!hasAlarms" class="no-alarms">
            <span class="status-indicator status-ok"> All systems normal</span>
          </div>
          <div v-else class="alarm-list">
            <div v-for="alarm in alarms" :key="alarm.id" class="alarm-item">
              <span class="status-indicator status-error">� {{ alarm.message }}</span>
              <span class="alarm-time">{{ formatTime(alarm.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useHeatpumpStore } from '@/stores/heatpump'
import Spinner from '@/components/shared/Spinner.vue'

const heatpumpStore = useHeatpumpStore()
const isRefreshing = ref(false)
let refreshInterval = null

const currentValues = computed(() => heatpumpStore.currentValues)
const loading = computed(() => heatpumpStore.loading)
const error = computed(() => heatpumpStore.error)
const lastUpdated = computed(() => heatpumpStore.lastUpdated)

// Mock alarms for demo - in real app, this would come from the store
const alarms = computed(() => {
  if (currentValues.value?.alarms) {
    return currentValues.value.alarms
  }
  return []
})

const hasAlarms = computed(() => alarms.value.length > 0)

const refresh = async () => {
  isRefreshing.value = true
  await heatpumpStore.fetchCurrentValues()
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

const formatTemperature = (temp) => {
  if (temp === null || temp === undefined) return '--�C'
  return `${Number(temp).toFixed(1)}�C`
}

const formatPower = (power) => {
  if (power === null || power === undefined) return '--kW'
  return `${Number(power).toFixed(2)}kW`
}

const formatCOP = (cop) => {
  if (cop === null || cop === undefined) return '--'
  return Number(cop).toFixed(2)
}

const formatRuntime = (runtime) => {
  if (runtime === null || runtime === undefined) return '--h'
  return `${Number(runtime).toFixed(1)}h`
}

const formatPressure = (pressure) => {
  if (pressure === null || pressure === undefined || pressure === -50.0) return '--bar'
  return `${Number(pressure).toFixed(1)}bar`
}

const formatHours = (hours) => {
  if (hours === null || hours === undefined) return '--h'
  return `${Number(hours).toLocaleString()}h`
}

const formatCount = (count) => {
  if (count === null || count === undefined) return '--'
  return Number(count).toLocaleString()
}

const formatTime = (date) => {
  if (!date) return '--'
  return new Date(date).toLocaleTimeString()
}

const getCompressorStatus = (status) => {
  if (!status) return 'status-unknown'
  switch (status.toLowerCase()) {
    case 'running':
    case 'active':
      return 'status-ok'
    case 'starting':
    case 'stopping':
      return 'status-warning'
    case 'off':
    case 'stopped':
      return 'status-ok'
    case 'error':
    case 'fault':
      return 'status-error'
    default:
      return 'status-unknown'
  }
}

const getOperatingModeClass = (mode) => {
  if (!mode) return 'status-unknown'
  switch (mode.toLowerCase()) {
    case 'heating':
      return 'status-warning'
    case 'cooling':
      return 'status-ok'
    case 'standby':
    case 'auto':
      return 'status-ok'
    default:
      return 'status-unknown'
  }
}

const getHeatingStatus = (active) => {
  return active ? 'status-warning' : 'status-ok'
}

const getHotWaterStatus = (active) => {
  return active ? 'status-ok' : 'status-ok'
}

onMounted(() => {
  refresh()
  // Auto-refresh every 30 seconds
  refreshInterval = setInterval(refresh, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.live-status {
  width: 100%;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.status-header h2 {
  margin: 0;
  color: var(--text-color);
}

.refresh-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.auto-refresh {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.refresh-indicator {
  font-size: 1rem;
  transition: transform 0.5s ease;
}

.refresh-indicator.active {
  animation: spin 1s linear infinite;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
}

.error-container .error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--danger-color);
  font-size: 1.1rem;
}

.retry-btn {
  margin-top: 0.5rem;
}

.alarms-container {
  min-height: 60px;
}

.no-alarms {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.alarm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-color);
  border-radius: 4px;
}

.alarm-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .status-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .refresh-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>