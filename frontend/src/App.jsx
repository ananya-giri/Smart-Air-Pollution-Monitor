import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { AlertTriangle, Activity, Wind, Cloud } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_URL = 'http://localhost:5000/api/pollution';

const ALL_CITIES = ['Kolkata', 'Delhi', 'Chennai', 'Mumbai', 'Bangalore', 'Shillong'];

const CITY_COLORS = {
  'Kolkata': '#38bdf8',
  'Delhi': '#ef4444',
  'Chennai': '#eab308',
  'Mumbai': '#a855f7',
  'Bangalore': '#22c55e',
  'Shillong': '#f97316'
};

function App() {
  const [currentData, setCurrentData] = useState([]);
  const [historyData, setHistoryData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchCurrentData = async () => {
    try {
      const res = await axios.get(`${API_URL}/current`);
      setCurrentData(res.data); // data comes back sorted from the backend
      setLoading(false);
    } catch (error) {
      console.error("Error fetching current data", error);
    }
  };

  const fetchAllHistoryData = async () => {
    try {
      const promises = ALL_CITIES.map(city => axios.get(`${API_URL}/history/${city}`));
      const responses = await Promise.all(promises);
      const newHistory = {};
      ALL_CITIES.forEach((city, i) => {
        newHistory[city] = responses[i].data;
      });
      setHistoryData(newHistory);
    } catch (error) {
      console.error(`Error fetching history data`, error);
    }
  };

  useEffect(() => {
    fetchCurrentData();
    const interval = setInterval(() => {
      fetchCurrentData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchAllHistoryData();
      const interval = setInterval(() => {
        fetchAllHistoryData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const getAqiColor = (aqi) => {
    if (aqi <= 50) return 'var(--green)';
    if (aqi <= 100) return 'var(--yellow)';
    if (aqi <= 150) return 'var(--orange)';
    if (aqi <= 200) return 'var(--red)';
    return 'var(--purple)';
  };

  const getAqiLabel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // Determine x-axis labels from the longest history dataset (or first city)
  let labels = [];
  if (historyData[ALL_CITIES[0]] && historyData[ALL_CITIES[0]].length > 0) {
      labels = historyData[ALL_CITIES[0]].map(d => new Date(d.timestamp).toLocaleTimeString());
  }

  const chartData = {
    labels: labels,
    datasets: ALL_CITIES.map(city => ({
      fill: false,
      label: `AQI - ${city}`,
      data: historyData[city] ? historyData[city].map(d => d.aqi) : [],
      borderColor: CITY_COLORS[city] || '#ffffff',
      backgroundColor: CITY_COLORS[city] || '#ffffff',
      tension: 0.4,
      pointRadius: 1,
      borderWidth: 2,
    }))
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top', 
        labels: { 
          color: '#f8fafc',
          usePointStyle: true,
          pointStyle: 'circle'
        } 
      },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' }, beginAtZero: true },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', maxTicksLimit: 8 } }
    },
    animation: {
        duration: 0
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const alerts = currentData.filter(d => d.aqi > 150);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header>
        <h1>Smart Air Monitor</h1>
        <p>Global Pollution Tracking System (SDG 3 & 13)</p>
        <div className="live-indicator">
          <div className="live-dot"></div> Live Multi-Sensor Data Feed
        </div>
      </header>

      <div className="stats-grid">
        {currentData.map(data => (
          <div 
            key={data.city} 
            className="glass-panel stat-card"
            style={{ 
              borderLeft: `4px solid ${CITY_COLORS[data.city] || '#38bdf8'}`,
            }}
          >
            <div className="city-name">
              {data.city}
              <Cloud size={20} color={getAqiColor(data.aqi)} />
            </div>
            <div className="aqi-value" style={{ color: getAqiColor(data.aqi) }}>
              {data.aqi}
            </div>
            <div className="aqi-label" style={{ color: getAqiColor(data.aqi) }}>
              {getAqiLabel(data.aqi)}
            </div>
            
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">PM2.5 (µg/m³)</span>
                <span className="detail-val">{data.pm25}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">PM10 (µg/m³)</span>
                <span className="detail-val">{data.pm10}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="main-content">
        <div className="glass-panel chart-section">
          <div className="section-title">
            <Activity size={20} className="text-accent" />
            Comparative Pollution Trajectory (All Cities)
          </div>
          <div style={{ height: '85%' }}>
            {labels.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <p>Loading chart data...</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel alerts-section">
          <div className="section-title">
            <AlertTriangle size={20} color="var(--red)" />
            High Pollution Alerts
          </div>
          <div className="alerts-list">
            {alerts.length > 0 ? (
              alerts.map(alert => (
                <div key={alert.city} className="alert-item">
                  <h4>{alert.city} Air Quality Critical</h4>
                  <p>AQI is at {alert.aqi}. Vulnerable populations should avoid outdoor exertion.</p>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <CheckCircle size={40} style={{ margin: '0 auto 1rem', color: 'var(--green)' }} />
                <p>No critical alerts right now. Air quality is fair in tracked regions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle(props) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

export default App;
