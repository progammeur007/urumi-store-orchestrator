import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Globe, Clock, Loader2, Terminal } from 'lucide-react';

const API_BASE = "http://localhost:5000";

function App() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]); // New state for Observability

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const fetchStores = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stores`);
      setStores(res.data);
    } catch (err) { 
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {
    fetchStores();
    const interval = setInterval(fetchStores, 5000);
    return () => clearInterval(interval);
  }, []);

  const createStore = async () => {
    setLoading(true);
    addLog("Initiating multi-tenant provisioning...");
    try {
      // We pass 'woocommerce' as the engine to satisfy the Factory Pattern requirements
      await axios.post(`${API_BASE}/provision`, { engine: 'woocommerce' });
      addLog("Provisioning command successfully dispatched to Kubernetes.");
      fetchStores();
    } catch (err) { 
      addLog("ERROR: Provisioning failed. Check backend logs.");
      alert("Provisioning failed"); 
    }
    setLoading(false);
  };

  const deleteStore = async (name) => {
    if (!window.confirm(`Are you sure you want to purge ${name} and all its resources?`)) return;
    addLog(`Initiating teardown for ${name}...`);
    try {
      await axios.delete(`${API_BASE}/stores/${name}`);
      addLog(`Cleanup complete: ${name} removed.`);
      fetchStores();
    } catch (err) { 
      addLog(`ERROR: Failed to delete ${name}.`);
      alert("Delete failed"); 
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: '800', letterSpacing: '-0.025em' }}>Urumi Cloud Orchestrator</h1>
            <p style={{ color: '#94a3b8', marginTop: '4px' }}>Local Kubernetes Multi-tenant Provisioning</p>
          </div>
          <button 
            onClick={createStore} 
            disabled={loading} 
            style={{ 
              backgroundColor: loading ? '#1e293b' : '#38bdf8', 
              color: '#0f172a', 
              fontWeight: 'bold', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              transition: 'all 0.2s' 
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            {loading ? 'Orchestrating...' : 'Deploy New Instance'}
          </button>
        </header>

        {/* Store Grid */}
        <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
          {stores.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed #334155', borderRadius: '12px', color: '#64748b' }}>
              No active store instances found.
            </div>
          )}
          {stores.map(store => (
            <div key={store.name} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={18} /> {store.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> Created: {new Date(store.created).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ backgroundColor: store.status === 'Active' ? '#064e3b' : '#451a03', color: store.status === 'Active' ? '#4ade80' : '#fbbf24', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  ● {store.status}
                </span>
                <a href="http://127.0.0.1:8080/shop" target="_blank" rel="noopener noreferrer" style={{ color: '#f8fafc', textDecoration: 'none', padding: '8px 16px', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500', transition: '0.2s' }}>
                  Visit Store
                </a>
                <button onClick={() => deleteStore(store.name)} style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '8px' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Log (Observability Differentiator) */}
        <div style={{ backgroundColor: '#020617', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#94a3b8' }}>
            <Terminal size={18} />
            <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Activity Log</h3>
          </div>
          <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '0.85rem', color: '#4ade80', maxHeight: '150px', overflowY: 'auto', linePadding: '4px' }}>
            {logs.map((log, i) => <div key={i} style={{ marginBottom: '4px' }}>{log}</div>)}
            {logs.length === 0 && <div style={{ color: '#475569' }}>Awaiting system events...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;