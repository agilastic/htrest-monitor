<template>
  <div class="dashboard-page">
   

    <div  v-if="heatpumpStore.loading && !heatpumpStore.allParameters" class="loading-container">
      <Spinner message="Lade Parameter..." />
    </div>

    
    <div v-else-if="heatpumpStore.error" class="error-message">
      <div class="metro-tile error-tile">
        <h3>Fehler</h3>
        <p>{{ heatpumpStore.error }}</p>
      </div>
    </div>
    <div v-else-if="heatpumpStore.allParameters" class="metro-grid">
      <!-- Large Temperature Tile -->
      <div class="metro-tile large-tile temperature-tile">
        <h2>{{ formatValue(heatpumpStore.allParameters['Temp. Aussen'], '°C') }}</h2>
        <h4>Außentemperatur</h4>
      </div>

      <!-- System Status Tile -->
      <div class="metro-tile medium-tile status-tile" :class="{'tile-success': !heatpumpStore.allParameters['Stoerung'], 'tile-error': heatpumpStore.allParameters['Stoerung']}">
        <h3>System</h3>
        <p>{{ heatpumpStore.allParameters['Stoerung'] ? 'STÖRUNG' : 'NORMAL' }}</p>
        <small>{{ getOperatingModeText(heatpumpStore.allParameters['Betriebsart']) }}</small>
      </div>

      <!-- Compressor Status -->
      <div class="metro-tile small-tile compressor-tile" :class="{'tile-active': heatpumpStore.allParameters['Verdichter'], 'tile-inactive': !heatpumpStore.allParameters['Verdichter']}">
        <h4>Kompressor</h4>
        <p>{{ heatpumpStore.allParameters['Verdichter'] ? 'AN' : 'AUS' }}</p>
      </div>

      <!-- Room Temperature -->
      <div class="metro-tile medium-tile room-temp-tile">
        <h3>{{ formatValue(heatpumpStore.allParameters['HKR Soll_Raum'], '°C') }}</h3>
        <p>Raum Soll</p>
      </div>

      <!-- Flow Temperature -->
      <div class="metro-tile small-tile flow-temp-tile">
        <h4>Vorlauf</h4>
        <p>{{ formatValue(heatpumpStore.allParameters['Temp. Vorlauf'], '°C') }}</p>
      </div>

      <!-- Return Temperature -->
      <div class="metro-tile small-tile return-temp-tile">
        <h4>Rücklauf</h4>
        <p>{{ formatValue(heatpumpStore.allParameters['Temp. Ruecklauf'], '°C') }}</p>
      </div>

      <!-- Hot Water Temperature -->
      <div class="metro-tile medium-tile hot-water-tile">
        <h3>{{ formatValue(heatpumpStore.allParameters['Temp. Brauchwasser'], '°C') }}</h3>
        <p>Brauchwasser</p>
      </div>



      <!-- Last Updated Info -->
      <div class="metro-tile wide-tile info-tile">
        <h4>Zuletzt aktualisiert</h4>
        <p>{{ heatpumpStore.lastUpdated?.toLocaleTimeString() }}</p>
      </div>

      <!-- All Parameters Masonry -->
   
    </div>
    <div v-else class="no-data">
      <div class="metro-tile error-tile">
        <h3>Keine Daten</h3>
        <p>Stellen Sie sicher, dass die Wärmepumpe verbunden und die API erreichbar ist.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useHeatpumpStore } from '@/stores/heatpump';
import Spinner from '@/components/shared/Spinner.vue';

const heatpumpStore = useHeatpumpStore();
let refreshInterval;

function formatOperatingMode(key, fallback = '') {
  const val = heatpumpStore.allParameters[key];

  const betriebsarten = {
    1: 'Warmwasser',
    2: 'Heizen',
    3: 'Standby'
  };

  if (key === 'Betriebsart') {
    return betriebsarten[val] ?? fallback;
  }

  return val ?? fallback;
}

const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    heatpumpStore.fetchAllParameters();
  }, 30000); // Alle 30 Sekunden
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
};

const formatValue = (value, unit = '') => {
  if (typeof value === 'boolean') {
    return value ? 'Ja' : 'Nein';
  }
  if (typeof value === 'number') {
    // Runden, wenn es viele Dezimalstellen gibt, aber nicht zu viel.
    // Oder direkt als Zahl anzeigen.
    return `${value}${unit}`;
  }
  return value; // Andere Typen direkt anzeigen
};

