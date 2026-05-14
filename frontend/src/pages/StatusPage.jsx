import React, { useState, useEffect } from 'react';
import { getRequests } from '../services/api';
import { RefreshCw } from 'lucide-react';

const StatusPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
      case 'registered':
        return <span className="badge badge-approved">{status.replace('_', ' ')}</span>;
      case 'rejected':
        return <span className="badge badge-rejected">{status}</span>;
      default:
        return <span className="badge badge-pending">{status.replace(/_/g, ' ')}</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Status Dashboard</h1>
          <p className="page-subtitle">Track the progress of all investment requests.</p>
        </div>
        <button className="btn btn-outline" onClick={fetchRequests} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="card">
        <h2 className="card-title">All Requests</h2>
        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-muted">No requests found.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Investment ($)</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td style={{ fontWeight: 500 }}>{req.companyName}</td>
                    <td>{req.investmentAmount.toLocaleString()}</td>
                    <td>{new Date(req.submittedAt).toLocaleDateString()}</td>
                    <td>{getStatusBadge(req.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusPage;
