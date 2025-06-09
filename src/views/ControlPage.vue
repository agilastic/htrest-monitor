<template>
  <div class="control-page">
    <div class="page-header">
      <h1>System Control Panel</h1>
      <button @click="refreshStatus" class="btn btn-secondary" :disabled="isRefreshing">
        <span v-if="isRefreshing">Loading...</span>
        <span v-else>Refresh Status</span>
      </button>
    </div>

    <div v-if="isRefreshing && !currentStatus" class="loading-container">
      <Spinner message="Loading current status..." />
    </div>

    <div class="control-section">
      <h2>Raumtemperatur</h2>

      <div v-if="currentTempLoading" class="current-temp-loading">
      </div>

      <div v-else class="current-temp-display">
        <p class="current-temp-info">
          <strong>Aktuelle Zieltemperatur:</strong> 
          <span class="current-temp-value">{{ currentTargetTemp }}°C</span>
        </p>
      </div>
      
      <div class="input-group">
        <label for="targetTemp">Neue Zieltemperatur (°C):</label>
        <input type="number" id="targetTemp" v-model.number="targetTemperature" step="0.1" min="15" max="30" />
      </div>
      <button @click="setTargetTemperature" :disabled="isSettingTemp">
        {{ isSettingTemp ? 'Setze...' : 'Temperatur setzen' }}
      </button>
      <p v-if="tempSuccess" class="success-message">Zieltemperatur erfolgreich gesetzt!</p>
      <p v-if="tempError" class="error-message">{{ tempError }}</p>
    </div>

    <!-- Holiday Mode Control -->
    <div class="control-section">
      <h2>🏖️ Holiday Mode / Urlaubsmodus</h2>
      <div class="toggle-group">
        <label class="toggle-switch">
          <input 
            type="checkbox" 
            v-model="holidayMode.enabled"
            @change="toggleHolidayMode"
            :disabled="holidayMode.loading"
          />
          <span class="toggle-slider"></span>
          <span class="toggle-label">
            {{ holidayMode.enabled ? 'Holiday Mode AN' : 'Holiday Mode AUS' }}
          </span>
        </label>
      </div>
      <div v-if="holidayMode.enabled" class="holiday-settings">
        <div class="input-group">
          <label>Von Datum:</label>
          <input type="date" v-model="holidayMode.startDate" />
        </div>
        <div class="input-group">
          <label>Bis Datum:</label>
          <input type="date" v-model="holidayMode.endDate" />
        </div>
        <button @click="applyHolidaySettings" :disabled="holidayMode.loading">
          {{ holidayMode.loading ? 'Wird gesetzt...' : 'Urlaubszeit anwenden' }}
        </button>
      </div>
      <p v-if="holidayMode.success" class="success-message">Holiday Mode erfolgreich {{ holidayMode.enabled ? 'aktiviert' : 'deaktiviert' }}!</p>
      <p v-if="holidayMode.error" class="error-message">{{ holidayMode.error }}</p>
    </div>

    <!-- Eco Mode Control -->
    <div class="control-section">
      <h2>🌿 Eco Mode / Energiesparmodus</h2>
      <div class="toggle-group">
        <label class="toggle-switch">
          <input 
            type="checkbox" 
            v-model="ecoMode.enabled"
            @change="toggleEcoMode"
            :disabled="ecoMode.loading"
          />
          <span class="toggle-slider"></span>
          <span class="toggle-label">
            {{ ecoMode.enabled ? 'Eco Mode AN' : 'Eco Mode AUS' }}
          </span>
        </label>
      </div>
      <p v-if="ecoMode.success" class="success-message">Eco Mode erfolgreich {{ ecoMode.enabled ? 'aktiviert' : 'deaktiviert' }}!</p>
      <p v-if="ecoMode.error" class="error-message">{{ ecoMode.error }}</p>
    </div>

    <!-- Force Hot Water Control -->
    <div class="control-section">
      <h2>🔥 Force Hot Water / Warmwasser Zwang</h2>
      <div class="input-group">
        <label>Zieltemperatur Warmwasser (°C):</label>
        <input 
          type="number" 
          v-model.number="hotWater.targetTemp" 
          step="1" 
          min="40" 
          max="60" 
        />
      </div>
      <div class="button-group">
        <button @click="forceHotWater" :disabled="hotWater.loading">
          {{ hotWater.loading ? 'Wird aktiviert...' : 'Warmwasser forcieren' }}
        </button>
        <button @click="stopForceHotWater" :disabled="hotWater.loading" class="btn-secondary">
          Zwang beenden
        </button>
      </div>
      <p v-if="hotWater.success" class="success-message">{{ hotWater.successMessage }}</p>
      <p v-if="hotWater.error" class="error-message">{{ hotWater.error }}</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { setParameter, getParameters, getTimePrograms, updateTimeProgram } from '@/api/htrest';
import Spinner from '@/components/shared/Spinner.vue';

const targetTemperature = ref(21.0);
const currentTargetTemp = ref(21.0);
const currentTempLoading = ref(true);
const isSettingTemp = ref(false);
const tempSuccess = ref(false);
const tempError = ref(null);

