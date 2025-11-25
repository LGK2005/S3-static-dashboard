import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useState, useEffect } from 'react'

// --- CONFIGURATION ---
const API_BASE_URL = 'https://staticdashboard.website/'; 

function App() {
  const [activeTab, setActiveTab] = useState('guardduty');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const endpoints = {
    guardduty: '/logs/guardduty?limit=50',
    cloudtrail: '/logs/cloudtrail?limit=50',
    vpc: '/logs/vpc?limit=50'
  };

  const fetchData = async (tab) => {
    setLoading(true);
    setError(null);
    setData([]);

    try {
      const url = `${API_BASE_URL}${endpoints[tab]}`;
      console.log(`Fetching: ${url}`);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle Athena response format (ResultSet vs direct array)
      const items = result.ResultSet ? parseAthenaResult(result.ResultSet) : (Array.isArray(result) ? result : []);
      
      setData(items);

    } catch (err) {
      console.error("Fetch error:", err);
      // Friendly error message for common issues
      if (err.message.includes('Failed to fetch')) {
        setError("Network Error: Could not connect to API. This is usually due to CORS issues (CloudFront/API Gateway configuration) or an incorrect API URL.\n" + err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const parseAthenaResult = (resultSet) => {
    const rows = resultSet.Rows;
    if (!rows || rows.length < 2) return [];

    const headers = rows[0].Data.map(col => col.VarCharValue);
    
    return rows.slice(1).map(row => {
      let obj = {};
      row.Data.forEach((col, index) => {
        obj[headers[index]] = col.VarCharValue || "";
      });
      return obj;
    });
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  return (
    <div className="dashboard-container">

      <header className="dashboard-header">
        <h1>🛡️ Incident Response Dashboard</h1>
        <div className="status-indicator">
          <span style={{height: '10px', width: '10px', backgroundColor: '#10b981', borderRadius: '50%'}}></span>
          System Online
        </div>
      </header>

      <div className="controls">
        <div className="tabs">
          <button 
            className={activeTab === 'guardduty' ? 'active' : ''} 
            onClick={() => setActiveTab('guardduty')}
          >
            GuardDuty Findings
          </button>
          <button 
            className={activeTab === 'cloudtrail' ? 'active' : ''} 
            onClick={() => setActiveTab('cloudtrail')}
          >
            CloudTrail Logs
          </button>
          <button 
            className={activeTab === 'vpc' ? 'active' : ''} 
            onClick={() => setActiveTab('vpc')}
          >
            VPC Traffic
          </button>
        </div>
        <button className="refresh-btn" onClick={() => fetchData(activeTab)}>
          🔄 Refresh Data
        </button>
      </div>

      <main className="content-area">
        {error && (
          <div className="error-message">
            <h3>⚠️ Unable to Load Data</h3>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Querying Athena via API Gateway...</p>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="empty-state">
            <h3>No Records Found</h3>
            <p>Your query returned no results for this category.</p>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key}>{key.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default App