import React, { useState, useEffect } from 'react';
import { getPendingApprovals, approveRequest, rejectRequest } from '../services/api';
import { CheckCircle, XCircle } from 'lucide-react';

const ApprovalDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await getPendingApprovals();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, action) => {
    const comments = prompt(\`Enter \${action} comments:\`);
    if (comments === null) return; // User cancelled

    try {
      // Hardcoded officialId for demo purposes
      const data = { officialId: '65538e1b1234567890123456', comments };
      if (action === 'approve') {
        await approveRequest(id, data);
      } else {
        await rejectRequest(id, data);
      }
      fetchPending(); // Refresh list
    } catch (error) {
      console.error(\`Error \${action}ing request:\`, error);
      alert('Action failed. Check console.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Approval Dashboard</h1>
          <p className="page-subtitle">Manage pending investment requests requiring official action.</p>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Action Required</h2>
        {loading ? (
          <p>Loading pending requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-muted">No pending approvals at this time.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Investment ($)</th>
                  <th>National ID</th>
                  <th>Tax Clearance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td style={{ fontWeight: 500 }}>{req.companyName}</td>
                    <td>{req.investmentAmount.toLocaleString()}</td>
                    <td>
                      {req.verifications.nationalId ? (
                        <span style={{ color: 'var(--success)' }}>Verified</span>
                      ) : (
                        <span style={{ color: 'var(--danger)' }}>Failed</span>
                      )}
                    </td>
                    <td>
                      {req.verifications.taxClearance ? (
                        <span style={{ color: 'var(--success)' }}>Cleared</span>
                      ) : (
                        <span style={{ color: 'var(--warning)' }}>Pending</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-success" 
                          onClick={() => handleAction(req._id, 'approve')}
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleAction(req._id, 'reject')}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </td>
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

export default ApprovalDashboard;
