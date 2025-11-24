import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { useState, useEffect } from 'react'

// --- CONFIGURATION REQUIRED ---
// ⚠️ STEP 1: Copy your CloudFront Domain (e.g., https://d12345.cloudfront.net)
// ⚠️ STEP 2: Paste it inside the quotes below to replace the placeholder.
const API_BASE_URL = 'https://dk8d92wzanrwm.cloudfront.net/'; 

// --- STYLES (Embedded for Single-File Portability) ---
const styles = `
/* Reset & Base */
#root {
  max-width: 100%;
  margin: 0;
  padding: 0;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
}

*, *:before, *:after {
  box-sizing: inherit;
}

.dashboard-container {
  min-height: 100vh;
  background-color: #f4f6f8;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Header */
.dashboard-header {
  background-color: #232f3e; /* AWS Dark Blue */
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dashboard-header h1 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.status-indicator {
  font-size: 0.85rem;
  background: rgba(255,255,255,0.15);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Controls & Tabs */
.controls {
  padding: 1rem 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid #e1e4e8;
  align-items: center;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  background: #f1f3f5;
  padding: 0.25rem;
  border-radius: 8px;
}

button {
  border: none;
  background: transparent;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 500;
  color: #555;
  transition: all 0.2s;
}

button:hover {
  background-color: rgba(0,0,0,0.05);
  color: #232f3e;
}

button.active {
  background-color: white;
  color: #ec7211; /* AWS Orange */
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.refresh-btn {
  background-color: white;
  border: 1px solid #d1d5db;
  color: #333;
}

.refresh-btn:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

/* Content Area */
.content-area {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Table Styles */
.table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow-x: auto;
  border: 1px solid #e5e7eb;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

th {
  background-color: #f8f9fa;
  color: #4b5563;
  font-weight: 600;
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid #e5e7eb;
  font-size: 0.85rem;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
  color: #111;
  vertical-align: top;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background-color: #f9fafb;
}

/* States */
.error-message {
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  color: #991b1b;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 600px;
  margin: 2rem auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.error-message h3 { margin-top: 0; }

.config-warning {
  background-color: #fff7ed;
  border: 1px solid #ffedd5;
  color: #9a3412;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem auto;
  max-width: 700px;
}

.loading-spinner {
  text-align: center;
  padding: 4rem;
  color: #666;
}

.spinner {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #ec7211;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #6b7280;
  background: white;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  .tabs {
    flex-direction: column;
  }
  button {
    text-align: center;
  }
}
`;

function App() {
  const [activeTab, setActiveTab] = useState('guardduty');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if user has configured the URL
  const isConfigured = !API_BASE_URL.includes('dk8d92wzanrwm');

  const endpoints = {
    guardduty: '/findings/guardduty?limit=10',
    cloudtrail: '/logs/cloudtrail?limit=10',
    vpc: '/logs/vpc?limit=10'
  };

  const fetchData = async (tab) => {
    if (!isConfigured) return;

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
        setError("Network Error: Could not connect to API. This is usually due to CORS issues (CloudFront/API Gateway configuration) or an incorrect API URL.");
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
    if (isConfigured) {
      fetchData(activeTab);
    }
  }, [activeTab, isConfigured]);

  if (!isConfigured) {
    return (
      <div className="dashboard-container">
        <style>{styles}</style>
        <header className="dashboard-header">
          <h1>🛡️ Incident Response Dashboard</h1>
          <div className="status-indicator">Setup Required</div>
        </header>
        <div className="config-warning">
          <h2>⚠️ Configuration Required</h2>
          <p>You need to connect this frontend to your CloudFront API.</p>
          <hr style={{margin: '1.5rem 0', border: 'none', borderTop: '1px solid #fed7aa'}}/>
          <ol style={{textAlign: 'left', display: 'inline-block'}}>
            <li>Open the code editor on the right side.</li>
            <li>Find line 5: <code>const API_BASE_URL = ...</code></li>
            <li>Replace the placeholder URL with your actual CloudFront Domain.</li>
            <li>Example: <code>https://d12345abc.cloudfront.net</code></li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <style>{styles}</style>

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