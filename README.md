
# HtREST Monitor

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An intuitive and functional Web User Interface (Monitor) for monitoring and controlling a Heliotherm heatpump system via the `HtREST` REST API.

## Table of Contents

-   [About The Project](#about-the-project)
-   [Features](#features)
-   [Technologies Used](#technologies-used)
-   [Architecture Overview](#architecture-overview)
    -   [State Management (Pinia Stores)](#state-management-pinia-stores)
    -   [API Layer](#api-layer)
    -   [Routing & Authentication](#routing--authentication)
    -   [Key Pages](#key-pages)
    -   [Component Structure](#component-structure)
-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
-   [Development Commands](#development-commands)
-   [Configuration](#configuration)
-   [Deployment](#deployment)
-   [Recommended IDE Setup](#recommended-ide-setup)
-   [Security Considerations](#security-considerations)
-   [Optional / Future Enhancements](#optional--future-enhancements)
-   [Acknowledgments & References](#acknowledgments--references)
-   [License](#license)

---

## About The Project

The `HtREST Monitor` is a modern Vue 3 application built with Vite, designed to provide real-time monitoring and control capabilities for Heliotherm heatpump systems. It interacts directly with the `HtREST` REST API (refer to [dstrigl/HtREST](https://github.com/dstrigl/HtREST) for API details) to display live status, allow parameter adjustments, and manage system operations.

The primary goal is to offer an intuitive and functional interface that empowers users to oversee their heatpump's status and basic configurations from any device.

## Features

This application provides the following core functionalities, designed to meet the requirements outlined in the project's specification (`Pflichtenheft.md`):

-   **Live Status Dashboard (`ANF-F-001` - `ANF-F-007`)**:
    -   Displays real-time values from the `/values` endpoint.
    -   Shows internal and external temperatures.
    -   Presents flow and return temperatures.
    -   Indicates compressor and heating/cooling status.
    -   Alerts for any active alarms or error messages.
    -   Automatically refreshes displayed data every 30-60 seconds.
    -   Status indicators are color-coded (e.g., Green = OK, Red = Error) (`ANF-NF-005`).

-   **Parameter Viewer (`ANF-F-008` - `ANF-F-010`)**:
    -   Retrieves and displays current system parameters from the `/parameters` endpoint.
    -   Provides read-only access to advanced configurations.
    -   Includes optional tooltips/explanations for technical terms.

-   **System Control Panel (`ANF-F-011` - `ANF-F-015`)**:
    -   Enables sending control commands via the `/set` endpoint.
    -   Allows adjustment of target temperatures.
    -   Supports changing the operating mode (Heating/Cooling/Standby).
    -   Configures domestic hot water temperature settings.
    -   Implements input validation for numerical ranges and enumerated modes.

-   **API Tester (Admin-only) (`ANF-F-018`)**:
    -   A dedicated view for developers/administrators to execute raw API commands (e.g., `GET /values`, `POST /set`).

-   **Temperature Visualization (`ANF-F-017`)**:
    -   Utilizes Chart.js with `vue-chartjs` for graphical representation of temperature trends over time (`ANF-NF-004`).

-   **Responsive UI (`ANF-NF-001`)**:
    -   The user interface is designed to be responsive and user-friendly across both mobile and desktop devices.

-   **Clear & Grouped UI (`ANF-NF-003`)**:
    -   Employs clear labeling and groups values by zones/functions for enhanced usability.

-   **Authentication & Login (`ANF-NF-012`, `ANF-NF-013`)**:
    -   Supports Basic Auth or Token Auth for secure access.
    -   Provides a dedicated login interface or token input field.

## Technologies Used

The project is built using a modern frontend stack:

-   **Frontend Framework**: [Vue 3](https://vuejs.org/) (with Composition API)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **State Management**: [Pinia](https://pinia.vuejs.org/)
-   **Routing**: [Vue Router](https://router.vuejs.org/)
-   **API Communication**: [Axios](https://axios-http.com/)
-   **Charting Library**: [Chart.js](https://www.chartjs.org/) with [vue-chartjs](https://vue-chartjs.org/) bindings

## Architecture Overview

This section details the key architectural components of the `htrest-monitor` application.

### State Management (Pinia Stores)

Pinia is used for reactive state management, providing a centralized store for application data. Key stores include:

-   `auth.js`: Handles user authentication, including Basic Auth and secure token storage in `localStorage`.
-   `heatpump.js`: Manages the fetching and state of heatpump-related data from the API.

### API Layer

The application's interaction with the `HtREST` API is encapsulated in `htrest.js`:

-   An Axios instance is configured to communicate with the `HtREST` API. The default base URL is `http://192.168.0.71:8777/api/v1`. This can be overridden via environment variables (see [Configuration](#configuration)).
-   A **request interceptor** automatically adds the authentication token (retrieved from `localStorage`) to outgoing API requests.
-   A **response interceptor** handles 401 (Unauthorized) errors, typically redirecting the user to the login page.
-   Pre-configured API functions are provided for common operations, such as `getFastQueryValues()`, `getParameters()`, `setParameter()`, and `getFaultList()`.

### Routing & Authentication

Vue Router manages navigation within the application and includes authentication guards to protect routes:

-   Unauthenticated users attempting to access protected routes are redirected to `/login`.
-   Authenticated users trying to access `/login` are automatically redirected to `/dashboard`.
-   Specific routes, such as `/api-tester`, require an `requiresAdmin: true` meta property, enforcing admin-level access.

### Key Pages

The application is structured around the following main pages:

-   `/` (Dashboard): Provides live status updates and temperature charts.
-   `/control`: The interface for sending system control commands.
-   `/parameters`: Allows viewing and editing of heatpump parameters.
-   `/api-tester`: An administrative interface for direct API interaction.

### Component Structure

The frontend components are organized into logical directories for maintainability:

-   `components/auth/`: Contains components related to user login and authentication.
-   `components/controls/`: Houses components for managing system control operations.
-   `components/dashboard/`: Includes components for displaying live monitoring data.
-   `components/parameters/`: Manages components for parameter viewing and editing.
-   `components/shared/`: A collection of reusable UI components used throughout the application.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Ensure you have Node.js and npm (Node Package Manager) installed on your system.

-   Node.js (>= 18.0.0, or >= 20.0.0, or >= 22.0.0)
-   npm (comes with Node.js)

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/agilastic/htrest-monitor.git
    cd htrest-monitor
    ```
2.  Install NPM dependencies:
    ```sh
    npm install
    ```

## Development Commands

Run the following commands in your project directory:

-   **Install dependencies**:
    ```bash
    npm install
    ```

-   **Run development server with hot reload**:
    Starts the development server, making the application accessible locally, usually at `http://localhost:5173/`. Changes to the code will hot-reload in the browser.
    ```bash
    npm run dev
    ```

-   **Build for production**:
    Compiles and minifies the application for production deployment, creating optimized HTML, CSS, and JavaScript files in the `dist/` directory.
    ```bash
    npm run build
    ```

-   **Preview production build**:
    Serves the static files from the `dist/` directory, allowing you to preview the production-ready application locally.
    ```bash
    npm run preview
    ```

## Configuration

The base URL for the `HtREST` API is configurable.

-   **`VITE_HTREST_API_BASE_URL`**:
    To override the default API endpoint (`http://192.168.0.71:8777/api/v1`), create a `.env` file (e.g., `.env.local`) in the project root and set the variable:

    ```
    VITE_HTREST_API_BASE_URL=http://your-heatpump-ip:port/api/v1
    ```
    Vite automatically loads `.env` variables prefixed with `VITE_`.

## Deployment

The application is designed to be built as a static site, making it easy to deploy on various web servers like Nginx.

1.  Run the build command:
    ```bash
    npm run build
    ```
2.  The optimized static files will be generated in the `dist/` directory.
3.  Serve the contents of the `dist/` directory using your preferred static file server (e.g., Nginx, Apache, or a CDN).

## Recommended IDE Setup

For the best development experience, we recommend using [VSCode](https://code.visualstudio.com/) with the following extensions and settings:

-   **[Volar (Vue.volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)**: The official VSCode extension for Vue 3. **Ensure you disable Vetur** if you have it installed, as Volar replaces it.

-   **File Nesting**: To keep your file explorer tidy, file nesting is enabled with the following patterns in your `.vscode/settings.json`:
    ```json
    {
      "explorer.fileNesting.enabled": true,
      "explorer.fileNesting.patterns": {
        "tsconfig.json": "tsconfig.*.json, env.d.ts",
        "vite.config.*": "jsconfig*, vitest.config.*, cypress.config.*, playwright.config.*",
        "package.json": "package-lock.json, pnpm*, .yarnrc*, yarn*, .eslint*, eslint*, .oxlint*, oxlint*, .prettier*, prettier*, .editorconfig"
      }
    }
    ```
    This helps group related files under a primary file (e.g., `package-lock.json` nested under `package.json`).

## Security Considerations

-   **Authentication**: The application supports Basic Auth or Token Auth. It provides a dedicated login UI for credentials or token input.
-   **Sensitive Data Storage**: Authentication information (e.g., tokens) is stored in `localStorage`. While convenient for single-page applications, be aware that `localStorage` is accessible via JavaScript and can be vulnerable to XSS attacks. Ensure appropriate security measures are in place on the server-side to mitigate risks.

## Optional / Future Enhancements

The following features are considered optional and may be implemented in future development phases:

-   **WebSocket/Long Polling Integration (`OPT-001`)**: To enable real-time updates without relying on periodic polling, if the `HtREST` API provides WebSocket or long-polling capabilities.
-   **Offline/Error Fallback (`OPT-002`)**: Implement caching mechanisms to display last-known data when the API is unreachable.
-   **PWA Support (`OPT-003`)**: Transform the application into a Progressive Web App for an installable, app-like experience.
-   **MQTT Integration (`OPT-004`)**: Explore MQTT for real-time data streaming if supported by the backend infrastructure.

## Acknowledgments & References

-   This project is built to interface with the [HtREST API](https://github.com/dstrigl/HtREST).
-   Inspired by the detailed requirements laid out in `Pflichtenheft.md`.

## License

Distributed under the MIT License. See `LICENSE` for more information.

---