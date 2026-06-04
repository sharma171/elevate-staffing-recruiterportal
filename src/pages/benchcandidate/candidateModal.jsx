import React, { useState, useEffect } from "react";
import { useAuth } from "../../authContext";

// Modal Component
const CandidateModal = ({ candidate, onClose, onSave }) => {
  const [formData, setFormData] = useState(candidate || {});
  const [recruitersList, setRecruitersList] = useState([]); // State for recruiters list
  const { user } = useAuth();
  // Fetch recruiters list from the API
  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const query = `SELECT id, assigned_recruiter FROM foursphere_recruiters.bench_candidates`;
        const response = await fetch(
          "https://us-east1-foursssolutions.cloudfunctions.net/connect4sphere_database_api",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ emailid: user.email, query }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          setRecruitersList(data);
          console.log(data);
        } else {
          console.error("Failed to fetch recruiters:", data.message);
        }
      } catch (error) {
        console.error("Error fetching recruiters:", error);
      }
    };

    fetchRecruiters();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    onSave(formData);
  };
  if (!candidate) return null;

  return (
    <div className="modal-f-popup wide">
      <div className="modal-content col-flex">
        <h3>Edit Candidate Details</h3>
        <div className="col-flex form-outer">
          <div className="details row-flex">
            <div className="row-flex input-row">
              <span className="object">Name:</span>
              <input
                className="value"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="row-flex input-row">
              <span className="object">Last Name:</span>
              <input
                className="value"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="details row-flex">
            <div className="row-flex input-row">
              <span className="object">Primary Email:</span>
              <input
                className="value"
                type="email"
                name="primary_email"
                value={formData.primary_email}
                onChange={handleChange}
              />
            </div>
            <div className="row-flex input-row">
              <span className="object">Secondary Email:</span>
              <input
                className="value"
                type="email"
                name="secondary_email"
                value={formData.secondary_email}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="details row-flex">
            <div className="row-flex input-row">
              <span className="object">Primary Contact:</span>
              <input
                className="value"
                type="text"
                name="primary_contact"
                value={formData.primary_contact}
                onChange={handleChange}
              />
            </div>
            <div className="row-flex input-row">
              <span className="object">Secondary Contact:</span>
              <input
                className="value"
                type="text"
                name="secondary_contact"
                value={formData.secondary_contact}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="details row-flex">
            <div className="row-flex input-row">
              <span className="object">Location Preference:</span>
              <select
                className="value"
                type="text"
                name="location_preference"
                value={formData.location_preference}
                onChange={handleChange}
              >
                <option value="">Select Location Preference</option>
                <option value="Anywhere">Anywhere</option>
                <option value="Other">Other</option>
                <option value={formData.location_preference}>{formData.location_preference}</option>
              </select>
            </div>
            <div className="row-flex input-row">
              <span className="object">Visa Status:</span>
              <select
                className="value"
                type="text"
                name="visa_status"
                value={formData.visa_status}
                onChange={handleChange}
              >
                <option value="">Select Visa Status</option>
                <option value="CPT">CPT</option>
                <option value="OPT">OPT</option>
                <option value="H1B">H1B</option>
                <option value="H4 EAD">H4 EAD</option>
                <option value="GC">GC</option>
                <option value="GC EAD">GC EAD</option>
                <option value="USC">USC</option>
                <option value="STEM OPT">STEM OPT</option>
                <option value="H1B TRANSFER">H1B TRANSFER</option>
              </select>
            </div>
          </div>
          <div className="details row-flex">
            <div className="row-flex input-row">
              <span className="object">Current Status:</span>
              <select
                className="value"
                type="text"
                name="current_status"
                value={formData.current_status}
                onChange={handleChange}
              >
                <option value="">Select Current Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="row-flex input-row">
              <span className="object">Assigned Recruiter:</span>
              <select
                className="value"
                type="text"
                name="assigned_recruiter"
                value={formData.assigned_recruiter}
                onChange={handleChange}
              >
                <option value="">Select Recruiter</option>
                {recruitersList.map((recruiter) => (
                  <option key={recruiter.id} value={recruiter.assigned_recruiter}>
                    {recruiter.assigned_recruiter}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="details row-flex">
            <div className="row-flex input-row">
              <span className="object">Availability:</span>
              <select
                className="value"
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
              >
                <option value="">Select Availablity</option>
                <option value="Immediate">Immediate</option>
                <option value="Available in 2 weeks">Available in 2 weeks</option>
                <option value="Available in 1 month">Available in 1 month</option>
                <option value="Available in 45 days">Available in 45 days</option>
                <option value="Available in 2 months">Available in 2 months</option>
              </select>
            </div>
            <div className="row-flex input-row">
              <span className="object">Currently in a Project:</span>
              <select
                className="value"
                name="currently_in_project"
                value={formData.currently_in_project}
                onChange={handleChange}
              >
                <option value="">Select Option</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div className="details row-flex clamp">
            <div className="row-flex input-row">
              <span className="object">OneDrive Link:</span>
              <input
                className="value"
                type="text"
                name="candidate_onedrive_link"
                value={formData.candidate_onedrive_link}
                onChange={handleChange}
              />
            </div>
            <div className="row-flex input-row">
              <span className="object">Comments:</span>
              <input className="value" type="text" name="comments" value={formData.comments} onChange={handleChange} />
            </div>
          </div>
          <div className="details row-flex">
            <div className="row-flex input-row">
              <span className="object">C-Visa Status:</span>
              <select
                className="value"
                type="text"
                name="cvisa_status"
                value={formData.cvisa_status}
                onChange={handleChange}
              >
                <option value="">Select Visa Status</option>
                <option value="CPT">CPT</option>
                <option value="OPT">OPT</option>
                <option value="H1B">H1B</option>
                <option value="H4 EAD">H4 EAD</option>
                <option value="GC">GC</option>
                <option value="GC EAD">GC EAD</option>
                <option value="USC">USC</option>
                <option value="STEM OPT">STEM OPT</option>
                <option value="H1B TRANSFER">H1B TRANSFER</option>
              </select>
            </div>
            <div className="row-flex input-row">
              <span className="object">Assigned Team:</span>
              <select
                className="value"
                type="text"
                name="assigned_team"
                value={formData.assigned_team}
                onChange={handleChange}
              >
                <option value="">Select Your Team</option>
                <option value="Pending onboarding">Pending onboarding</option>
                <option value="Teams A">Team A</option>
                <option value="Teams B">Team B</option>
                <option value="Teams C">Team C</option>
              </select>
            </div>
            <div className="row-flex input-row">
              <span className="object">Offer Letter Status:</span>
              <select
                className="value"
                type="text"
                name="opt_letter_status"
                value={formData.opt_letter_status}
                onChange={handleChange}
              >
                <option value="">Select Option</option>
                <option value="ISSUED">Issued</option>
                <option value="NOT ISSUED">Not Issued</option>
                <option value="Issued with 1983">Issued with 1983</option>
              </select>
            </div>
          </div>
          <div className="details row-flex">
            <div className="row-flex input-row">
              <span className="object">Primary Technology:</span>
              <input
                className="value"
                type="text"
                name="primary_technology"
                value={formData.primary_technology}
                onChange={handleChange}
              />
            </div>
            <div className="row-flex input-row">
              <span className="object">Secondary Technology:</span>
              <input
                className="value"
                type="text"
                name="secondary_technology"
                value={formData.secondary_technology}
                onChange={handleChange}
              />
            </div>
          </div>
          <button className="save-modal" onClick={handleSubmit}>
            Save
          </button>
        </div>
        <button className="close-modal" onClick={onClose}>
          +
        </button>
      </div>
    </div>
  );
};
export default CandidateModal;
