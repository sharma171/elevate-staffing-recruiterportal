import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import Dashnav from '../../components/dashnav';
import "../dashboard/style.css";
import ProfileDef from "../dashboard/profileIcon.svg";
import BenchIcon from "./benchIcon.svg";

const RegisterCandidate = () => {
    const navigate = useNavigate();

    // State for form inputs
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [primaryEmail, setPrimaryEmail] = useState("");
    const [secondaryEmail, setSecondaryEmail] = useState("");
    const [primaryContact, setPrimaryContact] = useState("");
    const [secondaryContact, setSecondaryContact] = useState("");
    const [locationPreference, setLocationPreference] = useState("");
    const [visaStatus, setVisaStatus] = useState("");
    const [cvisaStatus, setCvisaStatus] = useState("");
    const [currentStatus, setCurrentStatus] = useState("");
    const [recruiter, setRecruiter] = useState("");
    const [currentlyInProject, setCurrentlyInProject] = useState("");
    const [availability, setAvailability] = useState("");
    const [onedriveLink, setOnedriveLink] = useState("");
    const [comments, setComments] = useState("");
    const [recruitersList, setRecruitersList] = useState([]); // State for recruiters list

    // State for form fields
    const [letterProvided, setLetterProvided] = useState("");
    const [cletterProvided, setCletterProvided] = useState("");
    const [locationState, setLocationState] = useState("");

    // State for validation errors
    const [errors, setErrors] = useState({});

    // New state for country codes
    const [primaryCountryCode, setPrimaryCountryCode] = useState("");
    const [secondaryCountryCode, setSecondaryCountryCode] = useState("");

    // Fetch recruiters list from the API
    useEffect(() => {
        const fetchRecruiters = async () => {
            try {
                const query = `SELECT * FROM foursphere_recruiters.recruiterportal_users`;
                const response = await fetch("https://us-east1-foursssolutions.cloudfunctions.net/connect4sphere_database_api", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ query })
                });

                const data = await response.json();
                if (response.ok) {
                    setRecruitersList(data);
                } else {
                    console.error('Failed to fetch recruiters:', data.message);
                }
            } catch (error) {
                console.error('Error fetching recruiters:', error);
            }
        };

        fetchRecruiters();
    }, []);

    // Validation function
     const validate = () => {
        const errors = {};

        if (!firstName.trim()) errors.firstName = "First Name is required";
        if (!lastName.trim()) errors.lastName = "Last Name is required";

        if (!primaryEmail.trim() || !/\S+@\S+\.\S+/.test(primaryEmail)) {
            errors.primaryEmail = "Valid Primary Email ID is required";
        }

        if (secondaryEmail && !/\S+@\S+\.\S+/.test(secondaryEmail)) {
            errors.secondaryEmail = "Valid Secondary Email ID is required";
        }

        if (!primaryCountryCode) {
            errors.primaryCountryCode = "Primary Country Code is required";
        } else if (!/^\d{10}$/.test(primaryContact)) {
            errors.primaryContact = "Primary Contact must be a 10-digit number";
        }

        if (secondaryContact && (!secondaryCountryCode || !/^\d{10}$/.test(secondaryContact))) {
            errors.secondaryContact = "Secondary Contact must be a 10-digit number";
        }

        if (!locationPreference) errors.locationPreference = "Location Preference is required";
        if (locationPreference === 'Other' && !locationState.trim()) errors.locationState = "State is required for 'Other' location preference";

        if (!currentStatus) errors.currentStatus = "Current Status is required";
        if (!visaStatus) errors.visaStatus = "Visa Status is required";

        if (visaStatus === 'OPT' && !letterProvided) errors.letterProvided = "Letter Provided status is required for OPT Visa Status";

        if (!recruiter) errors.recruiter = "Assigned Recruiter is required";
        if (!availability.trim()) errors.availability = "Availability is required";

        

        setErrors(errors);
        return Object.keys(errors).length === 0;
    };
    // Handler for submitting the form
    const handleRegisterCandidate = async () => {
        if (!validate()) return; // Prevent submission if validation fails

        // Combine country code with contact numbers
        const fullPrimaryContact = `${primaryCountryCode}${primaryContact}`;
        const fullSecondaryContact = `${secondaryCountryCode}${secondaryContact}`;

        let visaStatusToSend = visaStatus;
        if (visaStatus === 'OPT') {
            visaStatusToSend += ` Letter Provided: ${letterProvided}`;
        }
        let cvisaStatusToSend = cvisaStatus;
        if(cvisaStatus === 'OPT'){
            cvisaStatusToSend += ` Opt Letter Provided: ${cletterProvided}`
        }

        let locationStatusToSend = locationPreference;
        if (locationPreference === 'Other') {
            locationStatusToSend += ` Location: ${locationState}`;
        }

        const query = `INSERT INTO foursphere_recruiters.bench_candidates(
            first_name, last_name, primary_email, secondary_email, primary_contact, secondary_contact, location_preference, visa_status, current_status, currently_in_project, availability, candidate_onedrive_link, comments, assigned_recruiter, cvisa_status) VALUES (
            '${firstName}', '${lastName}', '${primaryEmail}', '${secondaryEmail}', '${fullPrimaryContact}', '${fullSecondaryContact}', '${locationStatusToSend}', '${visaStatusToSend}', '${currentStatus}', '${currentlyInProject}', '${availability}', '${onedriveLink}', '${comments}', '${recruiter}', '${cvisaStatusToSend}'
        );`;

        const data = { query };

        try {
            const response = await fetch("https://us-east1-foursssolutions.cloudfunctions.net/connect4sphere_database_api", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert("Candidate registered successfully!");
                // Optionally, redirect to another page or reset form
                navigate('/benchcandidates'); // Replace with your desired route
            } else {
                const errorData = await response.json();
                alert(`Registration failed: ${errorData.message || 'An unknown error occurred.'}`);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert(`An error occurred: ${error.message}`);
        }
    };

    return (
        <div>
            <div className="main-dash row-flex">
                <Dashnav/>
                <div className="content col-flex">
                    <div className="top-bar row-flex">
                        <div className="col-flex">
                            <div className="page-intro row-flex">
                                <img src={BenchIcon} alt="page-icon" />
                                <h3 className="page-head">Register New Candidates</h3>
                            </div>
                        </div>
                        <div className="col-flex">
                            <div className="profile-button row-flex">
                                <img src={ProfileDef} alt="" className="thumb" />
                                <div className="user-col col-flex">
                                    <h3 className="position">Your Profile</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="innerContent col-flex">
                        <div className="registerForm col-flex">
                            <div className="formInner col-flex">
                                {errors.general && <div className="error">{errors.general}</div>}
                                <div className="inputRow row-flex">
                                    <div className="input col-flex">
                                        <span className="head">First Name</span>
                                        <input 
                                            type="text" 
                                            className="login-input" 
                                            placeholder="Enter First Name" 
                                            value={firstName} 
                                            onChange={(e) => setFirstName(e.target.value)} 
                                        />
                                        {errors.firstName && <div className="error">{errors.firstName}</div>}
                                    </div>
                                    <div className="input col-flex">
                                        <span className="head">Last Name</span>
                                        <input 
                                            type="text" 
                                            className="login-input" 
                                            placeholder="Enter Last Name" 
                                            value={lastName} 
                                            onChange={(e) => setLastName(e.target.value)} 
                                        />
                                        {errors.lastName && <div className="error">{errors.lastName}</div>}
                                    </div>
                                </div>
                                <div className="inputRow row-flex">
                                    <div className="input col-flex">
                                        <span className="head">Primary Email ID</span>
                                        <input 
                                            type="text" 
                                            className="login-input" 
                                            placeholder="Primary Email ID" 
                                            value={primaryEmail} 
                                            onChange={(e) => setPrimaryEmail(e.target.value)} 
                                        />
                                        {errors.primaryEmail && <div className="error">{errors.primaryEmail}</div>}
                                    </div>
                                    <div className="input col-flex">
                                        <span className="head">Secondary Email ID</span>
                                        <input 
                                            type="text" 
                                            className="login-input" 
                                            placeholder="Secondary Email ID" 
                                            value={secondaryEmail} 
                                            onChange={(e) => setSecondaryEmail(e.target.value)} 
                                        />
                                        {errors.secondaryEmail && <div className="error">{errors.secondaryEmail}</div>}
                                    </div>
                                </div>
                                <div className="inputRow row-flex">
                                    <div className="row-flex" style={{width:"50%"}}>
                                        <div className="input col-flex">
                                            <span className="head">Country Code</span>
                                            <select 
                                                name="primary_country_code"
                                                className="login-input" 
                                                value={primaryCountryCode}
                                                onChange={(e) => setPrimaryCountryCode(e.target.value)}
                                            >
                                                <option value="">Select Country Code</option>
                                                <option value="+91">IND +91</option>
                                                <option value="+01">USA +01</option>
                                            </select>
                                        </div>
                                        <div className="input col-flex">
                                            <span className="head">Primary Contact</span>
                                            <input 
                                                type="text" 
                                                className="login-input" 
                                                placeholder="Primary Contact" 
                                                value={primaryContact} 
                                                onChange={(e) => setPrimaryContact(e.target.value)} 
                                            />
                                            {errors.primaryContact && <div className="error">{errors.primaryContact}</div>}
                                        </div>
                                    </div>
                                    <div className="row-flex" style={{width:"50%"}}>
                                        <div className="input col-flex">
                                            <span className="head">Country Code</span>
                                            <select 
                                                name="secondary_country_code"
                                                className="login-input" 
                                                value={secondaryCountryCode}
                                                onChange={(e) => setSecondaryCountryCode(e.target.value)}
                                            >
                                                <option value="">Select Country Code</option>
                                                <option value="+91">IND +91</option>
                                                <option value="+01">USA +01</option>
                                            </select>
                                        </div>
                                        <div className="input col-flex">
                                            <span className="head">Secondary Contact</span>
                                            <input 
                                                type="text" 
                                                className="login-input" 
                                                placeholder="Secondary Contact" 
                                                value={secondaryContact} 
                                                onChange={(e) => setSecondaryContact(e.target.value)} 
                                            />
                                            {errors.secondaryContact && <div className="error">{errors.secondaryContact}</div>}
                                        </div>
                                    </div>
                                    
                                </div>
                                <div className="inputRow row-flex">
                                    <div className="input col-flex">
                                        <span className="head">Location Preference</span>
                                        <select 
                                            className="login-input" 
                                            value={locationPreference} 
                                            onChange={(e) => setLocationPreference(e.target.value)}
                                        >
                                            <option value="">Select Location Preference</option>
                                            <option value="Anywhere">Anywhere</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.locationPreference && <div className="error">{errors.locationPreference}</div>}
                                    </div>
                                    {locationPreference === "Other" && (
                                        <div className="input col-flex">
                                            <span className="head">State</span>
                                            <input 
                                                type="text" 
                                                className="login-input" 
                                                placeholder="Enter State" 
                                                value={locationState} 
                                                onChange={(e) => setLocationState(e.target.value)} 
                                            />
                                            {errors.locationState && <div className="error">{errors.locationState}</div>}
                                        </div>
                                    )}
                                    <div className="input col-flex">
                                        <span className="head">Visa Status</span>
                                        <select 
                                            className="login-input" 
                                            value={visaStatus} 
                                            onChange={(e) => setVisaStatus(e.target.value)}
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
                                        {errors.visaStatus && <div className="error">{errors.visaStatus}</div>}
                                    </div>
                                </div>
                                {visaStatus === "OPT" && (
                                    <div className="inputRow row-flex">
                                        <div className="input col-flex">
                                            <span className="head">Any letter provided</span>
                                            <select 
                                                className="login-input" 
                                                value={letterProvided} 
                                                onChange={(e) => setLetterProvided(e.target.value)}
                                            >
                                                <option value="">Select Option</option>
                                                <option value="ISSUED">Issued</option>
                                                <option value="NOT ISSUED">Not Issued</option>
                                                <option value="Issued with 1983">Issued with 1983</option>
                                            </select>
                                            {errors.letterProvided && <div className="error">{errors.letterProvided}</div>}
                                        </div>
                                    </div>
                                )}
                                <div className="inputRow row-flex">
                                    <div className="input col-flex">
                                        <span className="head">C Visa Status</span>
                                        <select 
                                            className="login-input" 
                                            value={cvisaStatus} 
                                            onChange={(e) => setCvisaStatus(e.target.value)}
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
                                        {errors.visaStatus && <div className="error">{errors.visaStatus}</div>}
                                    </div>
                                    {cvisaStatus === "OPT" || cvisaStatus === "STEM OPT" && (
                                        <div className="inputRow row-flex">
                                            <div className="input col-flex">
                                                <span className="head">OPT letter provided</span>
                                                <select 
                                                    className="login-input" 
                                                    value={cletterProvided}
                                                    onChange={(e) => setCletterProvided(e.target.value)}
                                                >
                                                    <option value="">Select Option</option>
                                                    <option value="ISSUED">Issued</option>
                                                    <option value="NOT ISSUED">Not Issued</option>
                                                    <option value="Issued with 1983">Issued with 1983</option>
                                                </select>
                                                {errors.letterProvided && <div className="error">{errors.letterProvided}</div>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="inputRow row-flex">
                                    <div className="input col-flex">
                                        <span className="head">Current Status</span>
                                        <select 
                                            className="login-input" 
                                            value={currentStatus} 
                                            onChange={(e) => setCurrentStatus(e.target.value)}
                                        >
                                            <option value="">Select Current Status</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                        {errors.currentStatus && <div className="error">{errors.currentStatus}</div>}
                                    </div>
                                    <div className="input col-flex">
                                        <span className="head">Assigned Recruiter</span>
                                        <select 
                                            className="login-input" 
                                            value={recruiter} 
                                            onChange={(e) => setRecruiter(e.target.value)}
                                        >
                                            <option value="">Select Recruiter</option>
                                            {recruitersList.map((rec) => (
                                                <option key={rec.id} value={rec.email}>{rec.email}</option>
                                            ))}
                                        </select>
                                        {errors.recruiter && <div className="error">{errors.recruiter}</div>}
                                    </div>
                                </div>
                                <div className="inputRow row-flex">
                                    <div className="input col-flex">
                                        <span className="head">Currently in Project</span>
                                        <select 
                                            className="login-input" 
                                            value={currentlyInProject} 
                                            onChange={(e) => setCurrentlyInProject(e.target.value)}
                                        >
                                            <option value="">Select Option</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>
                                    <div className="input col-flex">
                                        <span className="head">Availability</span>
                                        <input 
                                            type="text" 
                                            className="login-input" 
                                            placeholder="Availability" 
                                            value={availability} 
                                            onChange={(e) => setAvailability(e.target.value)} 
                                        />
                                        {errors.availability && <div className="error">{errors.availability}</div>}
                                    </div>
                                </div>
                                <div className="inputRow row-flex">
                                    <div className="input col-flex">
                                        <span className="head">Onedrive Link</span>
                                        <input 
                                            type="text" 
                                            className="login-input" 
                                            placeholder="Onedrive Link" 
                                            value={onedriveLink} 
                                            onChange={(e) => setOnedriveLink(e.target.value)} 
                                        />
                                        {errors.onedriveLink && <div className="error">{errors.onedriveLink}</div>}
                                    </div>
                                    <div className="input col-flex">
                                        <span className="head">Comments</span>
                                        <input 
                                            type="text" 
                                            className="login-input" 
                                            placeholder="Comments" 
                                            value={comments} 
                                            onChange={(e) => setComments(e.target.value)} 
                                        />
                                    </div>
                                </div>
                                <button className="registerCandidate" onClick={handleRegisterCandidate}>
                                    Register Candidate >
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterCandidate;
