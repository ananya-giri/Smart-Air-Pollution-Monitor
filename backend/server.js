require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mqtt = require('mqtt');
const SensorData = require('./models/SensorData');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const cities = ['Kolkata', 'Delhi', 'Chennai', 'Mumbai', 'Bangalore', 'Shillong'];
let memoryData = [];

// ======= MQTT SUBSCRIBER SETUP =======
// Replace with your HiveMQ Cloud broker url for production: e.g. 'mqtts://<cluster-id>.hivemq.cloud:8883'
const brokerUrl = 'mqtt://broker.hivemq.com';
const topic = 'smart-pollution-dashboard/sensors/data';

const mqttClient = mqtt.connect(brokerUrl);

mqttClient.on('connect', () => {
    console.log(`🔌 Backend (Subscriber) connected to MQTT Broker at ${brokerUrl}`);
    mqttClient.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
            console.error(`❌ Failed to subscribe to topic: ${topic}`, err);
        } else {
            console.log(`✅ Subscribed to topic: ${topic}`);
        }
    });
});

mqttClient.on('error', (err) => {
    console.error(`❌ MQTT connection error:`, err);
});

mqttClient.on('message', async (receivedTopic, message) => {
    if (receivedTopic === topic) {
        try {
            const sensorReading = JSON.parse(message.toString());
            console.log(`📥 Received data from MQTT topic [${sensorReading.city} AQI: ${sensorReading.aqi}]`);
            
            // Check if MongoDB is currently fully connected (readyState === 1)
            if (mongoose.connection.readyState === 1) {
                try {
                    await SensorData.create(sensorReading);
                } catch(e) {
                    console.error("DB Save Error:", e);
                }
            } else {
                // Fallback to memory
                memoryData.push(sensorReading);
                if (memoryData.length > 2000) memoryData.shift();
            }
        } catch (error) {
            console.error('Error processing MQTT message:', error);
        }
    }
});
// =====================================

// Routes
// Get current pollution level for all cities (latest reading)
app.get('/api/pollution/current', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const latestData = await SensorData.aggregate([
                { $sort: { timestamp: -1 } },
                { $group: { _id: "$city", doc: { $first: "$$ROOT" } } },
                { $replaceRoot: { newRoot: "$doc" } },
                { $sort: { city: 1 } } // Keep order strictly alphabetical to prevent UI jumping
            ]);
            res.json(latestData);
        } else {
            const latestData = cities.map(city => {
                const cityData = memoryData.filter(d => d.city === city);
                return cityData[cityData.length - 1] || null;
            }).filter(Boolean);
            res.json(latestData);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get historical data for a specific city
app.get('/api/pollution/history/:city', async (req, res) => {
    try {
        const { city } = req.params;
        if (mongoose.connection.readyState === 1) {
            const history = await SensorData.find({ city }).sort({ timestamp: 1 }).limit(30);
            res.json(history);
        } else {
            // For charting to work correctly with fallback, we need enough data points
            const history = memoryData.filter(d => d.city === city).slice(-30);
            res.json(history);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

if (process.env.MONGO_URI && process.env.MONGO_URI !== "mongodb+srv://<username>:<password>@cluster0.mongodb.net/pollution-db?retryWrites=true&w=majority") {
    mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
        .then(() => {
            console.log('✅ MongoDB ATLAS connected successfully!');
            app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} with MongoDB`));
        })
        .catch(err => {
            console.error('❌ MongoDB authentication failed! Check your username/password in .env. Falling back to local memory mode temporarily.');
            app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} with in-memory fallback`));
        });
} else {
    console.log('No valid MONGO_URI found, using in-memory mock data array as fallback.');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} with in-memory fallback`));
}
