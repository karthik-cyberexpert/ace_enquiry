import React, { useState, useEffect } from 'react';
import { courses, branches } from './data/admissionData';

interface FormData {
  name: string;
  phone: string;
  email: string;
  course: string;
  branch: string;
  queries: string;
  consent: boolean;
}

const EnquiryForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    course: '',
    branch: '',
    queries: '',
    consent: false
  });

  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (formData.course && branches[formData.course as keyof typeof branches]) {
      setAvailableBranches(branches[formData.course as keyof typeof branches]);
      setFormData(prev => ({ ...prev, branch: '' })); // Reset branch when course changes
    } else {
      setAvailableBranches([]);
    }
  }, [formData.course]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Basic Validation
    if (!formData.name || !formData.phone || !formData.email || !formData.course || !formData.branch || !formData.consent) {
      setMessage({ type: 'error', text: 'Please fill in all required fields and accept the consent.' });
      setIsSubmitting(false);
      return;
    }

    // Phone validation (basic 10 digit)
    if (!/^\d{10}$/.test(formData.phone)) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number.' });
      setIsSubmitting(false);
      return;
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      setIsSubmitting(false);
      return;
    }

    // Real API call to Node.js backend
    fetch('http://localhost:5000/api/enquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then(response => response.json())
      .then(() => {
        setMessage({ type: 'success', text: 'Thank you! Your enquiry has been submitted successfully.' });
        setIsSubmitting(false);
        setFormData({
          name: '',
          phone: '',
          email: '',
          course: '',
          branch: '',
          queries: '',
          consent: false
        });
      })
      .catch(error => {
        console.error('Error submitting enquiry:', error);
        setMessage({ type: 'error', text: 'Something went wrong. Please try again later.' });
        setIsSubmitting(false);
      });
  };

  return (
    <div className="form-container-ace">
      <div className="form-header-ace">
        <h3>ADMISSION ENQUIRY FORM</h3>
        <span className="subtitle-ace">SUBMIT YOUR DETAILS FOR ADMISSION INQUIRY.</span>
      </div>

      <form className="enquiry-form-ace" onSubmit={handleSubmit}>
        <div className="form-group-ace">
          <label htmlFor="name">Full Name</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>👤</span>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-control-ace"
            />
          </div>
        </div>

        <div className="form-group-ace">
          <label htmlFor="email">Email Address</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>✉</span>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control-ace"
            />
          </div>
        </div>

        <div className="form-group-ace">
          <label htmlFor="phone">Phone Number</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>📞</span>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
              required
              className="form-control-ace"
            />
          </div>
        </div>

        <div className="form-row-ace">
          <div className="form-group-ace">
            <label htmlFor="course">Course</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🎓</span>
              <select 
                id="course"
                name="course" 
                value={formData.course} 
                onChange={handleChange}
                required
                className="form-select-ace"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group-ace">
            <label htmlFor="branch">Branch</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>📌</span>
              <select 
                id="branch"
                name="branch" 
                value={formData.branch} 
                onChange={handleChange}
                disabled={!formData.course}
                required
                className="form-select-ace"
              >
                <option value="">Select Branch</option>
                {availableBranches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-group-ace">
          <label htmlFor="queries">Any specific queries?</label>
          <textarea
            id="queries"
            name="queries"
            placeholder="How can we help you?"
            value={formData.queries}
            onChange={handleChange}
            className="form-control-ace"
            rows={2}
            style={{ paddingLeft: '1rem' }}
          ></textarea>
        </div>

        <div className="checkbox-group-ace">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            id="consent"
            required
          />
          <label htmlFor="consent" style={{ color: '#636e72', fontSize: '0.8rem', fontWeight: '600' }}>
            I authorize Adhiyamaan College of Engineering and its representatives to call, SMS, or email me about its programs and offers.
          </label>
        </div>

        {message && (
          <div className={`form-message-ace ${message.type}`}>
            {message.text}
          </div>
        )}

        <button 
          type="submit" 
          className="submit-btn-ace"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'SUBMITTING...' : (
            <>
              SUBMIT ENQUIRY &rarr;
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EnquiryForm;
