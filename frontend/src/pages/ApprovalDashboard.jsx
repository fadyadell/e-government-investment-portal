import React, { useState, useEffect } from 'react';
import { getPendingApprovals, approveRequest, rejectRequest, escalateRequest } from '../services/api';
import Modal from '../components/Modal';
import WorkflowTimeline from '../components/WorkflowTimeline';
import { SkeletonTable } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { CheckCircle2, XCircle, ShieldAlert, Clock, ChevronDown, ChevronUp, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';

const ApprovalDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve', 'reject', 'escalate'
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Timer tick state to force SLA countdown re-render
  const [timeTick, setTimeTick] = useState(Date.now());

  const toast = useToast();

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await getPendingApprovals();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast.error('Fetch Error', 'Failed to retrieve pending approval requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    
    // Update countdown timers every 10 seconds
    const interval = setInterval(() => {
      setTimeTick(Date.now());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (id, e) => {
    // Avoid expanding when clicking action buttons
    if (e.target.closest('button')) return;
    setExpandedId(expandedId === id ? null : id);
  };

  const openActionModal = (req, action) => {
    setActiveRequest(req);
    setActionType(action);
    setComment('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;
    
    // Comments are required for rejection or escalation
    if (actionType !== 'approve' && !comment.trim()) {
      toast.error('Field Required', `Please enter a reason or comment for this ${actionType} action.`);
      return;
    }

    setSubmitting(true);
    try {
      // Hardcoded officialId for demo purposes
      const payload = { 
        officialId: '65538e1b1234567890123456', 
        comments: comment,
        reason: comment // escalate expects reason
      };

      if (actionType === 'approve') {
        await approveRequest(activeRequest._id, payload);
        toast.success('Approved Successfully', `Request for ${activeRequest.companyName} has been approved.`);
      } else if (actionType === 'reject') {
        await rejectRequest(activeRequest._id, payload);
        toast.error('Request Rejected', `Request for ${activeRequest.companyName} has been rejected.`);
      } else if (actionType === 'escalate') {
        await escalateRequest(activeRequest._id, payload);
        toast.info('Request Escalated', `Request for ${activeRequest.companyName} has been escalated for senior review.`);
      }

      setIsModalOpen(false);
      fetchPending();
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      toast.error('Action Failed', error.response?.data?.message || `Could not complete the ${actionType} action.`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatSla = (deadlineStr) => {
    if (!deadlineStr) return { text: 'N/A', class: 'text-muted' };
    const deadline = new Date(deadlineStr).getTime();
    const diff = deadline - timeTick;

    if (diff <= 0) {
      return { text: 'OVERDUE', class: 'text-danger font-bold animate-pulse' };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 12) {
      return { text: `${hours}h ${mins}m`, class: 'text-warning font-bold' };
    }

    return { text: `${hours}h ${mins}m`, class: 'text-success' };
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

  // Stats calculation
  const totalPending = requests.length;
  const highRiskCount = requests.filter(r => ['high', 'critical'].includes(r.riskLevel)).length;
  const escalatedCount = requests.filter(r => r.status === 'escalated').length;
  const overdueCount = requests.filter(r => r.slaDeadline && new Date(r.slaDeadline).getTime() < timeTick).length;

  const modalTitle = {
    approve: 'Approve Application',
    reject: 'Reject Application',
    escalate: 'Escalate Application'
  }[actionType];

  const modalDescription = {
    approve: 'Are you sure you want to approve this investment request? This will automatically initiate company registration.',
    reject: 'Provide comments detailing the reasons for rejecting this establishment request.',
    escalate: 'Escalate this request to senior management for additional validation and risk oversight.'
  }[actionType];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Approval Dashboard</h1>
          <p className="page-subtitle">Official clearance queue for company establishment requests.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalPending}</div>
          <div className="stat-label">Pending Reviews</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{highRiskCount}</div>
          <div className="stat-label">High/Critical Risk</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--escalated)' }}>
          <div className="stat-value" style={{ color: 'var(--escalated)' }}>{escalatedCount}</div>
          <div className="stat-label">Escalated Requests</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-value" style={{ color: '#ef4444' }}>{overdueCount}</div>
          <div className="stat-label">SLA Overdue</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <ShieldCheck size={18} />
          Clearing Queue
        </div>
        {loading ? (
          <SkeletonTable rows={4} cols={7} />
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={48} style={{ margin: '0 auto 12px', color: 'var(--success)', opacity: 0.7 }} />
            <p>All clear! There are no pending reviews at this time.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Company Name</th>
                  <th>Investment ($)</th>
                  <th>Risk Level</th>
                  <th>SLA Timer</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const isExpanded = expandedId === req._id;
                  const sla = formatSla(req.slaDeadline);
                  return (
                    <React.Fragment key={req._id}>
                      <tr 
                        onClick={(e) => toggleExpand(req._id, e)} 
                        style={{ cursor: 'pointer', backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.02)' : undefined }}
                        className="table-row-hover"
                      >
                        <td>
                          {isExpanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {req.companyName}
                        </td>
                        <td>${req.investmentAmount?.toLocaleString()}</td>
                        <td>{getRiskBadge(req.riskLevel)}</td>
                        <td className={sla.class}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={14} />
                            {sla.text}
                          </div>
                        </td>
                        <td>
                          {req.status === 'escalated' ? (
                            <span className="badge badge-escalated">Escalated</span>
                          ) : (
                            <span className="badge badge-pending">Pending</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn btn-success" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
                              onClick={() => openActionModal(req, 'approve')}
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                            <button 
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
                              onClick={() => openActionModal(req, 'reject')}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                            {req.status !== 'escalated' && (
                              <button 
                                className="btn btn-outline"
                                style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px', borderColor: 'var(--escalated)', color: 'var(--escalated)' }}
                                onClick={() => openActionModal(req, 'escalate')}
                              >
                                <ShieldAlert size={14} /> Escalate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" style={{ padding: '0', backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                            <div className="expanded-detail-container" style={{ padding: '24px', borderLeft: '3px solid var(--primary)', animation: 'slideDown 0.25s ease-out' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', marginBottom: '20px' }}>
                                <div>
                                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 600 }}>Investor Information</h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                                    <div><span className="text-muted">Applicant:</span> {req.investorName}</div>
                                    <div><span className="text-muted">Email:</span> {req.investorEmail}</div>
                                    <div><span className="text-muted">National ID:</span> {req.nationalId || 'N/A'}</div>
                                    <div><span className="text-muted">Tax ID:</span> {req.taxId || 'N/A'}</div>
                                    <div>
                                      <span className="text-muted">Verification Status:</span>
                                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                        <span className={`badge ${req.verifications?.nationalId ? 'badge-approved' : 'badge-rejected'}`}>
                                          ID check: {req.verifications?.nationalId ? 'PASSED' : 'FAILED'}
                                        </span>
                                        <span className={`badge ${req.verifications?.taxClearance ? 'badge-approved' : 'badge-rejected'}`}>
                                          Tax clearance: {req.verifications?.taxClearance ? 'PASSED' : 'FAILED'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 600 }}>Details & Description</h4>
                                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                                    {req.description || 'No description provided.'}
                                  </p>
                                  <div>
                                    <span className="text-muted">Risk Score:</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginLeft: '8px' }}>
                                      {req.riskScore} / 100
                                    </span>
                                  </div>
                                  {req.status === 'escalated' && (
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
                                <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem', fontWeight: 600 }}>Workflow State Timeline</h4>
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

      {/* Actions Dialog Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !submitting && setIsModalOpen(false)} 
        title={modalTitle}
        description={modalDescription}
      >
        <form onSubmit={handleModalSubmit} style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="action-comment">
              {actionType === 'approve' ? 'Approver Comments (Optional)' : 'Reason / Justification (Required)'}
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                position: 'absolute', left: '14px', top: '14px',
                color: 'var(--text-muted)', pointerEvents: 'none' 
              }}>
                <MessageSquare size={17} />
              </div>
              <textarea 
                id="action-comment"
                className="form-input" 
                rows="4"
                style={{ paddingLeft: '44px' }}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={actionType === 'approve' ? 'Provide optional approval notes...' : 'Enter required comments...'}
                required={actionType !== 'approve'}
                disabled={submitting}
              ></textarea>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn ${actionType === 'approve' ? 'btn-success' : actionType === 'reject' ? 'btn-danger' : 'btn-primary'}`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', marginRight: '6px' }}></div>
                  Processing...
                </>
              ) : (
                actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Escalate'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ApprovalDashboard;
