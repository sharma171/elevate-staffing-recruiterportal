import React, { useState } from "react";
import "../assets/styles/Navbar_v2.css";
import Dashboard from '../assets/images/Dashboard.svg';
import organizationDetails from '../assets/images/organizationDetails.svg';
import BenchCandidates from '../assets/images/BenchCandidates.svg';
import RateConfirmatoion from '../assets/images/RateConfirmation.svg';
import JobSearch from '../assets/images/JobSearch.svg';
import VendorDirectory from '../assets/images/VendorDirectory.svg';
import ActiveInterviews from '../assets/images/ActiveInterviews.svg';
import RecruiterAnalysis from '../assets/images/RecruiterAnalysis.svg';
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
 
  return (
    <div className="v2-side-main">
      <div className="v2-topbar d-flex justify-between align-center">
        <div className="v2-topbar-img">
          <img src="https://recruiter.4spheresolutions.com/static/media/4sphereIcon.afbc5d59071e2c58f2b9.png"/>
        </div>
        <div>
          <h3>Hi, Akash</h3>
        </div>
      </div>
      <div
        className={`v2-side-nav cursor-pointer ${visible ? " " : "v2-side-nav-close" }`}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
          <ul className="v2-nav-list">
            <li className="v2-nav-list-item">
              <div className="d-flex gap-3">
                 <p className="v2-nav-text">Dashboard</p>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3" onClick={()=>navigate("/organizationDetails")}>
                <p className="v2-nav-text">Organization Details</p>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3" onClick={()=>navigate("/benchCandidates_v2")}>
                <p className="v2-nav-text">Bench Candidates</p>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3">
                <p className="v2-nav-text">Rate Confirmation</p>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3">
                <p className="v2-nav-text">Job Search</p>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3">
                <p className="v2-nav-text">Recruiter Analysis</p>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3">
                <p className="v2-nav-text">Vendor Directory</p>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3">
                <p className="v2-nav-text">Active Interviews</p>
              </div>
            </li>
          </ul>
        </div>
      <div className='v2-side-nav-top' onMouseEnter={() => setVisible(true)}>
      <ul className="v2-nav-list-top">
            <li className="v2-nav-list-item">
              <div className="d-flex gap-3">
                <img src={Dashboard}/>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3">
                <img src={organizationDetails}/>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3">
                <img src={BenchCandidates}/>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3">
                <img src={RateConfirmatoion}/>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3">
                <img src={JobSearch}/>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3">
                <img src={RecruiterAnalysis}/>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3">
                <img src={VendorDirectory}/>
              </div>
            </li>
            <li>
              <div className="d-flex  gap-3">
                <img src={ActiveInterviews}/>
              </div>
            </li>
          </ul>
      </div>
    </div>
  );
};

export default Navbar;
