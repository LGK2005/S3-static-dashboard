import { useState, useEffect } from 'react'
import './App.css'

// --- CONFIGURATION ---
const API_BASE_URL = 'https://staticdashboard.website/'; 
const DIAGRAM_IMAGE = '/diagram.png'; 
const ITEMS_PER_PAGE = 10;

// --- ICONS (SVG Components to remove external dependencies) ---
const Icons = {
  Shield: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Activity: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Network: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="20" r="1" /><circle cx="12" cy="4" r="1" /><circle cx="6" cy="12" r="1" /><circle cx="18" cy="12" r="1" />
      <path d="M12 5v14M6 12h12" />
    </svg>
  ),
  LayoutDashboard: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  RefreshCw: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  X: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Eye: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  ChevronLeft: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  ChevronRight: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  )
};

function App() {
  const [activeTab, setActiveTab] = useState('overall'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Stats for charts
  const [stats, setStats] = useState({
    guardduty: [],
    cloudtrail: [],
    vpc: []
  });

  // Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const endpoints = {
    guardduty: '/logs/guardduty?limit=20',
    cloudtrail: '/logs/cloudtrail?limit=20',
    vpc: '/logs/vpc?limit=20'
  };

  // --- MAIN FETCH ---
  const fetchData = async (tab) => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      if (tab === 'overall') {
        await fetchOverallStats();
      } else {
        const url = `${API_BASE_URL}${endpoints[tab]}`;
        const items = await fetchAndParse(url);
        setData(items);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverallStats = async () => {
    const [gdData, ctData, vpcData] = await Promise.all([
      fetchAndParse(`${API_BASE_URL}${endpoints.guardduty}`),
      fetchAndParse(`${API_BASE_URL}${endpoints.cloudtrail}`),
      fetchAndParse(`${API_BASE_URL}${endpoints.vpc}`)
    ]);

    setStats({
      guardduty: processDistribution(gdData, 'severity'),
      cloudtrail: processDistribution(ctData, 'eventname'),
      vpc: processDistribution(vpcData, 'action')
    });
  };

  const fetchAndParse = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
    const result = await response.json();
    return result.ResultSet ? parseAthenaResult(result.ResultSet) : (Array.isArray(result) ? result : []);
  };

  const processDistribution = (items, key) => {
    const counts = {};
    items.forEach(item => {
      const val = (item[key] || 'Unknown').toString().toUpperCase(); 
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // --- DETAIL FETCH ---
  const fetchDetail = async (row) => {
    setSelectedItem(null); 
    setIsModalOpen(true);
    setDetailLoading(true);

    try {
      if (activeTab === 'guardduty' && row.finding_id) {
        const url = `${API_BASE_URL}/findings/guardduty?finding_id=${row.finding_id}`;
        const items = await fetchAndParse(url);
        setSelectedItem(items.length > 0 ? items[0] : row); 
      } else {
        setSelectedItem(row);
      }
    } catch (err) {
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

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="logo-section">
          <h1><Icons.Shield size={28} color="#fff" /> Incident Dashboard</h1>
        </div>
        <div className="status-badge">
          <div className="status-dot"></div>
          System Operational
        </div>
      </header>

      {/* CONTROLS */}
      <div className="controls">
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'overall' ? 'active' : ''}`} onClick={() => setActiveTab('overall')}>
             <Icons.LayoutDashboard size={18}/> Dashboard
          </button>
          <button className={`tab-btn ${activeTab === 'guardduty' ? 'active' : ''}`} onClick={() => setActiveTab('guardduty')}>
            <Icons.Shield size={18}/> GuardDuty
          </button>
          <button className={`tab-btn ${activeTab === 'cloudtrail' ? 'active' : ''}`} onClick={() => setActiveTab('cloudtrail')}>
            <Icons.Activity size={18}/> CloudTrail
          </button>
          <button className={`tab-btn ${activeTab === 'vpc' ? 'active' : ''}`} onClick={() => setActiveTab('vpc')}>
            <Icons.Network size={18}/> VPC Network
          </button>
        </div>
        <button className="refresh-btn" onClick={() => fetchData(activeTab)}>
          <Icons.RefreshCw size={18} /> Refresh
        </button>
      </div>

      <main className="content-area">
        {error && (
            <div className="error-message">
                <h3>Connection Error</h3>
                <p>{error}</p>
            </div>
        )}
        
        {loading && (
            <div className="loading-spinner">
                <div className="spinner" style={{border: '3px solid #ccc', borderTopColor: '#ec7211', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto'}}></div>
                <p style={{textAlign:'center', marginTop: '1rem', color: '#666'}}>Syncing live data...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        )}

        {/* --- OVERALL DASHBOARD --- */}
        {!loading && !error && activeTab === 'overall' && (
          <div className="dashboard-grid">
            
            {/* Architecture Diagram */}
            <div className="diagram-section">
                <div className="section-title">
                    Infrastructure Blueprint
                </div>
                <div className="diagram-container">
                    <img src={DIAGRAM_IMAGE} alt="System Architecture" 
                         onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/800x400/f1f5f9/94a3b8?text=Place+'diagram.png'+in+Public+Folder"}} />
                </div>
            </div>

            {/* Stats Widgets */}
            <div className="stats-column">
                
                {/* GuardDuty Widget */}
                <div className="stat-card gd">
                    <div className="card-header">
                        <h3>Threat Detection</h3>
                        <Icons.Shield size={20} color="#ef4444" />
                    </div>
                    <div>
                         {stats.guardduty.length === 0 ? <p className="text-secondary" style={{fontSize:'0.85rem', color: '#6b7280'}}>No active threats</p> : stats.guardduty.map((bar) => (
                            <div key={bar.label} className="chart-row">
                                <div className="chart-label">{bar.label}</div>
                                <div className="chart-track">
                                    <div className="chart-fill" style={{width: `${Math.min((bar.count / 10) * 100, 100)}%`}}></div>
                                </div>
                                <div className="chart-value">{bar.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CloudTrail Widget */}
                <div className="stat-card ct">
                    <div className="card-header">
                        <h3>User Activity</h3>
                        <Icons.Activity size={20} color="#dd6b20" />
                    </div>
                    <div>
                        {stats.cloudtrail.map((bar) => (
                            <div key={bar.label} className="chart-row">
                                <div className="chart-label" title={bar.label}>
                                    {bar.label.length > 10 ? bar.label.substring(0,8)+'..' : bar.label}
                                </div>
                                <div className="chart-track">
                                    <div className="chart-fill" style={{width: `${Math.min((bar.count / 10) * 100, 100)}%`}}></div>
                                </div>
                                <div className="chart-value">{bar.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* VPC Widget */}
                <div className="stat-card vpc">
                    <div className="card-header">
                        <h3>Network Traffic</h3>
                        <Icons.Network size={20} color="#3182ce" />
                    </div>
                    <div>
                        {stats.vpc.map((bar) => (
                            <div key={bar.label} className="chart-row">
                                <div className="chart-label">{bar.label}</div>
                                <div className="chart-track">
                                    <div className="chart-fill" style={{width: `${Math.min((bar.count / 20) * 100, 100)}%`}}></div>
                                </div>
                                <div className="chart-value">{bar.count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* --- LIST TABLE VIEW --- */}
        {!loading && !error && activeTab !== 'overall' && data.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{width: '90px'}}>Action</th>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key}>{key.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((row, i) => (
                  <tr key={i}>
                    <td>
                        <button className="view-btn" onClick={() => fetchDetail(row)}>
                            <Icons.Eye size={14} /> View
                        </button>
                    </td>
                    {Object.values(row).map((val, j) => (<td key={j}>{val}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
                <button className="page-btn" onClick={prevPage} disabled={currentPage === 1}>
                    <Icons.ChevronLeft size={16} /> Previous
                </button>
                <span className="page-info">
                    Page <b>{currentPage}</b> of <b>{totalPages}</b>
                </span>
                <button className="page-btn" onClick={nextPage} disabled={currentPage === totalPages}>
                    Next <Icons.ChevronRight size={16} />
                </button>
            </div>
          </div>
        )}
      </main>

      {/* --- DETAIL MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Incident Details</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><Icons.X size={20}/></button>
            </div>
            
            <div className="modal-body">
                {detailLoading ? (
                   <div className="loading-spinner">
                       <div className="spinner" style={{border: '3px solid #ccc', borderTopColor: '#ec7211', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto'}}></div>
                       <p style={{textAlign:'center', color: '#666', marginTop: '1rem'}}>Loading details...</p>
                   </div>
                ) : selectedItem ? (
                    <div>
                        {Object.entries(selectedItem).map(([key, value]) => (
                            <div key={key} className="detail-row">
                                <div className="detail-label">{key.replace(/_/g, ' ')}</div>
                                <div className="detail-value">{value}</div>
                            </div>
                        ))}
                    </div>
                ) : <p style={{textAlign: 'center', color: '#999'}}>No details found.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App