const getOperatingModeText = (modeCode) => {
  switch (modeCode) {
    case 0: return 'Aus';
    case 1: return 'Heizen';
    case 2: return 'Kühlen';
    case 3: return 'Auto/Mixed'; // Basierend auf dem Beispiel
    // Fügen Sie hier weitere Codes hinzu, falls bekannt
    default: return `Unbekannt (${modeCode})`;
  }
};

const getOperatingModeClass = (modeCode) => {
  switch (modeCode) {
    case 1: return 'status-ok'; // Heizen = OK
    case 2: return 'status-info'; // Kühlen = Info
    case 3: return 'status-info'; // Auto/Mixed = Info
    case 0: return 'status-neutral'; // Aus = Neutral
    default: return '';
  }
};

onMounted(() => {
  heatpumpStore.fetchAllParameters();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style scoped>
.dashboard-page {
  padding: 20px;
  width: 100%;
  max-width: none;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Metro Grid Layout */
.metro-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  width: 100%;
  grid-auto-rows: 150px;
  grid-auto-flow: row dense;
}

/* Base Metro Tile */
.metro-tile {
  background: #0078d4;
  color: white;
  padding: 20px;
  border-radius: 0;
  border: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.metro-tile:hover {
  transform: scale(1.05);
  z-index: 10;
}

.metro-tile h2 {
  margin: 0;
  font-size: 3rem;
  font-weight: 100;
  line-height: 1;
}

.metro-tile h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 300;
  line-height: 1.2;
}

.metro-tile h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.2;
}

.metro-tile p {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 300;
  opacity: 0.9;
}

.metro-tile small {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-top: 5px;
}

/* Tile Sizes */
.small-tile {
  grid-column: span 1;
  grid-row: span 1;
}

.medium-tile {
  grid-column: span 2;
  grid-row: span 1;
}

.large-tile {
  grid-column: span 2;
  grid-row: span 2;
}

.wide-tile {
  grid-column: span 3;
  grid-row: span 1;
}

.full-width-tile {
  grid-column: 1 / -1;
  grid-row: span 3;
}

/* Specific Tile Colors */
.temperature-tile {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.status-tile {
  background: #2d89ef;
}

.tile-success {
  background: #00a300 !important;
}

.tile-error {
  background: #e51400 !important;
}

.compressor-tile {
  background: #ff6900;
}

.tile-active {
  background: #00a300 !important;
}

.tile-inactive {
  background: #737373 !important;
}

.room-temp-tile {
  background: #1ba1e2;
}

.flow-temp-tile {
  background: #a4c400;
}

.return-temp-tile {
  background: #60a917;
}

.hot-water-tile {
  background: #fa6800;
}

.info-tile {
  background: #6a00ff;
}

.parameters-tile {
  background: #2b2b2b;
  padding: 30px;
}

.loading-tile {
  background: #2d89ef;
  text-align: center;
  justify-content: center;
  align-items: center;
}

.error-tile {
  background: #e51400;
  text-align: center;
  justify-content: center;
  align-items: center;
}

/* Parameters Masonry Layout */
.parameters-masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  width: 100%;
  margin-top: 20px;
}

.parameter-card {
  background: #404040;
  padding: 15px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: background-color 0.2s;
}

.parameter-card:hover {
  background: #4a4a4a;
}

.parameter-card strong {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1.3;
}

.parameter-card span {
  color: #0078d4;
  font-size: 1.1rem;
  font-weight: 600;
}

/* Loading and Error States */
.loading-indicator,
.error-message,
.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* Responsive Design */
@media (max-width: 1068px) {
  .metro-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    grid-auto-rows: 120px;
    gap: 8px;
  }
  
  .large-tile {
    grid-column: span 2;
    grid-row: span 2;
  }
  
  .medium-tile {
    grid-column: span 2;
    grid-row: span 1;
  }
  
  .wide-tile {
    grid-column: span 2;
    grid-row: span 1;
  }
  
  .metro-tile h2 {
    font-size: 2rem;
  }
  
  .parameters-masonry {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .metro-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 100px;
  }
  
  .large-tile {
    grid-column: span 2;
    grid-row: span 2;
  }
  
  .medium-tile,
  .wide-tile {
    grid-column: span 2;
    grid-row: span 1;
  }
  
  .metro-tile h2 {
    font-size: 1.5rem;
  }
  
  .metro-tile h3 {
    font-size: 1.2rem;
  }
}
</style>