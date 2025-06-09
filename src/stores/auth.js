// src/stores/auth.js
import { defineStore } from 'pinia';
import { htrestApi } from '@/api/htrest'; // Importieren Sie die konfigurierte Axios-Instanz

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    // Speichert den Basic Auth String, der für den "admin:admin" Login generiert wird
    // Wird initial aus localStorage geladen
    token: localStorage.getItem('htrest_auth_token') || null,
  }),
  getters: {
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.isAuthenticated,
  },
  actions: {
    async login(username, password) {
      // Static credentials check
      if (username === 'admin' && password === 'admin') {
        const basicAuthString = btoa(`${username}:${password}`); // Erzeugt 'YWRtaW46YWRtaW4='

        this.token = basicAuthString;
        localStorage.setItem('htrest_auth_token', basicAuthString);
        this.isAuthenticated = true;

        // Stellen Sie sicher, dass der Axios-Standard-Header gesetzt wird,
        // damit zukünftige API-Anfragen den Auth-Header enthalten.
        htrestApi.defaults.headers.common['Authorization'] = `Basic ${this.token}`;

        console.log('Static login successful for admin!');
        return true;
      } else {
        // Bei fehlgeschlagenem Login
        this.isAuthenticated = false;
        this.token = null;
        localStorage.removeItem('htrest_auth_token');
        delete htrestApi.defaults.headers.common['Authorization']; // Auth-Header entfernen
        console.warn('Static login failed: Invalid credentials.');
        throw new Error('Ungültiger Benutzername oder Passwort.');
      }
    },
    logout() {
      this.isAuthenticated = false;
      this.token = null;
      localStorage.removeItem('htrest_auth_token');
      delete htrestApi.defaults.headers.common['Authorization']; // Sicherstellen, dass Header entfernt wird
      console.log('Logged out.');
      // Router-Push zur Login-Seite
      import('@/router').then(module => {
        if (module.default) {
          module.default.push('/login');
        }
      });
    },
    initializeAuth() {
      if (this.token) {
        // Beim Initialisieren prüfen, ob ein Token im localStorage ist.
        // Wenn ja, als authentifiziert markieren und den Axios-Header setzen.
        // Für diesen statischen Fall gehen wir davon aus, dass der gespeicherte Token
        // von einem erfolgreichen 'admin:admin' Login stammt.
        this.isAuthenticated = true;
        htrestApi.defaults.headers.common['Authorization'] = `Basic ${this.token}`;
        console.log('Auth initialized with existing token.');
      }
    }
  },
});
