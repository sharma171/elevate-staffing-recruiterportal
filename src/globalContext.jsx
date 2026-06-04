import React, { createContext, useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {

    // for recruiter Analisis
    const [selectedEmail, setSelectedEmail] = useState(localStorage.getItem('selectedEmail') || '');

    // For Bench Candidate

    const [searchBTerm, setBSearchTerm] = useState('');
    const [visaBStatusFilter, setBVisaStatusFilter] = useState('');
    const [currentStatusBench, setCurrentStatusBench] = useState('');
    const [teamsBFilter, setBTeamsFilter] = useState('');
    const [recruiterBFilter, setBRecruiterFilter] = useState('');

    // For Rate Confirmation

    const [searchTerm, setSearchTerm] = useState('');
    const [recruiterRateFilter, setRecruiterRateFilter] = useState('');
    const [statusRateFilter, setstatusRateFilter] = useState('');
    const [dateRateFilter, setdateRateFilter] = useState('');

    // For MyAssigned Candidate 
    const [searchTermAssigned, setsearchTermAssigned] = useState();
    const [visaStatusFilter, setVisaStatusFilter] = useState('');
    const [currentStatusAssigned, setcurrentStatusAssigned] = useState('');
    const [teamsFilter, setTeamsFilter] = useState('');
    const [setLocationFilterAssigned, setsetLocationFilterAssigned] = useState('');

    // For My Submission
    const [searchTermSubmission, setsearchTermSubmission] = useState('');
    const [recruiterFilter, setRecruiterFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // for Recruiter Details
    const [searchRecName, setSearchRecName] = useState('');
    const [filterByTeam, setFilterByTeam] = useState('');
    const [filterByStatus, setFilterByStatus] = useState('');
    const [filterByManager, setFilterByManager] = useState('');
    const [ sideBarLeft , setSideBarLeft] = useState(false)
    
    return (
        <GlobalContext.Provider value={{
            selectedEmail, setSelectedEmail, searchBTerm, setBSearchTerm, visaBStatusFilter, setBVisaStatusFilter
            , currentStatusBench, setCurrentStatusBench, teamsBFilter, setBTeamsFilter, recruiterBFilter, setBRecruiterFilter,
            searchTerm, setSearchTerm, recruiterRateFilter, setRecruiterRateFilter, statusRateFilter, setstatusRateFilter,
            dateRateFilter, setdateRateFilter, searchTermAssigned, setsearchTermAssigned, visaStatusFilter, setVisaStatusFilter
            , currentStatusAssigned, setcurrentStatusAssigned, teamsFilter, setTeamsFilter, setLocationFilterAssigned, setsetLocationFilterAssigned
            , searchTermSubmission, setsearchTermSubmission, recruiterFilter, setRecruiterFilter, statusFilter, setStatusFilter
            , dateFilter, setDateFilter, searchRecName, setSearchRecName, filterByTeam, setFilterByTeam, filterByStatus, setFilterByStatus
            ,filterByManager, setFilterByManager, sideBarLeft , setSideBarLeft
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return useContext(GlobalContext);
};
