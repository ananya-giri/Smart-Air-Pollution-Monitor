# Project Report: Smart Air Pollution Monitoring Dashboard

## 1. Project Overview
The **Smart Air Pollution Monitoring Dashboard** is a cloud-based, real-time IoT architecture designed to track, record, and visualize the environmental impact of major Indian cities. It focuses on rendering complex sensory data into a beautifully designed, responsive graphical interface ensuring clear tracking of air quality indices.

### **SDGs Targeted:**
* **SDG 3:** Good Health and Well-being (reducing illnesses from hazardous air pollution).
* **SDG 13:** Climate Action (identifying severe environmental trajectories requiring mitigation).

### **Locations Monitored:**
Kolkata, Delhi, Chennai, Mumbai, Bangalore, and Shillong.

---

## 2. System Architecture
This project follows an industry-standard Enterprise IoT (Internet of Things) layout:

**[ Open-Meteo API ] ➔ [ IoT Publisher ] ➔ [ MQTT Broker ] ➔ [ Node.js Subscriber ] ➔ [ MongoDB Atlas ] ➔ [ React Dashboard ]**

### A. The IoT Publisher (`publisher.js`)
* Acts as the "hardware sensor" layer. 
* Periodically fetches 100% real-world, live Air Quality Index (US-AQI), PM2.5, and PM10 metrics using an external Open-Meteo API.
* Modulates the readings with micro-fluctuations to produce a continuous "live" feed data-stream without getting rate-limited by the APIs.
* Publishes the compiled JSON packets securely via the lightweight **MQTT Protocol**.

### B. The Message Broker (HiveMQ Cloud)
* The central cloud relay system that facilitates the sub-second transfer of messages asynchronously.
* `publisher.js` broadcasts data payloads to the topic: `smart-pollution-dashboard/sensors/data`.

### C. The API Subscriber & Database (`server.js` + MongoDB)
* The backend Node.js server permanently subscribes to the MQTT broker topic.
* Upon message interception, it seamlessly captures the data payload and commits it to a live cloud **MongoDB Atlas** database in real-time.
* Engineered with a safe "fallback mode": If the database loses authentication, the server instantly shunts the logic to fallback memory array storage so the primary frontend systems never crash.
* Exposes `HTTP GET` REST API endpoints (`/api/pollution/current` & `/history/`) so the client interfaces can pull the stored metrics efficiently.

### D. The React Frontend Dashboard
* Built on a blazing-fast **Vite + React** framework.
* Incorporates modern **Glassmorphism** CSS, dark-mode styling, and micro-animations for an ultra-premium aesthetic.
* Dynamically manages component states, rendering active alerts and dynamic icon coloring (Green, Yellow, Red, Purple) depending on how dangerous the air quality is.
* **Chart.js** integration builds a Comparative Multi-Line Tracking Trajectory over the X-Axis, allowing simultaneous visual analysis of pollution trends across all 6 cities.

---

## 3. Technology Stack Requirements
* **Frontend:** React, Vite, Axios, Chart.js, Lucide-React.
* **Backend:** Node.js, Express, Mongoose.
* **Database:** MongoDB Atlas (Cloud NoSQL).
* **Message Router:** MQTT package via HiveMQ open cloud broker.
* **External API:** Open-Meteo Air Quality API.

---

## 4. Future Scope
Because the project strictly adheres to distributed MQTT design patterns, it is extremely scalable. The simulated `publisher.js` can be completely stripped out and simply swapped with a real **Raspberry Pi, ESP8266, or Arduino** microcontroller dropped inside these real cities. So long as the physical chip connects to WiFi and pushes JSON to the HiveMQ topic `smart-pollution-dashboard/sensors/data`, the entire rest of the cloud ecosystem would instantly adopt the physical sensors without changing a single line of backend or dashboard code!
