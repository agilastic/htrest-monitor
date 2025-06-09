import { defineStore } from 'pinia';
// Wichtig: Jetzt getParameters importieren, da wir den /param Endpunkt nutzen
import { getParameters, getFastQueryValues, setParameter } from '@/api/htrest';

export const useHeatpumpStore = defineStore('heatpump', {
  state: () => ({
    allParameters: null, // Dieser State wird nun das vollständige Objekt von /param speichern
    currentValues: null, // Fast query values for live status
    loading: false,
    error: null,
    lastUpdated: null,
    // Control parameters for UI components
    targetTemperature: 20,
    warmWaterTemperature: 50,
    operatingMode: 'HEATING',
    heatingEnabled: true,
    // Hot water force state
    hotWaterForceActive: false,
    hotWaterForceLoading: false,
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
        // Set hot water hysteresis to 2 and target temperature (like Python code)
        await setParameter('WW Hysterese Normaltemp.', 2);
        await setParameter('WW Normaltemp.', targetTemp);
        
        this.hotWaterForceActive = true;
        this.warmWaterTemperature = targetTemp;
        
        console.log(`Hot water forced to ${targetTemp}°C with hysteresis 2`);
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
        // Reset to normal values (like Python code)
        await setParameter('WW Hysterese Normaltemp.', 5);
        await setParameter('WW Normaltemp.', 46);
        
        this.hotWaterForceActive = false;
        this.warmWaterTemperature = 46;
        
        console.log('Hot water force stopped - reset to normal values');
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
    }
  }
});