const currentStatus = ref(null);
const isRefreshing = ref(false);

// Holiday Mode state
const holidayMode = ref({
  enabled: false,
  startDate: '',
  endDate: '',
  loading: false,
  success: false,
  error: null
});

// Eco Mode state
const ecoMode = ref({
  enabled: false,
  loading: false,
  success: false,
  error: null
});

// Hot Water state
const hotWater = ref({
  targetTemp: 55,
  loading: false,
  success: false,
  successMessage: '',
  error: null
});

const loadCurrentTargetTemperature = async () => {
  currentTempLoading.value = true;
  try {
    const response = await getParameters();
    const currentTemp = response.data['HKR Soll_Raum'];
    if (currentTemp !== undefined) {
      currentTargetTemp.value = currentTemp;
      targetTemperature.value = currentTemp; // Pre-populate input with current value
    }
  } catch (err) {
    console.error('Error loading current target temperature:', err);
  } finally {
    currentTempLoading.value = false;
  }
};

const refreshStatus = async () => {
  isRefreshing.value = true;
  try {
    const response = await getParameters();
    currentStatus.value = response.data;
    
    // Also update current target temperature
    const currentTemp = response.data['HKR Soll_Raum'];
    if (currentTemp !== undefined) {
      currentTargetTemp.value = currentTemp;
    }
  } catch (err) {
    console.error('Error refreshing status:', err);
  } finally {
    isRefreshing.value = false;
  }
};

const setTargetTemperature = async () => {
  isSettingTemp.value = true;
  tempSuccess.value = false;
  tempError.value = null;

  if (targetTemperature.value < 15 || targetTemperature.value > 30) {
    tempError.value = 'Temperatur muss zwischen 15°C und 30°C liegen.';
    isSettingTemp.value = false;
    return;
  }

  try {
    await setParameter('HKR Soll_Raum', targetTemperature.value);
    tempSuccess.value = true;
    
    // Update current displayed temperature
    currentTargetTemp.value = targetTemperature.value;
  } catch (err) {
    tempError.value = 'Fehler beim Setzen der Zieltemperatur.';
    console.error('Error setting target temperature:', err);
  } finally {
    isSettingTemp.value = false;
    setTimeout(() => tempSuccess.value = false, 3000);
  }
};

// Holiday Mode functions
const toggleHolidayMode = () => {
  if (holidayMode.value.enabled) {
    // Set default dates (today to next week)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    holidayMode.value.startDate = today.toISOString().split('T')[0];
    holidayMode.value.endDate = nextWeek.toISOString().split('T')[0];
  } else {
    deactivateHolidayMode();
  }
};

const applyHolidaySettings = async () => {
  if (!holidayMode.value.startDate || !holidayMode.value.endDate) {
    holidayMode.value.error = 'Bitte Start- und Enddatum auswählen.';
    return;
  }

  holidayMode.value.loading = true;
  holidayMode.value.success = false;
  holidayMode.value.error = null;

  try {
    // Get heating time program (usually index 2)
    const timePrograms = await getTimePrograms();
    const heatingProgram = timePrograms.data.find(p => p.name === 'Heizung');
    
    if (heatingProgram) {
      const program = await getTimeProgram(heatingProgram.index);
      // Set all entries to state 0 (off/reduced) for holiday period
      const modifiedProgram = { ...program.data };
      
      // For simplicity, we'll modify all days to have reduced heating
      modifiedProgram.entries = modifiedProgram.entries.map(dayEntries => 
        dayEntries.map(entry => ({ ...entry, state: 1 })) // Absenk mode
      );
      
      await updateTimeProgram(heatingProgram.index, modifiedProgram);
      holidayMode.value.success = true;
    } else {
      throw new Error('Heizungsprogramm nicht gefunden');
    }
  } catch (err) {
    holidayMode.value.error = 'Fehler beim Aktivieren des Holiday Mode.';
    console.error('Error setting holiday mode:', err);
  } finally {
    holidayMode.value.loading = false;
    setTimeout(() => holidayMode.value.success = false, 3000);
  }
};

const deactivateHolidayMode = async () => {
  holidayMode.value.loading = true;
  holidayMode.value.success = false;
  holidayMode.value.error = null;

  try {
    // Reset heating program to normal operation
    const timePrograms = await getTimePrograms();
    const heatingProgram = timePrograms.data.find(p => p.name === 'Heizung');
    
    if (heatingProgram) {
      const program = await getTimeProgram(heatingProgram.index);
      const modifiedProgram = { ...program.data };
      
      // Reset to normal mode (state 0)
      modifiedProgram.entries = modifiedProgram.entries.map(dayEntries => 
        dayEntries.map(entry => ({ ...entry, state: 0 })) // Normal mode
      );
      
      await updateTimeProgram(heatingProgram.index, modifiedProgram);
      holidayMode.value.success = true;
    }
  } catch (err) {
    holidayMode.value.error = 'Fehler beim Deaktivieren des Holiday Mode.';
    console.error('Error deactivating holiday mode:', err);
  } finally {
    holidayMode.value.loading = false;
    setTimeout(() => holidayMode.value.success = false, 3000);
  }
};

