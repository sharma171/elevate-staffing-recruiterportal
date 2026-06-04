
import React, { useState } from 'react';

function DemoRequestForm({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Demo request submitted! We\'ll be in touch shortly.');
    onOpenChange(false);
  };
  
  if (!open) return null;
  
  return (
    <div className="demo-overlay">
      <div className="demo-modal">
        <h2>Request a Demo</h2>
        <form className="demo-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="company">Company Name</label>
            <input 
              type="text" 
              id="company" 
              value={formData.company}
              onChange={handleChange}
              placeholder="Acme Inc." 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Additional Information</label>
            <textarea 
              id="message" 
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your specific needs..." 
              rows="4"
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DemoRequestForm;