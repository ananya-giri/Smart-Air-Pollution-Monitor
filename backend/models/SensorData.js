const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  city: { type: String, required: true },
  aqi: { type: Number, required: true },
  pm25: { type: Number, required: true },
  pm10: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
