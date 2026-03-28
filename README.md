# 🌍 Smart Air Pollution Monitoring Dashboard (IoT Cloud)

A full-stack, real-time IoT application designed to track, monitor, and visualize the environmental impact of major Indian cities. This project integrates live data from public weather stations and seamlessly routes it through an enterprise MQTT broker down to a beautiful, glassmorphic React dashboard.

---

## 🎯 Sustainable Development Goals (SDG) Targeted
This architecture aligns directly with two of the United Nations' primary SDGs:
* **SDG 3:** *Good Health and Well-being* — Reducing illnesses by providing transparent, up-to-the-minute information on hazardous air pollutants.
* **SDG 13:** *Climate Action* — Identifying severe environmental trajectories and air quality index (AQI) trends over time.

---

## ✨ Key Features
* **Real-World API Engine:** Pulls exact, live US-AQI, PM2.5, and PM10 metrics from the powerful Open-Meteo Air Quality API.
* **Live Micro-Jitter Trajectory:** Simulates live sub-second hardware pulses on top of the hourly base-state api data to provide a dynamic tracking feel without getting rate-limited.
* **MQTT Enterprise Pub/Sub:** Decouples the frontend layout from the data generation. The sensors (Publisher) push payloads to `broker.hivemq.com` where the backend Server (Subscriber) intercepts them instantly.
* **Graceful Database Fallbacks:** Configured to push live telemetry to a **MongoDB Atlas Cloud Database**. If the database goes offline or the password is changed, the server instantly falls back to an uninterrupted in-memory array to ensure the viewer's dashboard graphs never freeze or crash.
* **Comparative Multi-Line Charting:** Displays simultaneous, color-coded trajectory graphings using `react-chartjs-2` to allow immediate geographical comparisons.
* **Glassmorphic UI Engine:** Gorgeous aesthetic employing backdrop-filters, custom responsive grid snapping, CSS custom properties, and intuitive Lucide-React iconographic alerts.

---

## 🏗 System Architecture 

**Data Flow:**
`[ Open-Meteo API ] ➔ [ publisher.js ] ➔ [ HiveMQ Broker ] ➔ [ server.js (Subscriber) ] ➔ [ MongoDB ] ➔ [ React Dashboard ]`

### Technologies Used:
* **Frontend Interface:** React, Vite, Axios, Chart.js.
* **Backend API & Sub:** Node.js, Express, Mongoose.
* **Database Pipeline:** MongoDB Atlas (NoSQL).
* **Protocol & Telemetry:** MQTT (via HiveMQ open cloud broker).

---

## 🚀 How to Run Locally

### 1. Configure the Backend (Subscriber)
Open a terminal in the `/backend` folder.
```bash
npm install
# Create a .env file and add your MongoDB Atlas string (Optional!)
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/pollution-db
npm start
```
*Note: If no .env is provided, it automatically falls back to local memory without crashing.*

### 2. Boot the IoT Simulator (Publisher)
Open a **new** terminal in the `/backend` folder.
```bash
node publisher.js
```
*This starts fetching Open-Meteo data automatically and pushing it through MQTT.*

### 3. Launch the Dashboard (Frontend)
Open a terminal in the`/frontend` folder.
```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to view the live dashboard!

---
*Built with ❤️ for a cleaner, smarter planet.*
