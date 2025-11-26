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

  // --- NEW: Detail Modal State ---
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // 2. Fetch Details (NEW)
  const fetchDetail = async (row) => {
    setSelectedItem(null); // Clear previous
    setIsModalOpen(true);
    setDetailLoading(true);

    try {
      // Logic: Only GuardDuty has "finding_id" support in your backend right now
      if (activeTab === 'guardduty' && row.finding_id) {
        const url = `${API_BASE_URL}/findings/guardduty?finding_id=${row.finding_id}`;
        console.log(`Fetching Detail: ${url}`);
        
        const response = await fetch(url);
        const result = await response.json();
        const items = result.ResultSet ? parseAthenaResult(result.ResultSet) : [];
        
        // Athena returns an array, we just want the first item
        if (items.length > 0) {
            setSelectedItem(items[0]); 
        } else {
            setSelectedItem(row); // Fallback to what we already have
        }
      } else {
        // For CloudTrail/VPC, we just show the row info we already have
        // (Since your backend doesn't support ID filtering for these yet)
        setSelectedItem(row);
      }
    } catch (err) {
      console.error("Detail Fetch Error", err);
      setSelectedItem({ error: "Failed to load details" });
    } finally {
      setDetailLoading(false);
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
          <button className={activeTab === 'guardduty' ? 'active' : ''} onClick={() => setActiveTab('guardduty')}>GuardDuty</button>
          <button className={activeTab === 'cloudtrail' ? 'active' : ''} onClick={() => setActiveTab('cloudtrail')}>CloudTrail</button>
          <button className={activeTab === 'vpc' ? 'active' : ''} onClick={() => setActiveTab('vpc')}>VPC Traffic</button>
        </div>
        <button className="refresh-btn" onClick={() => fetchData(activeTab)}>🔄 Refresh Data</button>
      </div>

      <main className="content-area">
        {error && <div className="error-message"><h3>⚠️ Unable to Load Data</h3><p>{error}</p></div>}
        
        {loading && <div className="loading-spinner"><div className="spinner"></div><p>Querying Athena...</p></div>}

        {!loading && !error && data.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                  ))}
                  <th>ACTIONS</th> {/* New Column */}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                    <td>
                        <button className="view-btn" onClick={() => fetchDetail(row)}>
                            View
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* --- MODAL FOR DETAILS --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Incident Details</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✖</button>
            </div>
            
            {detailLoading ? (
               <div className="loading-spinner"><div className="spinner"></div></div>
            ) : selectedItem ? (
                <div className="detail-grid">
                    {Object.entries(selectedItem).map(([key, value]) => (
                        <div key={key} className="detail-row">
                            <div className="detail-label">{key.replace(/_/g, ' ')}</div>
                            <div className="detail-value">{value}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No details available.</p>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default App