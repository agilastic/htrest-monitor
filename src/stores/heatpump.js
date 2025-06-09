import { defineStore } from 'pinia';
// Wichtig: Jetzt getParameters importieren, da wir den /param Endpunkt nutzen
import { getParameters, getFastQueryValues, setParameter, getTimePrograms, getTimeProgram, updateTimeProgram } from '@/api/htrest';

export const useHeatpumpStore = defineStore('heatpump', {
  state: () => ({
    allParameters: null, // Dieser State wird nun das vollständige Objekt von /param speichern
    currentValues: null, // Fast query values for live status
    loading: false,
    error: null,
    lastUpdated: null,
    // Control parameters for UI components
    targetTemperature: 20,
    warmWaterTemperature: 48,
    operatingMode: 'HEATING',
    heatingEnabled: true,
    // Hot water force state
    hotWaterForceActive: false,
    hotWaterForceLoading: false,
    warmwasserTimeProgramStatus: null,
    previousTimeProgramState: null, // Store the original time program state before forcing
  }),
  actions: {
    // Funktion umbenannt, um zu spiegeln, dass alle Parameter abgerufen werden
    async fetchAllParameters() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getParameters(); // Aufruf des /param Endpunkts
        // Speichern Sie das gesamte rohe API-Datenobjekt direkt
        this.allParameters = response.data;
        this.lastUpdated = new Date();
      } catch (err) {
        let errorMessage = 'Fehler beim Abrufen aller Parameter.';
        if (err.response) {
          errorMessage += ` Status: ${err.response.status}`;
          // Wenn der Fehler Details im response.data hat, diese hinzufügen
          if (err.response.data) {
            errorMessage += ` - ${JSON.stringify(err.response.data)}`;
          }
        } else if (err.request) {
          errorMessage += ' Keine Antwort vom Server erhalten (Netzwerk- oder CORS-Problem?).';
        } else {
          errorMessage += ` ${err.message}`;
        }
        this.error = errorMessage;
        console.error('fetchAllParameters error:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response,
          request: err.request,
          config: err.config // Kann nützliche Request-Details enthalten
        });
      } finally {
        this.loading = false;
      }
    },
    async fetchCurrentValues() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getFastQueryValues();
        this.currentValues = response.data;
        this.lastUpdated = new Date();
      } catch (err) {
        let errorMessage = 'Fehler beim Abrufen der aktuellen Werte.';
        if (err.response) {
          errorMessage += ` Status: ${err.response.status}`;
          if (err.response.data) {
            errorMessage += ` - ${JSON.stringify(err.response.data)}`;
          }
        } else if (err.request) {
          errorMessage += ' Keine Antwort vom Server erhalten (Netzwerk- oder CORS-Problem?).';
        } else {
          errorMessage += ` ${err.message}`;
        }
        this.error = errorMessage;
        console.error('fetchCurrentValues error:', err);
      } finally {
        this.loading = false;
      }
    },
    // Diese Hilfsfunktion ist immer noch nützlich, um den Betriebsmodus zu interpretieren
    getOperatingMode(modeCode) {
      switch(modeCode) {
        case 0: return 'Standby';
        case 1: return 'Heizen';
        case 2: return 'Kühlen';
        case 3: return 'Auto/Mixed'; // Basierend auf typischen Wärmepumpenmodi
        default: return `Unbekannt (${modeCode})`;
      }
    },
    
    // Parameter control actions for UI components
    async updateParameter(paramId, value) {
      this.loading = true;
      this.error = null;
      try {
        // Input validation
        if (paramId === 'targetTemperature' && (value < 15 || value > 30)) {
          throw new Error('Target temperature must be between 15°C and 30°C');
        }
        if (paramId === 'warmWaterTemperature' && (value < 35 || value > 60)) {
          throw new Error('Warm water temperature must be between 35°C and 60°C');
        }
        
        // Map UI parameter names to API parameter names
        const apiParamName = this.getApiParameterName(paramId);
        
        // Call API to set parameter
        await setParameter(apiParamName, value);
        
        // Update local state after successful API call
        if (paramId === 'targetTemperature') this.targetTemperature = value;
        if (paramId === 'warmWaterTemperature') this.warmWaterTemperature = value;
        if (paramId === 'operatingMode') this.operatingMode = value;
        if (paramId === 'heatingEnabled') this.heatingEnabled = value;
        
        console.log(`Parameter ${paramId} (${apiParamName}) set to ${value}`);
      } catch (err) {
        let errorMessage = `Failed to set parameter ${paramId}: `;
        if (err.response) {
          errorMessage += `Status: ${err.response.status}`;
          if (err.response.data) {
            errorMessage += ` - ${JSON.stringify(err.response.data)}`;
          }
        } else if (err.request) {
          errorMessage += 'No response from server (network or CORS issue?).';
        } else {
          errorMessage += err.message;
        }
        this.error = errorMessage;
        console.error('updateParameter error:', err);
        throw err; // Re-throw so UI can handle the error
      } finally {
        this.loading = false;
      }
    },
    
    // Map UI parameter names to API parameter names
    getApiParameterName(uiParamId) {
      const parameterMap = {
        'targetTemperature': 'HKR Soll_Raum',
        'warmWaterTemperature': 'WW Normaltemp.',
        'operatingMode': 'Betriebsart', // This might need adjustment based on actual API
        'heatingEnabled': 'Heizkreispumpe' // This might need adjustment based on actual API
      };
      
      return parameterMap[uiParamId] || uiParamId;
    },
    
    // Hot water force functions based on Python code
    async forceHotWater(targetTemp = 48) {
      this.hotWaterForceLoading = true;
      this.error = null;
      try {
        // 1. Save current time program state before modifying it
        await this.saveCurrentTimeProgramState();
        
        // 2. Set hot water hysteresis to 2 and target temperature (like Python code)
        await setParameter('WW Hysterese Normaltemp.', 2);
        await setParameter('WW Normaltemp.', targetTemp);
        
        // 3. Enable Warmwasser time program for current weekday and hour
        await this.enableWarmwasserTimeProgram();
        
        this.hotWaterForceActive = true;
        this.warmWaterTemperature = targetTemp;
        
        console.log(`Hot water forced to ${targetTemp}°C with hysteresis 2 and time program enabled`);
      } catch (err) {
        let errorMessage = 'Failed to force hot water: ';
        if (err.response) {
          errorMessage += `Status: ${err.response.status}`;
          if (err.response.data) {
            errorMessage += ` - ${JSON.stringify(err.response.data)}`;
          }
        } else {
          errorMessage += err.message;
        }
        this.error = errorMessage;
        console.error('forceHotWater error:', err);
        throw err;
      } finally {
        this.hotWaterForceLoading = false;
      }
    },
    
    async stopForceHotWater() {
      this.hotWaterForceLoading = true;
      this.error = null;
      try {
        // 1. Reset to normal values (like Python code)
        await setParameter('WW Hysterese Normaltemp.', 5);
        await setParameter('WW Normaltemp.', 46);
        
        // 2. Restore previous time program state
        await this.restorePreviousTimeProgramState();
        
        this.hotWaterForceActive = false;
        this.warmWaterTemperature = 46;
        
        console.log('Hot water force stopped - reset to normal values and restored time program');
      } catch (err) {
        let errorMessage = 'Failed to stop hot water force: ';
        if (err.response) {
          errorMessage += `Status: ${err.response.status}`;
          if (err.response.data) {
            errorMessage += ` - ${JSON.stringify(err.response.data)}`;
          }
        } else {
          errorMessage += err.message;
        }
        this.error = errorMessage;
        console.error('stopForceHotWater error:', err);
        throw err;
      } finally {
        this.hotWaterForceLoading = false;
      }
    },
    
    // Save current time program state before forcing
    async saveCurrentTimeProgramState() {
      try {
        const now = new Date();
        const currentDay = now.getDay();
        const timeProgramDay = currentDay === 0 ? 6 : currentDay - 1;
        
        const timePrograms = await getTimePrograms();
        const warmwasserProgram = timePrograms.data.find(p => p.index === 0 || p.name === 'Warmwasser');
        
        if (warmwasserProgram) {
          const program = await getTimeProgram(warmwasserProgram.index);
          
          // Save a deep copy of the current program state
          this.previousTimeProgramState = {
            programIndex: warmwasserProgram.index,
            program: JSON.parse(JSON.stringify(program.data)), // Deep copy
            day: timeProgramDay,
            timestamp: new Date()
          };
          
          console.log('Saved previous time program state:', this.previousTimeProgramState);
        }
      } catch (err) {
        console.error('Failed to save current time program state:', err);
        // Don't throw error here, as the main functionality should still work
      }
    },
    
    // Restore previous time program state
    async restorePreviousTimeProgramState() {
      try {
        if (!this.previousTimeProgramState) {
          console.warn('No previous time program state to restore');
          return;
        }
        
        console.log('Restoring previous time program state:', this.previousTimeProgramState);
        
        // Restore the entire time program to its previous state
        await updateTimeProgram(
          this.previousTimeProgramState.programIndex, 
          this.previousTimeProgramState.program
        );
        
        console.log('Successfully restored previous time program state');
        
        // Clear the saved state
        this.previousTimeProgramState = null;
        
      } catch (err) {
        console.error('Failed to restore previous time program state:', err);
        // Don't throw error here, as the temperature reset is more important
      }
    },
    
    // Helper function to enable Warmwasser time program for current time
    async enableWarmwasserTimeProgram() {
      try {
        // Get current date/time
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const currentHour = now.getHours();
        
        // Map JavaScript day (0=Sunday) to typical time program day (0=Monday)
        // Most time programs use: 0=Monday, 1=Tuesday, ..., 6=Sunday
        const timeProgramDay = currentDay === 0 ? 6 : currentDay - 1;
        
        // Get time programs
        const timePrograms = await getTimePrograms();
        console.log('Available time programs:', timePrograms.data);
        
        // Find Warmwasser program (index 0)
        const warmwasserProgram = timePrograms.data.find(p => p.index === 0 || p.name === 'Warmwasser');
        console.log('Found Warmwasser program:', warmwasserProgram);
        
        if (warmwasserProgram) {
          // Get the specific time program details
          const program = await getTimeProgram(warmwasserProgram.index);
          console.log('Full program data:', program.data);
          console.log('Program entries structure:', program.data.entries);
          console.log(`Looking for day ${timeProgramDay} (${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][timeProgramDay]})`);
          
          // Create a copy of the program data
          const modifiedProgram = { ...program.data };
          
          // Find time entries for current day
          const dayEntries = modifiedProgram.entries[timeProgramDay];
          console.log(`Day ${timeProgramDay} entries:`, dayEntries);
          
          if (dayEntries && Array.isArray(dayEntries)) {
            const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:00`;
            console.log(`Looking for time range covering ${currentTimeStr}`);
            
            // Check if current time falls within any existing time range
            let foundExistingRange = false;
            
            for (let i = 0; i < dayEntries.length; i++) {
              const entry = dayEntries[i];
              console.log(`Checking entry ${i}:`, entry);
              
              // Skip invalid entries (same start/end time)
              if (entry.start === entry.end) {
                console.log(`Skipping invalid entry: ${entry.start}-${entry.end}`);
                continue;
              }
              
              // Check if current time falls within this range
              if (this.timeInRange(currentTimeStr, entry.start, entry.end)) {
                console.log(`Current time ${currentTimeStr} falls within range ${entry.start}-${entry.end} (state: ${entry.state})`);
                
                // If this range is disabled (state 0), enable it
                if (entry.state === 0) {
                  modifiedProgram.entries[timeProgramDay][i].state = 1; // Enable (use state 1 like existing enabled ranges)
                  foundExistingRange = true;
                  console.log(`Enabled existing range ${entry.start}-${entry.end} (changed state 0 → 1)`);
                  break;
                } else {
                  console.log(`Range ${entry.start}-${entry.end} already enabled (state: ${entry.state})`);
                  foundExistingRange = true;
                  break;
                }
              }
            }
            
            // If no existing range covers current time, add a new 1-hour range
            if (!foundExistingRange) {
              const endHour = (currentHour + 1) % 24;
              const newEntry = {
                start: currentTimeStr,
                end: `${endHour.toString().padStart(2, '0')}:00`,
                state: 1 // Enabled (use state 1 like existing enabled ranges)
              };
              
              modifiedProgram.entries[timeProgramDay].push(newEntry);
              console.log(`Added new time range:`, newEntry);
            }
            
            // Update the entire time program
            await updateTimeProgram(warmwasserProgram.index, modifiedProgram);
            console.log(`Successfully updated Warmwasser time program for day ${timeProgramDay}`);
            
          } else {
            console.warn(`No entries array found for day ${timeProgramDay}`);
          }
        } else {
          console.warn('Warmwasser time program not found');
        }
      } catch (err) {
        console.error('Failed to enable Warmwasser time program:', err);
        // Don't throw error here, as the main temperature setting might still work
      }
    },
    
    // Helper function to check if a time falls within a time range
    timeInRange(time, start, end) {
      // Convert time strings to minutes for comparison
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        // Handle 24:00 as end of day (1440 minutes)
        if (hours === 24) return 24 * 60;
        return hours * 60 + minutes;
      };
      
      const currentMinutes = timeToMinutes(time);
      const startMinutes = timeToMinutes(start);
      const endMinutes = timeToMinutes(end);
      
      // Handle ranges that cross midnight (e.g., 23:00 - 01:00)
      if (startMinutes > endMinutes) {
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      } else {
        // For normal ranges, include start but exclude end (so 20:00-24:00 includes 22:00 but not 24:00)
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      }
    },
    
    // Check if Warmwasser time program is currently enabled
    async checkWarmwasserTimeProgramStatus() {
      try {
        const now = new Date();
        const currentDay = now.getDay();
        const currentHour = now.getHours();
        const timeProgramDay = currentDay === 0 ? 6 : currentDay - 1;
        const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:00`;
        
        const timePrograms = await getTimePrograms();
        const warmwasserProgram = timePrograms.data.find(p => p.index === 0 || p.name === 'Warmwasser');
        
        if (warmwasserProgram) {
          const program = await getTimeProgram(warmwasserProgram.index);
          const dayEntries = program.data.entries[timeProgramDay];
          
          if (dayEntries && Array.isArray(dayEntries)) {
            // Check if current time falls within any enabled time range
            for (const entry of dayEntries) {
              if (this.timeInRange(currentTimeStr, entry.start, entry.end)) {
                return {
                  enabled: entry.state !== 0,
                  state: entry.state,
                  day: timeProgramDay,
                  hour: currentHour,
                  range: `${entry.start}-${entry.end}`
                };
              }
            }
          }
        }
        
        return { enabled: false, state: 0, day: timeProgramDay, hour: currentHour, range: 'none' };
      } catch (err) {
        console.error('Failed to check Warmwasser time program status:', err);
        return { enabled: false, state: 0, day: 0, hour: 0, range: 'error' };
      }
    },
    
    // Initialize control parameters from fetched data
    initializeControlParameters() {
      if (this.allParameters) {
        // Map API parameter values to control state using the correct API parameter names
        const targetTempValue = this.allParameters['HKR Soll_Raum'];
        if (targetTempValue !== undefined) this.targetTemperature = targetTempValue;
        
        const warmWaterValue = this.allParameters['WW Normaltemp.'];
        if (warmWaterValue !== undefined) this.warmWaterTemperature = warmWaterValue;
        
        // Operating mode might need to be derived from multiple parameters
        // This will depend on the actual API structure
        const operatingModeValue = this.allParameters['Betriebsart'];
        if (operatingModeValue !== undefined) this.operatingMode = operatingModeValue;
        
        const heatingEnabledValue = this.allParameters['Heizkreispumpe'];
        if (heatingEnabledValue !== undefined) this.heatingEnabled = heatingEnabledValue;
      }
    },
    
    // Helper to find parameter by ID in the fetched data
    findParameterById(id) {
      if (!this.allParameters) return null;
      // This will depend on your API structure
      // Assuming allParameters is an array or object with parameter definitions
      if (Array.isArray(this.allParameters)) {
        return this.allParameters.find(param => param.id === id || param.name === id);
      }
      return this.allParameters[id];
    },
    
    // Check if hot water has reached target temperature and auto-stop forcing
    async checkAndAutoStopForcing() {
      try {
        // Only check if forcing is currently detected
        if (!this.isHotWaterForceDetected) return;
        
        const currentHotWaterTemp = this.currentHotWaterTemp;
        const targetTemp = this.allParameters['WW Normaltemp.'];
        
        // If current hot water temperature has reached or exceeded target, auto-stop
        if (currentHotWaterTemp !== null && targetTemp !== null && currentHotWaterTemp >= targetTemp) {
          console.log(`Hot water reached target temperature (${currentHotWaterTemp}°C >= ${targetTemp}°C). Auto-stopping force...`);
          await this.stopForceHotWater();
          return true; // Indicates that auto-stop was triggered
        }
        
        return false;
      } catch (err) {
        console.error('Error in checkAndAutoStopForcing:', err);
        return false;
      }
    }
  },
  getters: {
    // Getters for computed state
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    isDataAvailable: (state) => !!state.allParameters,
    
    // Temperature getters with fallbacks
    currentTargetTemp: (state) => state.targetTemperature,
    currentWarmWaterTemp: (state) => state.warmWaterTemperature,
    currentOperatingMode: (state) => state.operatingMode,
    isSystemEnabled: (state) => state.heatingEnabled,
    
    // Status derived from current values
    systemStatus: (state) => {
      if (state.error) return 'error';
      if (state.loading) return 'loading';
      if (state.currentValues) return 'connected';
      return 'disconnected';
    },
    
    // Detect if hot water forcing is currently active based on parameter values
    isHotWaterForceDetected: (state) => {
      if (!state.allParameters) return false;
      
      const currentTemp = state.allParameters['WW Normaltemp.'];
      const currentHysteresis = state.allParameters['WW Hysterese Normaltemp.'];
      
      // Hot water force is detected when:
      // - Temperature is set to 48°C AND hysteresis is 2°C
      // OR when current temperature is higher than normal (>46°C)
      return (currentTemp === 48 && currentHysteresis === 2) || currentTemp > 46;
    },
    
    // Get current hot water temperature
    currentHotWaterTemp: (state) => {
      if (!state.allParameters) return null;
      return state.allParameters['Temp. Brauchwasser'];
    }
  }
});