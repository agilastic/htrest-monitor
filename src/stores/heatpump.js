import { defineStore } from 'pinia';
// Wichtig: Jetzt getParameters importieren, da wir den /param Endpunkt nutzen
import { getParameters, getFastQueryValues } from '@/api/htrest';

export const useHeatpumpStore = defineStore('heatpump', {
  state: () => ({
    allParameters: null, // Dieser State wird nun das vollständige Objekt von /param speichern
    currentValues: null, // Fast query values for live status
    loading: false,
    error: null,
    lastUpdated: null,
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
    }
  },
});