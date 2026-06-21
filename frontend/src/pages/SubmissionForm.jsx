import React, { useState } from 'react';
import { createRequest } from '../services/api';
import { Send, Building2, DollarSign, User, Mail, CreditCard, FileText, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const SubmissionForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    investorName: '',
    investorEmail: '',
    companyName: '',
    investmentAmount: '',
    description: '',
    nationalId: '',
    taxId: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.investorName.trim()) newErrors.investorName = 'Investor name is required';
    if (!formData.investorEmail.trim()) newErrors.investorEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.investorEmail)) newErrors.investorEmail = 'Invalid email format';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.investmentAmount || Number(formData.investmentAmount) <= 0) newErrors.investmentAmount = 'Enter a valid amount';
    if (!formData.nationalId.trim()) newErrors.nationalId = 'National ID is required';
    else if (formData.nationalId.length !== 14) newErrors.nationalId = 'National ID must be 14 digits';
    if (!formData.taxId.trim()) newErrors.taxId = 'Tax ID is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        investmentAmount: Number(formData.investmentAmount)
      };
      
      await createRequest(payload);
      toast.success('Request Submitted', `Investment request for "${formData.companyName}" has been submitted successfully.`);
      navigate('/');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Submission Failed', error.response?.data?.message || 'Could not submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (name, label, icon, type = 'text', placeholder = '', required = true) => (
    <div className="form-group">
      <label className="form-label" htmlFor={`field-${name}`}>
        {label} {required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{ 
          position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
          color: errors[name] ? 'var(--danger)' : 'var(--text-muted)', 
          transition: 'color 0.2s', pointerEvents: 'none' 
        }}>
          {icon}
        </div>
        <input 
          type={type}
          id={`field-${name}`}
          name={name}
          className="form-input" 
          style={{ paddingLeft: '44px', borderColor: errors[name] ? 'var(--danger)' : undefined }}
          value={formData[name]} 
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
        />
      </div>
      {errors[name] && (
        <div className="form-error">
          <AlertCircle size={13} /> {errors[name]}
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Investment Request</h1>
          <p className="page-subtitle">Submit a new investment and company establishment application.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <div className="card-title-icon">
            <FileText size={18} />
          </div>
          Application Form
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            {renderField('investorName', 'Full Name', <User size={17} />, 'text', 'Enter your full name')}
            {renderField('investorEmail', 'Email Address', <Mail size={17} />, 'email', 'you@example.com')}
          </div>

          {renderField('companyName', 'Company Name', <Building2 size={17} />, 'text', 'Enter company name')}
          {renderField('investmentAmount', 'Investment Amount ($)', <DollarSign size={17} />, 'number', 'e.g., 500000')}

          <div className="form-group">
            <label className="form-label" htmlFor="field-description">Description <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 400 }}>(Optional)</span></label>
            <textarea 
              id="field-description"
              name="description" 
              className="form-input" 
              rows="3"
              value={formData.description} 
              onChange={handleChange}
              placeholder="Brief description of the investment plan"
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            {renderField('nationalId', 'National ID Number', <CreditCard size={17} />, 'text', '14-digit National ID')}
            {renderField('taxId', 'Tax ID Number', <FileText size={17} />, 'text', 'Tax Identification Number')}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '8px', padding: '14px' }} 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                Processing...
              </>
            ) : (
              <>
                <Send size={18} /> Submit Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmissionForm;
