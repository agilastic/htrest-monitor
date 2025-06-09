

## Development Commands

```bash
# Install dependencies
npm install

# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture Overview

This is a Vue 3 + Vite application for controlling and monitoring a heatpump system via the HtREST API. The app uses:

- **Vue 3** with Composition API
- **Pinia** for state management 
- **Vue Router** with authentication guards
- **Chart.js** with vue-chartjs for temperature visualization
- **Axios** for API communication

### State Management (Pinia Stores)

- `auth.js` - Handles authentication with Basic Auth, token storage in localStorage
- `heatpump.js` - Manages heatpump data fetching and state

### API Layer

The `htrest.js` file contains:
- Axios instance configured for HtREST API (default: http://192.168.0.71:8777/api/v1)
- Request interceptor adds auth token from localStorage
- Response interceptor handles 401 errors
- Pre-configured API functions: `getFastQueryValues()`, `getParameters()`, `setParameter()`, `getFaultList()`

### Routing & Authentication

Router includes authentication guards that:
- Redirect to `/login` if not authenticated
- Redirect to `/dashboard` if already logged in and accessing `/login`
- Admin routes require `requiresAdmin: true` meta property

### Key Pages

- `/` - Dashboard with live status and temperature charts
- `/control` - System control interface
- `/parameters` - Parameter viewer/editor
- `/api-tester` - Admin-only API testing interface

### Environment Variables

Set `VITE_HTREST_API_BASE_URL` to override the default API endpoint.

## Component Structure

- `components/auth/` - Login functionality
- `components/controls/` - System control components
- `components/dashboard/` - Live monitoring components 
- `components/parameters/` - Parameter management
- `components/shared/` - Reusable UI components

## Memories

- `app remove     /* margin: 0 auto;`