// Eco Mode functions
const toggleEcoMode = async () => {
  ecoMode.value.loading = true;
  ecoMode.value.success = false;
  ecoMode.value.error = null;

  try {
    const timePrograms = await getTimePrograms();
    const heatingProgram = timePrograms.data.find(p => p.name === 'Heizung');
    
    if (heatingProgram) {
      const program = await getTimeProgram(heatingProgram.index);
      const modifiedProgram = { ...program.data };
      
      if (ecoMode.value.enabled) {
        // Set to eco mode (state 1 = Absenk)
        modifiedProgram.entries = modifiedProgram.entries.map(dayEntries => 
          dayEntries.map(entry => ({ ...entry, state: 1 }))
        );
      } else {
        // Set to normal mode (state 0 = Normal)
        modifiedProgram.entries = modifiedProgram.entries.map(dayEntries => 
          dayEntries.map(entry => ({ ...entry, state: 0 }))
        );
      }
      
      await updateTimeProgram(heatingProgram.index, modifiedProgram);
      ecoMode.value.success = true;
    }
  } catch (err) {
    ecoMode.value.error = 'Fehler beim Umschalten des Eco Mode.';
    console.error('Error toggling eco mode:', err);
    ecoMode.value.enabled = !ecoMode.value.enabled; // Revert toggle
  } finally {
    ecoMode.value.loading = false;
    setTimeout(() => ecoMode.value.success = false, 3000);
  }
};

// Hot Water functions
const forceHotWater = async () => {
  hotWater.value.loading = true;
  hotWater.value.success = false;
  hotWater.value.error = null;

  try {
    await setParameter('WW Normaltemp.', hotWater.value.targetTemp);
    // Also trigger hot water priority if available
    await setParameter('Warmwasservorrang', true);
    
    hotWater.value.success = true;
    hotWater.value.successMessage = `Warmwasser forciert auf ${hotWater.value.targetTemp}°C`;
  } catch (err) {
    hotWater.value.error = 'Fehler beim Forcieren des Warmwassers.';
    console.error('Error forcing hot water:', err);
  } finally {
    hotWater.value.loading = false;
    setTimeout(() => hotWater.value.success = false, 3000);
  }
};

const stopForceHotWater = async () => {
  hotWater.value.loading = true;
  hotWater.value.success = false;
  hotWater.value.error = null;

  try {
    // Reset to normal hot water temperature (46°C as seen in the system)
    await setParameter('WW Normaltemp.', 46);
    await setParameter('Warmwasservorrang', false);
    
    hotWater.value.success = true;
    hotWater.value.successMessage = 'Warmwasser Zwang beendet';
  } catch (err) {
    hotWater.value.error = 'Fehler beim Beenden des Warmwasser Zwangs.';
    console.error('Error stopping hot water force:', err);
  } finally {
    hotWater.value.loading = false;
    setTimeout(() => hotWater.value.success = false, 3000);
  }
};

onMounted(() => {
  loadCurrentTargetTemperature();
  refreshStatus();
});
</script>

<style scoped>
.control-page {
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
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
.control-section {
  background-color: #f0f8ff;
  border: 1px solid #add8e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
}
.control-section h2 {
  margin-top: 0;
  color: #333;
}
.input-group {
  margin-bottom: 15px;
}
.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}
.input-group input[type="number"],
.input-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
}
button:hover:not(:disabled) {
  background-color: #0056b3;
}
button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.btn-secondary {
  background-color: #6c757d;
}
.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}
.success-message {
  color: green;
  margin-top: 10px;
  font-weight: bold;
}
.error-message {
  color: red;
  margin-top: 10px;
  font-weight: bold;
}

/* Toggle Switch Styles - Using global styles */
.toggle-group {
  margin-bottom: 15px;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.toggle-switch input[type="checkbox"] {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  cursor: pointer;
  width: 60px;
  height: 34px;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

.toggle-switch input:focus + .toggle-slider {
  box-shadow: 0 0 1px var(--primary-color);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-label {
  margin-left: 60px;
  font-weight: 500;
  font-size: 1em;
  white-space: nowrap;
  min-width: auto;
  color: #333;
}

/* Holiday Settings */
.holiday-settings {
  margin-top: 15px;
  padding: 15px;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.holiday-settings .input-group {
  display: inline-block;
  width: 48%;
  margin-right: 2%;
}

.holiday-settings input[type="date"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

/* Button Groups */
.button-group {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.button-group button {
  flex: 1;
}

/* Control Section Headers with Emojis */
.control-section h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2em;
}

/* Current Temperature Display */
.current-temp-loading {
  margin-bottom: 15px;
  text-align: center;
  padding: 10px;
}

.current-temp-display {
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(0, 123, 255, 0.05);
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.current-temp-info {
  margin: 0;
  font-size: 1em;
  color: #333;
}

.current-temp-value {
  color: #007bff;
  font-weight: 600;
  font-size: 1.1em;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .holiday-settings .input-group {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .button-group button {
    flex: none;
  }
}
</style>
