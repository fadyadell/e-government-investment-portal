import React from 'react';
import { Check, X } from 'lucide-react';

const STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'verified', label: 'Verification' },
  { key: 'risk', label: 'Risk Evaluation' },
  { key: 'approval', label: 'Approval' },
  { key: 'registered', label: 'Registration' },
  { key: 'notified', label: 'Notification' },
];

const getStepState = (stepKey, status) => {
  const statusMap = {
    'pending': { completed: ['submitted', 'verified', 'risk'], active: 'approval' },
    'verification_in_progress': { completed: ['submitted'], active: 'verified' },
    'risk_evaluation': { completed: ['submitted', 'verified'], active: 'risk' },
    'approved': { completed: ['submitted', 'verified', 'risk', 'approval', 'registered', 'notified'], active: null },
    'registered': { completed: ['submitted', 'verified', 'risk', 'approval', 'registered', 'notified'], active: null },
    'rejected': { completed: ['submitted', 'verified', 'risk'], active: null, failed: 'approval' },
    'escalated': { completed: ['submitted', 'verified', 'risk'], active: 'approval' },
  };

  const config = statusMap[status] || statusMap['pending'];
  
  if (config.failed === stepKey) return 'failed';
  if (config.completed?.includes(stepKey)) return 'completed';
  if (config.active === stepKey) return 'active';
  return 'pending';
};

const WorkflowTimeline = ({ status = 'pending' }) => {
  return (
    <div className="workflow-timeline">
      {STEPS.map((step, index) => {
        const state = getStepState(step.key, status);
        const prevState = index > 0 ? getStepState(STEPS[index - 1].key, status) : null;

        return (
          <React.Fragment key={step.key}>
            {index > 0 && (
              <div className={`timeline-connector ${
                prevState === 'completed' ? 'completed' : 
                prevState === 'active' ? 'active' : ''
              }`} />
            )}
            <div className={`timeline-step ${state}`}>
              <div className="timeline-icon">
                {state === 'completed' ? <Check size={18} /> : 
                 state === 'failed' ? <X size={18} /> : 
                 index + 1}
              </div>
              <span className="timeline-label">{step.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default WorkflowTimeline;
