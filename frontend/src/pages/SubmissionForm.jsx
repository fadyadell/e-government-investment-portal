import React, { useState } from 'react';
import { createRequest } from '../services/api';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubmissionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    investmentAmount: '',
    description: '',
    nationalId: '',
    taxId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mocking investorId for demo
      const payload = {
        ...formData,
        investorId: '65538e1b1234567890123456',
        investmentAmount: Number(formData.investmentAmount)
      };
      
      await createRequest(payload);
      alert('Investment request submitted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit request. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Request</h1>
          <p className="page-subtitle">Submit a new investment and company establishment request.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input 
              type="text" 
              name="companyName" 
              className="form-input" 
              value={formData.companyName} 
              onChange={handleChange}
              required 
              placeholder="Enter company name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Investment Amount ($)</label>
            <input 
              type="number" 
              name="investmentAmount" 
              className="form-input" 
              value={formData.investmentAmount} 
              onChange={handleChange}
              required 
              placeholder="e.g., 500000"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea 
              name="description" 
              className="form-input" 
              rows="3"
              value={formData.description} 
              onChange={handleChange}
              placeholder="Brief description of the investment plan"
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">National ID Number</label>
            <input 
              type="text" 
              name="nationalId" 
              className="form-input" 
              value={formData.nationalId} 
              onChange={handleChange}
              required 
              placeholder="14-digit National ID"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tax ID Number</label>
            <input 
              type="text" 
              name="taxId" 
              className="form-input" 
              value={formData.taxId} 
              onChange={handleChange}
              required 
              placeholder="Tax Identification Number"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
            {loading ? 'Submitting...' : <><Send size={18} /> Submit Request</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmissionForm;
