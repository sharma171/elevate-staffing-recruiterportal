import {
  Search,
  Users,
  Filter,
  ChevronDown,
  User,
  Briefcase,
  Shield,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { Container, Panel, Input, InputGroup, SelectPicker, Loader, Badge, Grid, Row, Col, Placeholder } from "rsuite";
import { Icon } from "rsuite";
// const { Paragraph } = Placeholder;
import Dashnav from "../../components/dashnav";
import "./recruiterAnalysis.css";
import OverlayModal from "../../components/OverlayModal";
import RecruiterDetailSheet from "./RecruiterDetailSheet";
// import RecruiterAnalysisSkeleton from "./RecruiterAnalysisSkeleton";

import { useMemo } from "react";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../authContext";
import { Link, useNavigate } from "react-router-dom";
import ChildComponent from "./RecruiterAnalysisDetails";
import { ReactComponent as AssignedIcon } from "./images/assignedIcon.svg";
import { ReactComponent as SubmissionIcon } from "./images/submissionIcon.svg";
import { ReactComponent as TotalInterview } from "./images/totalInterview.svg";
import { ReactComponent as TotalRateConfirmation } from "./images/totalRateconfirmation.svg";
import { ReactComponent as TotalSubmission } from "./images/totalSubmisssion.svg";
import { ReactComponent as ZeroSubmission } from "./images/zeroSubmission.svg";
import { ReactComponent as SideIconFour } from "./SideIconFour.svg";
import { ReactComponent as SideIconThree } from "./SideIconThree.svg";
import { ReactComponent as UserIcon } from "./userIcon.svg";
import { useGlobalContext } from "../../globalContext";
import styles from "../talentpool/css/TalentPool.module.css";
import ProfileLogo from "../../assets/images/profile.png";
import ProfileLogoComponent from "../../components/ProfileComponent";
import { ThemeLoader } from "../../components";
import { toast } from "react-toastify";
const recruitersData = [
  {
    id: 1,
    name: "Nandini Priyanka Thota",
    email: "nandini@4spheresolutions.com",
    role: "Sales",
    team: "Team-N",
    level: "Manager",
    joined: "11/5/2025",
    status: "Active",
  },
  {
    id: 2,
    name: "Poojitha Mallisetty",
    email: "poojitha@4spheresolutions.com",
    role: "Sales",
    team: "Team-N",
    level: "Manager",
    joined: "12/8/2025",
    status: "Active",
  },
  {
    id: 3,
    name: "Rajya Lakshmi Jonnalagadda",
    email: "Lakshmi@4spheresolutions.com",
    role: "Marketing",
    team: "Team C",
    level: "Manager",
    joined: "3/13/2025",
    status: "Active",
  },
  {
    id: 4,
    name: "Jahnavi Nuthakki",
    email: "jahnavi@4spheresolutions.com",
    role: "Marketing",
    team: "Team C",
    level: "Manager",
    joined: "6/27/2025",
    status: "Active",
  },
  {
    id: 5,
    name: "Bhagya Lakshmi Pottella",
    email: "bhagyalakshmi@4spheresolutions.com",
    role: "Sales",
    team: "Team-N",
    level: "Manager",
    joined: "11/10/2025",
    status: "Active",
  },
  {
    id: 6,
    name: "Rishitha Gontumukkala",
    email: "rishitha.g@4spheresolutions.com",
    role: "Sales",
    team: "Team C", // Inferred from similar structure, though snippet had Sales/Team C conflict visually
    level: "Manager",
    joined: "12/22/2025",
    status: "Active",
  },
  {
    id: 7,
    name: "Subrahmanayam Gujjapineni",
    email: "subrahmanyam@4spheresolutions.com",
    role: "Sales",
    team: "Team-N",
    level: "Manager",
    joined: "7/9/2025",
    status: "Inactive",
  },
  {
    id: 8,
    name: "Nainesh Kumar Nampally",
    email: "nainesh.k@4spheresolutions.com",
    role: "Marketing",
    team: "Team B",
    level: "Manager",
    joined: "7/2/2025",
    status: "Active",
  },
  {
    id: 9,
    name: "Raja Shyama Sundar",
    email: "raja@4spheresolutions.com",
    role: "Accounts",
    team: "Accounts Team",
    level: "Manager",
    joined: "1/2/2024",
    status: "Active",
  },
  {
    id: 10,
    name: "Nikhil Arelli",
    email: "nikhil1@4spheresolutions.com",
    role: "Marketing",
    team: "Team B",
    level: "Manager",
    joined: "12/22/2025",
    status: "Active",
  },
];
const ITEMS_PER_PAGE = 9;

const RecuiterList = ({ storedUser, user }) => {
  // State for Data from API
  const { Paragraph } = Placeholder;
  const [recruitersData, setRecruitersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState(null);

  // State for Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  // State for Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // --- FIX: Create specific refs for each dropdown ---
  const teamRef = useRef(null);
  const statusRef = useRef(null);

  // State for UI (Dropdown visibility)
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              emailid: storedUser.email,
              operation: "retrieve",
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const jsonResponse = await response.json();

        // Transform API response to match UI structure
        const mappedData = jsonResponse.data.map((item) => {
          // Access the first object in the 'details' array
          const details = item.details && item.details.length > 0 ? item.details[0] : {};
          // Helper to normalize status (e.g. "inactive" -> "Inactive")
          const rawStatus = details.account_status || "Inactive";
          const normalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

          return {
            id: details.id,
            name: details.recruiter_name,
            email: details.recruiter_email,
            // Use job_title, fallback to user_role if empty
            role: details.job_title || details.user_role || "Recruiter",
            team: details.recruiter_team || "Unassigned",
            // Logic to determine level displayed in badge
            level: details.is_manager ? "Manager" : details.user_role || "Member",
            // Format date: "2025-10-18 02:02:04" -> "2025-10-18"
            joined: details.recruiter_joining_date ? details.recruiter_joining_date.split(" ")[0] : "N/A",
            status: normalizedStatus, // <--- Updated to use normalized Status
            detailedData: item,
          };
        });

        setRecruitersData(mappedData);
      } catch (err) {
        console.error("Failed to fetch recruiters:", err);
        setError("Failed to load recruiter data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecruiters();
  }, []);
  // --- API INTEGRATION END ---

  // Extract Unique Teams and Statuses for Dropdown Options based on fetched data
  const teams = useMemo(() => {
    if (recruitersData.length === 0) return ["All Teams"];
    const uniqueTeams = [...new Set(recruitersData.map((r) => r.team).filter(Boolean))];
    return ["All Teams", ...uniqueTeams];
  }, [recruitersData]);

  const statuses = useMemo(() => {
    if (recruitersData.length === 0) return ["All Statuses"];
    // CHANGE HERE: Use 'r.status' instead of 'r.account_status'
    const uniqueStatuses = [...new Set(recruitersData.map((r) => r.status).filter(Boolean))];
    return ["All Statuses", ...uniqueStatuses];
  }, [recruitersData]);

  // 1. Filtering Logic
  const filteredData = useMemo(() => {
    return recruitersData.filter((recruiter) => {
      // Search Filter (Name or Email)
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (recruiter.name && recruiter.name.toLowerCase().includes(query)) ||
        (recruiter.email && recruiter.email.toLowerCase().includes(query)) ||
        (recruiter.team && recruiter.team.toLowerCase().includes(query));

      // Team Filter
      const matchesTeam = selectedTeam === "All Teams" || recruiter.team === selectedTeam;

      // Status Filter
      const matchesStatus = selectedStatus === "All Statuses" || recruiter.status === selectedStatus;

      return matchesSearch && matchesTeam && matchesStatus;
    });
  }, [searchQuery, selectedTeam, selectedStatus, recruitersData]);

  // 2. Pagination Logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTeam, selectedStatus]);

  // Handle clicking outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close Team Dropdown if clicked outside
      if (openDropdown === "team" && teamRef.current && !teamRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
      // Close Status Dropdown if clicked outside
      if (openDropdown === "status" && statusRef.current && !statusRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);
  return (
    <>
      <div className="signatureContainer Interfont homepageFontfamily">
        {/* Content Area */}
        {isLoading ? (
          <div className="px-0">
            <div className="space-y-4">
              <div
                className="flex items-center justify-between !gap-3 !px-4 !py-3 border bg-blue-50 border-blue-200"
                style={{ borderRadius: "0.5rem" }}
              >
                <div className="flex items-center !gap-3">
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  <span className="text-sm font-medium text-blue-800">Loading recruiters...</span>
                </div>
              </div>

              {/* Top Filter Bar */}
              <div className="flex items-center !gap-4 flex-wrap">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md ">
                  <Search className="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    className="flex h-10 w-full rounded-xl border border-input bg-background py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground placeholder:!text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
                    placeholder="Search recruiters by name, email, or team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Team Dropdown */}
                <div className="relative flex items-center gap-2" ref={teamRef}>
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <button
                    onClick={() => toggleDropdown("team")}
                    className="flex h-10 items-center rounded-xl justify-between rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-[180px] bg-transparent hover:bg-accent hover:text-accent-foreground"
                  >
                    <span className="  line-clamp-1 text-left">
                      {selectedTeam} {`(${filteredData.length})`}{" "}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 opacity-50 transition-transform ${openDropdown === "team" ? "rotate-180" : ""}`}
                    />
                  </button>

                  {openDropdown === "team" && (
                    <div className="absolute top-11 right-0 w-[180px] z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 bg-white">
                      <div className="p-1 max-h-60 overflow-y-auto">
                        {teams.map((team) => (
                          <div
                            key={team}
                            onClick={() => {
                              setSelectedTeam(team);
                              setOpenDropdown(null);
                            }}
                            className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 ${selectedTeam === team ? "font-semibold" : ""}`}
                          >
                            {selectedTeam === team && (
                              <span className="  absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                <Check className="h-4 w-4" />
                              </span>
                            )}
                            {team}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="relative flex items-center gap-2" ref={statusRef}>
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <button
                    onClick={() => toggleDropdown("status")}
                    className="flex h-10 rounded-xl items-center justify-between rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-[160px] bg-transparent hover:bg-accent hover:text-accent-foreground"
                  >
                    <span className="  line-clamp-1 text-left">
                      {selectedStatus === "All Statuses" ? (
                        <>All {`(${filteredData.length})`}</>
                      ) : (
                        <>
                          {selectedStatus} {`(${filteredData.length})`}
                        </>
                      )}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 opacity-50 transition-transform ${openDropdown === "status" ? "rotate-180" : ""}`}
                    />
                  </button>

                  {openDropdown === "status" && (
                    <div className="absolute top-11 right-0 w-[160px] z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 bg-white">
                      <div className="p-1">
                        {statuses.map((status) => (
                          <div
                            key={status}
                            onClick={() => {
                              setSelectedStatus(status);
                              setOpenDropdown(null);
                            }}
                            className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 ${selectedStatus === status ? "font-semibold" : ""}`}
                          >
                            {selectedStatus === status && (
                              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                <Check className="h-4 w-4" />
                              </span>
                            )}
                            {status}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Showing Badge */}
                <div
                  className="inline-flex items-center rounded-xl  text-xs font-medium px-3 py-1.5 text-[#1e3a5f]"
                  style={{ border: "1px solid #1e3a5f" }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Showing: {filteredData.length}
                </div>
              </div>

              {/* Skeleton Grid */}
              <div className="grid !gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-xl border text-card-foreground shadow-sm bg-[transparent]">
                    <div className="flex flex-col space-y-1.5 p-6 pb-3">
                      <div className="animate-[pulseOpacity_2s_infinite] rounded-xl h-5 w-40 bg-[#f1f1f9]"></div>
                    </div>
                    <div className="p-6 pt-0 space-y-2">
                      <div className="animate-[pulseOpacity_2s_infinite] rounded-xl h-4 w-full bg-[#f1f1f9]"></div>
                      <div className="animate-[pulseOpacity_2s_infinite] rounded-xl h-4 w-3/4 bg-[#f1f1f9]"></div>
                      <div className="animate-[pulseOpacity_2s_infinite] rounded-xl h-4 w-1/2 bg-[#f1f1f9]"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-500">{error}</div>
        ) : (
          <>
            <div className="px-0" ref={dropdownRef}>
              <div className="space-y-4">
                {/* Top Filter Bar */}
                <div className="flex items-center !gap-4 flex-wrap">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="lucide lucide-search absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      className="flex h-10 w-full rounded-xl border border-input bg-background py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground placeholder:!text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
                      placeholder="Search recruiters by name, email, or team..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Team Dropdown */}
                  <div className="relative flex items-center gap-2" ref={teamRef}>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <button
                      onClick={() => toggleDropdown("team")}
                      className="flex h-10 items-center rounded-xl justify-between rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-[180px] bg-transparent hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="  line-clamp-1 text-left">
                        {selectedTeam} {`(${filteredData.length})`}{" "}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 opacity-50 transition-transform ${openDropdown === "team" ? "rotate-180" : ""}`}
                      />
                    </button>

                    {openDropdown === "team" && (
                      <div className="absolute top-11 right-0 w-[180px] z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 bg-white">
                        <div className="p-1 max-h-60 overflow-y-auto">
                          {teams.map((team) => (
                            <div
                              key={team}
                              onClick={() => {
                                setSelectedTeam(team);
                                setOpenDropdown(null);
                              }}
                              className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 ${selectedTeam === team ? "font-semibold" : ""}`}
                            >
                              {selectedTeam === team && (
                                <span className="  absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                  <Check className="h-4 w-4" />
                                </span>
                              )}
                              {team}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div className="relative flex items-center gap-2" ref={statusRef}>
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <button
                      onClick={() => toggleDropdown("status")}
                      className="flex h-10 rounded-xl items-center justify-between rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-[160px] bg-transparent hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="  line-clamp-1 text-left">
                        {selectedStatus === "All Statuses" ? (
                          <>All {`(${filteredData.length})`}</>
                        ) : (
                          <>
                            {selectedStatus} {`(${filteredData.length})`}
                          </>
                        )}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 opacity-50 transition-transform ${openDropdown === "status" ? "rotate-180" : ""}`}
                      />
                    </button>

                    {openDropdown === "status" && (
                      <div className="absolute top-11 right-0 w-[160px] z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 bg-white">
                        <div className="p-1">
                          {statuses.map((status) => (
                            <div
                              key={status}
                              onClick={() => {
                                setSelectedStatus(status);
                                setOpenDropdown(null);
                              }}
                              className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 ${selectedStatus === status ? "font-semibold" : ""}`}
                            >
                              {selectedStatus === status && (
                                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                  <Check className="h-4 w-4" />
                                </span>
                              )}
                              {status}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Showing Badge */}
                  <div
                    className="inline-flex items-center rounded-xl  text-xs font-medium px-3 py-1.5 text-[#1e3a5f]"
                    style={{ border: "1px solid #1e3a5f" }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Showing: {filteredData.length}
                  </div>
                </div>
                {/* Cards Grid */}
                <div className="grid !gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {currentData.length > 0 ? (
                    currentData.map((recruiter) => (
                      <div
                        key={recruiter.id}
                        className="rounded-xl border text-card-foreground shadow-none bg-white hover:!shadow-sm transition-shadow cursor-pointer"
                        onClick={() => setSelectedRecruiter(recruiter)}
                      >
                        {/* Card Header */}
                        <div className="flex flex-col space-y-1.5 p-6 pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 max-w-[calc(100%+30px)]">
                              <div className="h-10 w-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-[#1e3a5f]" />
                              </div>
                              <div className="max-w-[250px] w-[250px]">
                                <h3 className="tracking-tight text-base font-semibold">{recruiter.name}</h3>
                                <p className="text-xs text-muted-foreground truncate max-w-[calc(100%-25px)]">
                                  {recruiter.email}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors border-2 border-solid shadow-none ${recruiter.status === "Active" ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}
                            >
                              {recruiter.status.charAt(0).toUpperCase() + recruiter.status.slice(1).toLowerCase()}
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 pt-0 space-y-2 text-sm">
                          <div className="flex items-center !gap-2 text-muted-foreground">
                            <Briefcase className="h-4 w-4" style={{ color: "#67677e" }} />
                            <span className="truncate text-sm !color-[#67677e]" style={{ color: "#67677e" }}>
                              {recruiter.role}
                            </span>
                          </div>
                          <div className="flex items-center !gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" style={{ color: "#67677e" }} />
                            <span className="text-sm !color-[#67677e]" style={{ color: "#67677e" }}>
                              {recruiter.team}
                            </span>
                          </div>
                          <div className="flex items-center !gap-2 text-muted-foreground">
                            <Shield className="h-4 w-4" style={{ color: "#67677e" }} />
                            <span className="capitalize text-sm !color-[#67677e]" style={{ color: "#67677e" }}>
                              recruiter
                            </span>
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors !border-transparent bg-[#f3f3fb] text-[hsl(258_90%_5%)] hover:bg-[#f3f3fc]/80 text-xs">
                              {recruiter.level}
                            </div>
                          </div>
                          <div className="flex items-center !gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" style={{ color: "#67677e" }} />
                            <span className="text-sm !color-[#67677e]" style={{ color: "#67677e" }}>
                              Joined: {formatDate(recruiter.joined)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center text-muted-foreground">
                      No recruiters found matching your criteria.
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {filteredData.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-2 border rounded-lg bg-background mt-4">
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages} ({filteredData.length} recruiters)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange("prev")}
                        disabled={currentPage === 1}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-[#fff] hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange("next")}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-[#fff] hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <RecruiterDetailSheet
          isOpen={!!selectedRecruiter}
          onClose={() => setSelectedRecruiter(null)}
          selectedRecruiter={selectedRecruiter}
          storedUser={storedUser}
          user={user}
        />
      </div>
    </>
  );
};

const RecruiterAnalysis = () => {
  const { selectedEmail, setSelectedEmail } = useGlobalContext();

  const { user } = useAuth();
  console.log("main user dateils log", user);

  const navigate = useNavigate();
  const ProfileOpen = () => {
    navigate("/userProfile");
  };
  const [recruitersBList, setBRecruitersList] = useState([]); // State for recruiters list
  const [selectedDropdownEmail, setSelectedDropdownEmail] = useState("");
  const [recruiterAliasName, setRecruiterAliasName] = useState(null);
  const [data, setData] = useState(null); // State to store API response
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [openDetails, setOPenDetails] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };
  let storedUser = JSON.parse(localStorage.getItem("user")) || "";
  // let storedUser = {email:"marketing@4spheresolutions.com"} || "";

  useEffect(() => {
    // if (!recruiterAliasName) return;
    setData(null);
    console.log("recruiterAliasName selected:", recruiterAliasName);
    const fetchRecruiterAnalysis = async () => {
      setLoading(true);
      try {
        setError(null);

        const response = await fetch(
          "https://us-east1-recruiterportal.cloudfunctions.net/fetch_recruiter_analysis_v3",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              emailid: storedUser.email,
              email: selectedDropdownEmail, // Pass recruiterAliasName here
            }),
          },
        );

        const result = await response.json();

        if (response.ok) {
          setData(result);
          console.log("result.details", result);
          // Update data state with fetched result
        } else {
          throw new Error(result.message || "Failed to fetch recruiter analysis.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDropdownEmail) {
      fetchRecruiterAnalysis();
    }
  }, [recruiterAliasName]);

  useEffect(() => {
    setLoading(true);
    const fetchRecruiters = async () => {
      try {
        const response = await fetch(
          "https://us-east1-recruiterportal.cloudfunctions.net/Retrieve_Recruiter_Details_v3",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              emailid: storedUser.email,
              operation: "retrieve",
            }),
          },
        );

        const data = await response.json();
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        if (response.ok) {
          // Extract unique recruiters list with their ID
          const recruiters = data.data.map((item) => ({
            recruiter_alias_name: item.recruiter_alias_name || "Unknown", // Extract the top-level recruiter_alias_name
          }));
          console.log("recruiters", recruiters);
          if (recruiters.length > 0) {
            setRecruiterAliasName(recruiters.recruiter_alias_name);
          }
          // Update state with the extracted data
          setBRecruitersList(recruiters);
          console.log("Recruiters List:", recruiters);
        } else {
          console.error("Failed to fetch recruiters:", data.message);
        }
      } catch (error) {
        setLoading(false);
        console.log("Error fetching recruiters:", error);
      }
    };

    fetchRecruiters();
  }, []);

  function goToTotalAssignedCandidate(activeTab) {
    console.log(activeTab, "activeTab");
    navigate(`/analysis?activeTab=${activeTab}`, { state: selectedDropdownEmail });
    setOPenDetails(true);
  }

  const handleFilterChange = (value) => {
    setSelectedDropdownEmail(value);
    setSelectedEmail(value);
    localStorage.setItem("selectedEmail", value);
    setRecruiterAliasName(value);
  };

  {
    return (
      <div className={`py-2 px-2 px-md-2 rightcontent`}>
        <div className="headerBackground text-white p-3 mb-3" style={{ borderRadius: "10px", minHeight: "85px" }}>
          <div>
            <h2 className="m-0 fw-bold h2 fs-5">Recruiter Analysis</h2>
            <p className="fs-14">Comprehensive overview of recruiter performance and growth</p>
          </div>
        </div>
        <RecuiterList storedUser={storedUser} user={user} />

        {/* <div className="choose-rec dropdown pe-1">
          <UserIcon />
          <div className={styles.analysis}>
            <SelectPicker
              className="selectpickerTransparent"
              menuClassName="selectpickerTransparentItems"
              placement="autoVertical"
              cleanable={false}
              value={selectedDropdownEmail}
              onChange={handleFilterChange}
              data={[...new Set(recruitersBList)].map((item) => ({
                label: item.recruiter_alias_name,
                value: item.recruiter_alias_name,
              }))}
              placeholder="Select Recruiter"
            />
          </div>
        </div>

        <div className="row-flex rAnalysisDash">
          <div
            className="rACards cardOne"
            onClick={() => {
              if (!selectedDropdownEmail) {
                toast.error("Kindly choose a recruiter from the dropdown before proceeding.");
              } else {
                goToTotalAssignedCandidate("tab2");
              }
            }}
          >
            <h4 className="topHeading" style={{ whiteSpace: "break-spaces" }}>
              Total Assigned Candidates
            </h4>
            <div className="row-flex rowInfo">
              <div className="icon">
                <AssignedIcon />
              </div>
              <div className="row-flex cardData">
                <div className="number-item-one">{data?.summary?.total_assigned_candidates ?? 0}</div>
                <div className="all-time-one">/ All Time</div>
              </div>
            </div>
          </div>

          <div
            className="rACards cardTwo"
            onClick={() => {
              if (!selectedDropdownEmail) {
                toast.error("Kindly choose a recruiter from the dropdown before proceeding.");
              } else {
                goToTotalAssignedCandidate("tab3");
              }
            }}
          >
            <h4 className="topHeading" style={{ whiteSpace: "break-spaces" }}>
              Submissions by Type
            </h4>
            <div className="row-flex rowInfo">
              <div className="icon">
                <SubmissionIcon />
              </div>
              <div className="row-flex cardData">
                <div className="number-item-one">{data?.summary?.submissions_by_type_summary ?? 0}</div>
                <div className="all-time-one">/ All Time</div>
              </div>
            </div>
          </div>

          <div
            className="rACards cardThree"
            onClick={() => {
              if (!selectedDropdownEmail) {
                toast.error("Kindly choose a recruiter from the dropdown before proceeding.");
              } else {
                goToTotalAssignedCandidate("tab4");
              }
            }}
          >
            <h4 className="topHeading" style={{ whiteSpace: "break-spaces" }}>
              Total Interview Tech Screenings
            </h4>
            <div className="row-flex rowInfo">
              <div className="icon">
                <TotalInterview />
              </div>
              <div className="row-flex cardData">
                <div className="number-item-one">{data?.summary?.total_interview_tech_screenings ?? 0}</div>
                <div className="all-time-one">/ All Time</div>
              </div>
            </div>
          </div>

          <div
            className="rACards cardFour"
            onClick={() => {
              if (!selectedDropdownEmail) {
                toast.error("Kindly choose a recruiter from the dropdown before proceeding.");
              } else {
                goToTotalAssignedCandidate("tab1");
              }
            }}
          >
            <h4 className="topHeading" style={{ whiteSpace: "break-spaces" }}>
              Candidates with zero Submissions
            </h4>
            <div className="row-flex rowInfo">
              <div className="icon">
                <ZeroSubmission />
              </div>
              <div className="row-flex cardData">
                <div className="number-item-one">
                  {data?.summary?.candidates_with_zero_submissions_last_24_hours ?? 0}
                </div>
                <div className="all-time-one">/ Last 24 Hours</div>
              </div>
            </div>
          </div>

          <div
            className="rACards cardFive"
            onClick={() => {
              if (!selectedDropdownEmail) {
                toast.error("Kindly choose a recruiter from the dropdown before proceeding.");
              } else {
                goToTotalAssignedCandidate("tab5");
              }
            }}
          >
            <h4 className="topHeading" style={{ whiteSpace: "break-spaces" }}>
              Total Rate Confirmations
            </h4>
            <div className="row-flex rowInfo">
              <div className="icon">
                <TotalRateConfirmation />
              </div>
              <div className="row-flex cardData">
                <div className="number-item-one">{data?.summary?.total_rate_confirmations ?? 0}</div>
                <div className="all-time-one">/ All Time</div>
              </div>
            </div>
          </div>

          <div
            className="rACards cardSix"
            onClick={() => {
              if (!selectedDropdownEmail) {
                toast.error("Kindly choose a recruiter from the dropdown before proceeding.");
              } else {
                goToTotalAssignedCandidate("tab6");
              }
            }}
          >
            <h4 className="topHeading" style={{ whiteSpace: "break-spaces" }}>
              Total Submissions Last 24 Hours
            </h4>
            <div className="row-flex rowInfo">
              <div className="icon">
                <TotalSubmission />
              </div>
              <div className="row-flex cardData">
                <div className="number-item-one">{data?.summary?.total_submissions_last_24_hours ?? 0}</div>
                <div className="all-time-one">/ Last 24 Hours</div>
              </div>
            </div>
          </div>
        </div>
        <ThemeLoader show={loading} /> */}
      </div>
    );
  }
};

export default RecruiterAnalysis;
