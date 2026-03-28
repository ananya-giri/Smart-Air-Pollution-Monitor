const mqtt = require('mqtt');
const axios = require('axios');

// Connect to HiveMQ Public Broker
const brokerUrl = 'mqtt://broker.hivemq.com';
const topic = 'smart-pollution-dashboard/sensors/data';

const client = mqtt.connect(brokerUrl);

const citiesData = [
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
    { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
    { name: 'Shillong', lat: 25.5788, lon: 91.8933 }
];
let memoryData = [];

client.on('connect', () => {
    console.log(`📡 Publisher (Real IoT Integration) connected to MQTT Broker at ${brokerUrl}`);
    
    // Fetch and publish real data every 10 seconds
    setInterval(fetchAndPublishRealData, 10000);
    fetchAndPublishRealData(); // Initial call
});

client.on('error', (err) => {
    console.error(`❌ MQTT connection error:`, err);
});

// Fetch REAL Data using Open-Meteo API (No API Key Required!)
// Or you can swap with OpenWeather API if you prefer by changing the URL
const fetchAndPublishRealData = async () => {
    try {
        const lats = citiesData.map(c => c.lat).join(',');
        const lons = citiesData.map(c => c.lon).join(',');

        // 1 API Request to get all 6 cities instantly to respect API limits
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=us_aqi,pm10,pm2_5`;
        
        const response = await axios.get(url);
        const dataArray = response.data; // Open-Meteo returns an array of objects if multiple points are requested

        citiesData.forEach((city, index) => {
            // Open-Meteo structure for multiple locations: array of objects
            const cityApiData = dataArray[index].current;
            
            // To maintain a live feel on the chart even when the real-world hourly sensor hasn't updated, 
            // we will add a tiny ±1 micro-fluctuation to the real-world baseline.
            const addNoise = (val) => Math.max(0, val + (Math.floor(Math.random() * 3) - 1));

            const newData = {
                city: city.name,
                aqi: addNoise(cityApiData.us_aqi) || 50,
                pm25: addNoise(cityApiData.pm2_5) || 12,
                pm10: addNoise(cityApiData.pm10) || 20,
                timestamp: new Date()
            };

            memoryData.push(newData);
            if (memoryData.length > 1000) memoryData.shift();

            // Send REAL data over MQTT
            client.publish(topic, JSON.stringify(newData), { qos: 1 }, (err) => {
                if (err) {
                    console.error(`Failed to publish real data for ${city.name}:`, err);
                } else {
                    console.log(`🌍 Published REAL impact data for ${city.name} (US-AQI: ${newData.aqi}, PM2.5: ${newData.pm25})`);
                }
            });
        });
    } catch (error) {
        console.error("❌ Failed to fetch real API data. Make sure internet is connected.", error.message);
    }
};
