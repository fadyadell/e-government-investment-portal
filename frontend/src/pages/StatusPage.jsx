import React, { useState, useEffect, useRef } from 'react';
import { getRequests } from '../services/api';
import WorkflowTimeline from '../components/WorkflowTimeline';
import { SkeletonTable } from '../components/LoadingSpinner';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Clock, ChevronDown, ChevronUp, FileText, Landmark } from 'lucide-react';

const StatusPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef(null);

  const fetchRequests = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await getRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(true);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchRequests(false);
      }, 10000);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-approved">Approved</span>;
      case 'registered':
        return <span className="badge badge-success">Registered</span>;
      case 'rejected':
        return <span className="badge badge-rejected">Rejected</span>;
      case 'escalated':
        return <span className="badge badge-escalated">Escalated</span>;
      default:
        return <span className="badge badge-pending">Pending</span>;
    }
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'critical':
        return <span className="badge badge-rejected" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>Critical</span>;
      case 'high':
        return <span className="badge badge-rejected" style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', border: '1px solid rgba(249, 115, 22, 0.4)' }}>High</span>;
      case 'medium':
        return <span className="badge badge-pending" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>Medium</span>;
      default:
        return <span className="badge badge-approved" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}>Low</span>;
    }
  };

  const getVerificationBadges = (verifications) => {
    if (!verifications) return <span className="text-muted">None</span>;
    return (
      <div style={{ display: 'flex', gap: '6px' }}>
        <span className={`badge ${verifications.nationalId ? 'badge-approved' : 'badge-rejected'}`} style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
          ID: {verifications.nationalId ? '✓' : '✗'}
        </span>
        <span className={`badge ${verifications.taxClearance ? 'badge-approved' : 'badge-rejected'}`} style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
          Tax: {verifications.taxClearance ? '✓' : '✗'}
        </span>
      </div>
    );
  };

  // Compute stats
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => ['pending', 'escalated'].includes(r.status)).length;
  const approvedCount = requests.filter(r => ['approved', 'registered'].includes(r.status)).length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Status Dashboard</h1>
          <p className="page-subtitle">Real-time status of e-government company establishment applications.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }} 
            />
            Auto-refresh (10s)
          </label>
          <button className="btn btn-outline" onClick={() => fetchRequests(true)} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalCount}</div>
          <div className="stat-label">Total Submissions</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{pendingCount}</div>
          <div className="stat-label">Under Evaluation</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{approvedCount}</div>
          <div className="stat-label">Approved & Registered</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{rejectedCount}</div>
          <div className="stat-label">Rejected Applications</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card">
        <div className="card-title">
          <Landmark size={18} />
          Active Applications
        </div>
        
        {loading ? (
          <SkeletonTable rows={5} cols={6} />
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No investment requests found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Company Name</th>
                  <th>Investment ($)</th>
                  <th>Submitted Date</th>
                  <th>Risk Level</th>
                  <th>Verification</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const isExpanded = expandedId === req._id;
                  return (
                    <React.Fragment key={req._id}>
                      <tr 
                        onClick={() => toggleExpand(req._id)} 
                        style={{ cursor: 'pointer', backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.02)' : undefined }}
                        className="table-row-hover"
                      >
                        <td>
                          {isExpanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{req.companyName}</td>
                        <td>${req.investmentAmount?.toLocaleString()}</td>
                        <td>{new Date(req.submittedAt).toLocaleDateString()}</td>
                        <td>{getRiskBadge(req.riskLevel)}</td>
                        <td>{getVerificationBadges(req.verifications)}</td>
                        <td>{getStatusBadge(req.status)}</td>
                      </tr>
                      
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" style={{ padding: '0', backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                            <div className="expanded-detail-container" style={{ padding: '24px', borderLeft: '3px solid var(--primary)', animation: 'slideDown 0.25s ease-out' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', marginBottom: '20px' }}>
                                <div>
                                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 600 }}>Application Metadata</h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                                    <div><span className="text-muted">Applicant:</span> {req.investorName}</div>
                                    <div><span className="text-muted">Email:</span> {req.investorEmail}</div>
                                    <div><span className="text-muted">National ID:</span> {req.nationalId || 'N/A'}</div>
                                    <div><span className="text-muted">Tax ID:</span> {req.taxId || 'N/A'}</div>
                                    {req.registrationNumber && (
                                      <div style={{ marginTop: '4px' }}>
                                        <span className="badge badge-success" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                                          Reg #: {req.registrationNumber}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 600 }}>Project Description</h4>
                                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                                    {req.description || 'No description provided for this company establishment.'}
                                  </p>
                                  {req.escalated && (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '8px 12px', borderRadius: '6px', marginTop: '12px' }}>
                                      <ShieldAlert size={16} style={{ color: 'var(--escalated)' }} />
                                      <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                                        <strong>Escalated:</strong> {req.escalationReason}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem', fontWeight: 600 }}>Workflow Timeline</h4>
                                <WorkflowTimeline status={req.status} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusPage;
