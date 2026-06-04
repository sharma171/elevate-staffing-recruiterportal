import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2, Keyboard, UserSearch } from 'lucide-react';
import "./css/spotlight.css"
import { Navigate, useNavigate } from 'react-router-dom';

// Utility hook for debouncing search input
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const CandidateSearchModal = ({ centralSearch, centralOpen, setCentralSearch, setCentralOpen, user }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    function getPermissions() {
        const stored = sessionStorage.getItem("permissions");

        if (!stored) return null;

        const { data } = JSON.parse(stored);

        return (data?.modules?.talentPool?.sections);
    }
    const [userPermissions, setUserPermissions] = useState({});
    useEffect(() => {
        const persmissionsset = getPermissions();
        setUserPermissions(persmissionsset);
        console.log("permissiondata", persmissionsset);
    }, [user, centralOpen]);

    // Debounce logic
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // 1. Initialize Recent Candidates from LocalStorage (or use default mock data)
    const [recentCandidates, setRecentCandidates] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem("recentCandidates");
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse recent candidates", e);
                }
            }
        }
        // Default initial data if nothing in storage
        return [];
    });

    // 2. Function to handle saving to LocalStorage (Max 5)
    const addToRecents = (candidate) => {
        setRecentCandidates((prev) => {
            // Remove duplicates based on ID or Name (using ID here)
            const filtered = prev.filter((c) => c.id !== candidate.id);

            // Add new candidate to the top, slice to keep only 5
            const updated = [candidate, ...filtered].slice(0, 5);

            // Save to localStorage
            localStorage.setItem("recentCandidates", JSON.stringify(updated));
            return updated;
        });
    };

    // Helper to determine badge color based on status
    const getStatusColor = (status) => {
        const s = status?.toLowerCase() || "";
        if (s.includes("inactive")) return "bg-gray-100 text-gray-800";
        if (s.includes("active")) return "bg-green-100 text-green-800";
        if (s.includes("hold")) return "bg-yellow-100 text-yellow-800";
        if (s.includes("available")) return "bg-blue-100 text-blue-800";
        if (s.includes("pending")) return "bg-orange-100 text-orange-800";
        return "bg-slate-100 text-slate-800";
    };

    // Helper to determine dot color
    const getDotColor = (status) => {
        const s = status?.toLowerCase() || "";
        if (s.includes("inactive")) return "bg-gray-400";
        if (s.includes("active")) return "bg-green-500";
        if (s.includes("available")) return "bg-blue-500";
        if (s.includes("pending")) return "bg-orange-500";
        return "bg-slate-400";
    };

    const checkCandidatePermission = (candidate) => {
        if (!userPermissions) return true;

        const role = candidate.role;
        if (role === "Active Talent" && userPermissions["active"] === "Hide") return false;
        if (role === "Available Talent" && userPermissions["available"] === "Hide") return false;
        if (role === "Inactive Talent" && userPermissions["inactive"] === "Hide") return false;
        if (role === "Pending Talent" && userPermissions["pending"] === "Hide") return false;

        return true;
    };

    // The API Implementation
    const fetchCandidates = useCallback(async (term) => {
        if (!term || term.length < 3) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                "https://fetch-bench-candidates-search-v3-305451280005.us-east1.run.app/",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        emailid: user?.email,
                        search_term: term,
                    }),
                }
            );

            const data = await response.json();

            const mappedResults = Object.entries(data || {}).map(([key, value]) => {
                const fullName = `${value.first_name || ""} ${value.last_name || ""}`.trim();
                return {
                    id: key,
                    name: fullName || value.primary_email,
                    role: value.talent_status || "Candidate",
                    visa: value.visa_status || "N/A",
                    status: value.current_status || "Unknown",
                    initials: (value.first_name?.[0] || "") + (value.last_name?.[0] || ""),
                    color: getDotColor(value.talent_status),
                    statusColor: getStatusColor(value.talent_status)
                };
            });

            setResults(mappedResults);

        } catch (err) {
            console.error("Search failed", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debouncedSearchTerm && debouncedSearchTerm.length >= 3) {
            fetchCandidates(debouncedSearchTerm);
        } else {
            setResults([]);
        }
    }, [debouncedSearchTerm, fetchCandidates]);

    // Handle clicking a candidate
    const handleSelectCandidate = (candidate) => {
        addToRecents(candidate);
        const talentuser = candidate.role.toLowerCase().replace(/\s+/g, "");
        const talentId = candidate.id.replace("id: ", "");
        if(talentuser==="availabletalent"){
            setCentralSearch(candidate);
            navigate(`/availableTalent?id=${talentId}`);
        }
        else{
            navigate(`/${talentuser}?id=${talentId}`);
            setCentralSearch(candidate);
        }
    };

    if (!centralOpen) return null;

    const isTypingState = searchTerm.length > 0 && searchTerm.length < 3;
    const showRecent = searchTerm.length === 0;
    // Determine basic list
    const rawList = showRecent ? recentCandidates : results;

    const displayList = rawList.filter(candidate => checkCandidatePermission(candidate));
    const groupTitle = showRecent ? "Recent Candidates" : "Search Results";

    return (
        <div className={`fixed inset-0 z-[99] flex items-center justify-center Interfont disableBgScroll ${centralOpen?"open":""}`}>
            <div
                className="fixed inset-0 bg-black/0  fade-in-0 backdrop-blur-[1px]"
                onClick={() => { setCentralOpen(!setCentralOpen) }}
                aria-hidden="true"
            />

            <div
                role="dialog"
                className="!relative !z-[90999] !grid w-full max-w-lg !gap-4 border !bg-white p-0 shadow-lg !rounded-xl overflow-hidden  zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] duration-200"
            >
                <div className="flex h-full w-full flex-col overflow-hidden !rounded-md !text-slate-950">

                    {/* Search Input */}
                    <div className="flex !items-center !border-solid border-[#e7e7ef] !border-b-[1px] border-l-0 border-t-0 border-r-0 !px-3" cmdk-input-wrapper="">
                        <Search className="mr-2 h-[20px] w-[20px] shrink-0 opacity-50" />
                        <input
                            className="flex h-11 w-full rounded-md bg-transparent py-[16px] text-[#67677c] font-medium border-none text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Search by name, email, or visa status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                        {loading && <Loader2 className="mr-2 h-[20px] w-[20px] shrink-0 opacity-50 animate-spin" />}
                    </div>

                    {/* List Area */}
                    <div className="max-h-[400px] overflow-y-auto overflow-x-hidden px-[8px] py-[4px]">

                        {/* 1. TYPING STATE */}
                        {isTypingState && (
                            <div cmdk-list-sizer="">
                                <div className="py-6 text-center text-sm" role="presentation">
                                    <div className="flex flex-col items-center gap-3 py-8 px-4">
                                        <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                            <Keyboard className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium text-slate-950">Keep typing...</p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Enter at least <span className="font-semibold text-blue-600">3 characters</span> to search
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. LOADING STATE */}
                        {!isTypingState && loading && (
                            <div cmdk-list-sizer="">
                                <div className="py-6 text-center text-sm" role="presentation">
                                    <div className="flex flex-col items-center gap-3 py-8 px-4">
                                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium text-slate-950">Searching candidates...</p>
                                            <p className="text-sm text-slate-500 mt-1">Looking for "{searchTerm}"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. NO RESULTS STATE */}
                        {!isTypingState && !loading && searchTerm.length >= 3 && results.length === 0 && (
                            <div cmdk-list-sizer="">
                                <div className="py-6 text-center text-sm" role="presentation">
                                    <div className="flex flex-col items-center gap-3 py-8 px-4">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                            <UserSearch className="h-6 w-6 text-slate-500" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium text-slate-950">No candidates found</p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                No results for "<span className="font-medium text-slate-900">{searchTerm}</span>"
                                            </p>
                                            <p className="text-xs text-slate-400 mt-2">
                                                Try searching by first name, email, or visa status
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. LIST CONTENT (Recent OR Search Results) */}
                        {!isTypingState && !loading && (results.length > 0 || showRecent) ? (
                            <>
                                {/* {results.length===0? (<>
                                    <div cmdk-list-sizer="">
                                        <div className="py-6 text-center text-sm" role="presentation">
                                            <div className="flex flex-col items-center gap-3 py-8 px-4">
                                                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                                    <Keyboard className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium text-slate-950">Type to search...</p>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        Enter at least <span className="font-semibold text-blue-600">3 characters</span> to search
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>) : (<> */}

                                <div className="overflow-hidden text-slate-950">
                                    <div className="px-2 py-1.5 text-xs font-medium text-[#67677e]">
                                        {groupTitle}
                                    </div>
                                    {showRecent && displayList.length === 0 && (
                                        <>
                                            <div cmdk-list-sizer="">
                                                <div className="py-6 text-center text-sm" role="presentation">
                                                    <div className="flex flex-col items-center gap-3 py-8 px-4">
                                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                            <UserSearch className="h-6 w-6 text-slate-500" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="font-medium text-slate-950">No recent candidates</p>
                                                            <p className="text-xs text-slate-400 mt-2">
                                                                Try searching by first name, email, or visa status
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {displayList.map((candidate, index) => (
                                        <div
                                            key={candidate.id || index}
                                            onClick={() => handleSelectCandidate(candidate)}
                                            className="group relative flex cursor-pointer select-none items-center !gap-3 !rounded-lg px-[8px] py-[12px] text-sm outline-none hover:bg-[#3c83f6] hover:!text-white data-[selected=true]:bg-slate-100 "
                                        >
                                            {/* Avatar */}
                                            <div className="relative">
                                                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full">
                                                    <span className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm">
                                                        {candidate.initials || "??"}
                                                    </span>
                                                </span>
                                                {/* Dot */}
                                                {/* <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${candidate.color || 'bg-gray-400'}`}></span> */}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-[6px]">
                                                    <span className=" fw-medium truncate">{candidate.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-[#67677e] group-hover:text-white ">
                                                    <span className="truncate">{candidate.role}</span>
                                                    <span>•</span>
                                                    <span>{candidate.visa}</span>
                                                </div>
                                            </div>

                                            {/* Badge */}
                                            <div className={`!inline-flex !items-center !rounded-full !border !px-2.5 !py-0.5 !text-xs !font-semibold ! ${candidate.statusColor}`}>
                                                {candidate.role}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* </>)} */}
                            </>
                        ) : (<>

                        </>)}

                    </div>
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => { setCentralOpen(!setCentralOpen) }}
                    className="absolute right-4 top-3 rounded-full bg-white opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
    );
};

export default CandidateSearchModal;