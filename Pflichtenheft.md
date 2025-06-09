

## Pflichtenheft: HtREST Web UI

**Projektname:** HtREST Web UI
**Datum:** 07. Juni 2025
**Version:** 1.0

---

### 1. Einleitung

Dieses Pflichtenheft beschreibt die detaillierten Anforderungen an die Entwicklung einer Web-Benutzeroberfläche (Web UI) zur Überwachung und Steuerung eines Heliotherm Wärmepumpensystems über die `HtREST` REST API siehe https://github.com/dstrigl/HtREST . Es dient als verbindliche Grundlage für die Entwicklung und Abnahme des Systems.

### 2. Zielbestimmung

Das Hauptziel ist die Erstellung einer intuitiven und funktionalen Web UI, die es Benutzern ermöglicht, den Status der Wärmepumpe in Echtzeit zu überwachen und grundlegende Systemparameter über eine konfigurierbare `HtREST` API zu steuern.

### 3. Funktionale Anforderungen

Die Web UI muss die folgenden Funktionen bereitstellen:

#### 3.1 Live-Status-Dashboard
*   **ANF-F-001:** Anzeige von Echtzeitwerten vom `/values` (oder vergleichbaren) Endpunkt. (https://github.com/dstrigl/HtREST)
*   **ANF-F-002:** Anzeige der Innen- und Außentemperatur.
*   **ANF-F-003:** Anzeige der Vor- und Rücklauftemperaturen.
*   **ANF-F-004:** Anzeige des Kompressorstatus.
*   **ANF-F-005:** Anzeige des Heiz-/Kühlstatus.
*   **ANF-F-006:** Anzeige aller Alarme oder Fehlermeldungen.
*   **ANF-F-007:** Automatische Aktualisierung der angezeigten Werte alle 30–60 Sekunden.

#### 3.2 Parameter-Viewer
*   **ANF-F-008:** Abrufen und Anzeigen der aktuellen Parameter vom `/parameters` (oder vergleichbaren) Endpunkt.
*   **ANF-F-009:** Bereitstellung eines Nur-Lese-Zugriffs auf erweiterte Konfigurationen.
*   **ANF-F-010:** Optionale Tooltips/Erklärungen für technische Begriffe.

#### 3.3 System-Kontrollpanel
*   **ANF-F-011:** Ermöglichung des Sendens von Steuerbefehlen über den `/set` (oder vergleichbaren) Endpunkt.
*   **ANF-F-012:** Steuerung der Zieltemperatur.
*   **ANF-F-013:** Änderung des Betriebsmodus (Heizen/Kühlen/Standby).
*   **ANF-F-014:** Einstellung der Warmwassertemperatur.
*   **ANF-F-015:** Implementierung einer Eingabeprüfung (z.B. numerische Bereiche, Enums für Modi).

#### 3.4 Protokoll- und Verlaufsanzeige (optional, falls API unterstützt)
*   **ANF-F-016:** Anzeige der letzten Protokolle oder Betriebsdaten.
*   **ANF-F-017:** Verwendung von Diagrammen zur Visualisierung von Trends (z.B. Temperatur über die Zeit).

#### 3.5 Manueller API-Tester (Erweitert)
*   **ANF-F-018:** Bereitstellung einer Entwickler-/Administratoransicht für die Ausführung von Roh-API-Befehlen (z.B. `GET /values`, `POST /set`).

### 4. Nicht-funktionale Anforderungen

#### 4.1 UI/UX Anforderungen
*   **ANF-NF-001 (Responsivität):** Die Benutzeroberfläche muss auf Mobilgeräten und Desktops responsiv und benutzerfreundlich sein.
*   **ANF-NF-002 (Theme):** Eine optionale Umschaltmöglichkeit zwischen einem dunklen und hellen Modus ist zu implementieren.
*   **ANF-NF-003 (Klarheit):** Die UI muss klare Beschriftungen verwenden und Werte nach Zonen/Funktionen gruppieren.
*   **ANF-NF-004 (Diagramme):** Diagramme sind mit Chart.js, Recharts oder ApexCharts zu erstellen.
*   **ANF-NF-005 (Statusindikatoren):** Statusanzeigen müssen farbcodiert sein (z.B. Grün = OK, Rot = Fehler).

#### 4.2 Technische Anforderungen
*   **ANF-NF-006 (Frontend Framework):** Es ist vue.js zu verwenden (bevorzugt). Alternativen sind Vue.js oder Svelte.
*   **ANF-NF-007 (API Client):** Axios oder die native Fetch API sind für API-Anfragen zu verwenden.
*   **ANF-NF-008 (State Management):** Pinia sind für das Zustandsmanagement zu verwenden.
*   **ANF-NF-009 (API URL):** Die Basis-URL der API muss konfigurierbar sein.
*   **ANF-NF-010 (Build Tooling):** Vite ist  für das Build-Management zu verwenden.
*   **ANF-NF-011 (Deployment):** Die Anwendung muss als statische Site (HTML/JS/CSS) für Nginx oder ähnliche Server exportierbar sein.

#### 4.3 Sicherheitsanforderungen
*   **ANF-NF-012 (Authentifizierung):** Unterstützung von Basic Auth oder Token Auth ist erforderlich.
*   **ANF-NF-013 (Login UI):** Bereitstellung einer Login-Benutzeroberfläche oder eines Token-Eingabefeldes.
*   **ANF-NF-014 (Sichere Speicherung):** Authentifizierungsinformationen sind sicher zu speichern (z.B. `localStorage` mit entsprechenden Warnungen).

### 5. Schnittstellen

*   **API-Schnittstelle:** Die Web UI kommuniziert ausschließlich über die `HtREST` REST API (referenziert über [https://github.com/dstrigl/HtREST](https://github.com/dstrigl/HtREST)).
    *   Verwendung von `GET`-Anfragen für Leseoperationen (z.B. `/api/v1/fastquery`, `/api/v1/param`).
    *   Verwendung von `PUT` (oder `POST`) -Anfragen für Schreiboperationen (z.B. zum Setzen von Parametern über `/api/v1/param`).

### 6. Optionale Features

Die folgenden Funktionen sind optional und können in einer späteren Phase implementiert werden:

*   **OPT-001 (WebSocket/Long Polling):** Live-Updates ohne Polling (falls HtREST dies unterstützt).
*   **OPT-002 (Offline/Error Fallback):** Zwischengespeicherte Anzeige, wenn die API nicht erreichbar ist.
*   **OPT-003 (PWA Support):** Unterstützung als installierbare Web-App.
*   **OPT-004 (MQTT Integration):** Optionale Echtzeit-Updates, wenn das Backend dies ermöglicht.

### 7. Lieferumfang

Die folgenden Komponenten sind als Ergebnis des Projekts zu liefern:

*   **DEL-001:** Die Web UI Frontend-Anwendung, die alle in Abschnitt 3 beschriebenen Funktionen (Dashboard, Steuerungen, Parameter-Viewer, Einstellungen, Fehlerbehandlung) abdeckt.
*   **DEL-002:** Eine umfassende `README.md`-Datei mit detaillierten Einrichtungs- und Installationsanweisungen.

### 8. Abnahmekriterien

Die Abnahme des Systems erfolgt auf Basis der Erfüllung aller in Abschnitt 3 und 4 definierten Pflichtanforderungen sowie der erfolgreichen Durchführung von Testfällen, die die korrekte Funktionalität und die Einhaltung der technischen und UI/UX-Standards überprüfen.
