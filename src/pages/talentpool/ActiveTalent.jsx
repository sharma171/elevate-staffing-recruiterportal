import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./css/TalentPool.module.css";
import api from "../../networking/api";
import { useAuth } from "../../authContext";
import otherGender from "../../images/otherGender.svg";
import images from "../../assets/images/new";
import { Confirm, EmptyView, SearchBox, ThemeLoader } from "../../components";
import CandidateModal from "./CandidateModal";
import AnalyzeModal from "./AnalyzeModal";
import { toast } from "react-toastify";
import FilterModal from "./FilterModal";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { SelectPicker } from "rsuite";
import TalentPoolInvite from "./TalentPoolInvite";
import { TbMessageDots } from "react-icons/tb";
import { FiPhone, FiMail } from "react-icons/fi";
import ContactMail from "./ContactMail";
import { getDeviceData } from "../../DeviceStore";
import sendEncryptedRequest from "../../components/EncryptedRequest";
import { Filter, Flag, MoreVertical, RotateCw, Search, Users, X } from "lucide-react";
import { FaChevronDown } from "react-icons/fa";
import CandidateSpotlightSearch from "./spotlightSearch";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../components/ui/select";

const {
  female_icon,
  male_icon,
  list,
  order_filter,
  priorityorder,
  status_filter,
  user_icon,
  visa_filter,
  visa_status,
  teamGroup,
  high,
  userChat,
  medium,
  low,
} = images;

let initialFilters = {
  priority: "All",
  current_status: "All",
  visa_status: "All",
  assigned_recruiter: "All",
  assigned_team: "All",
  send_work_status_email: "All",
  opt_letter_status: "All",
};

function getPermissions(route) {
  if (!route) return null;

  const normalizedRoute = route.replace("/", "").toLowerCase();

  const routePaths = {
    activetalent: "active",
    availabletalent: "available",
    inactivetalent: "inactive",
    pendingtalent: "pending",
    contact: "contact",
  };

  const permissionKey = routePaths[normalizedRoute];
  if (!permissionKey) return false;

  const stored = sessionStorage.getItem("permissions");
  if (!stored) return null;

  const parsed = JSON.parse(stored);
  const sections = parsed?.data?.modules?.talentPool?.sections;
  if (!sections) return false;

  const lowerCaseSections = Object.keys(sections).reduce((acc, key) => {
    acc[key.toLowerCase()] = sections[key];
    return acc;
  }, {});

  return lowerCaseSections[permissionKey.toLowerCase()] || false;
}

const STATUS_STYLES = {
  issued: {
    background: "#16a34a",
    color: "#fff",
  },
  "not issued": {
    background: "#dc2626",
    color: "#fff",
  },
  signed: {
    background: "#2563eb",
    color: "#fff",
  },
  expired: {
    background: "#f59e0b",
    color: "#fff",
  },
  cancelled: {
    background: "#b91c1c",
    color: "#fff",
  },
};

const DEFAULT_STYLE = {
  background: "#e5e7eb",
  color: "#374151",
};

function renderStatusLabel(status) {
  if (!status) return null;

  const key = String(status).toLowerCase();
  const styleConfig = STATUS_STYLES[key] || DEFAULT_STYLE;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        lineHeight: 1,
        backgroundColor: styleConfig.background,
        color: styleConfig.color,
      }}
    >
      {status}
    </span>
  );
}

const ActiveTalent = ({
  isResend,
  isAvailebleTalent = false,
  heading,
  skipFilter,
  extraPayload = {},
  candidateAnalysis,
  contactInfo,
}) => {
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [centralSearch, setCentralSearch] = useState([]);
  const [isRecruiterOpen, setIsRecruiterOpen] = useState(false);
  const [centralOpen, setCentralOpen] = useState(false);
  const [defaultCandidateDataByApi, setDefaultCandidateDataByApi] = useState({});
  const [filteredCandidatesdefault, setFilteredCandidatesDefault] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [recruiterData, setRecruiterData] = useState([]);
  const [simpleRecruiterData, setSimpleRecruiterData] = useState([]);
  const [filters, setFilters] = useState(initialFilters);

  // const [dropdownOpen, setDropdownOpen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isModalActive, setIsModalActive] = useState(false);
  const [isInviteModalActive, setisInviteModalActive] = useState(false);
  const [isInviteModalupdate, setisInviteModalupdate] = useState(false);
  const [deleteModal, setdeleteModal] = useState(false);
  const [resendModal, setresendModal] = useState(false);
  const [isView, setIsView] = useState(false);
  const [deleteId, setdeleteId] = useState(null);
  const [candidateData, setCandidateData] = useState(null);
  const [deleteText, setDeleteText] = useState("");
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [teamsData, setTeamsData] = useState([]);
  const [showAnalyzeModal, setshowAnalyzeModal] = useState(null);
  const [loading, setloading] = useState(null);
  const [loaderPage, setloaderPage] = useState(true);

  const [contactActionType, setContactActionType] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  let { keys, fingerprints } = getDeviceData();

  const searchName = searchParams.get("search");

  let isEmptyData = !Object.keys(defaultCandidateDataByApi)?.length;

  console.log(totalCandidates, "totalCandidates");

  const pickerRef = useRef(null);
  const contactPickerRef = useRef();

  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const accessPermition = getPermissions(pathname);
  const contactPermition = getPermissions("contact");

  let isHideContact = String(contactPermition).toLowerCase() == "hide";
  let isViewContact = String(contactPermition).toLowerCase() == "view";

  let isActions = String(accessPermition).toLowerCase() == "edit";

  const simpleteamsData = teamsData.map((item) => {
    return {
      val: item.team_name,
      // val: item.id,
      key: item.team_name,
    };
  });

  const { user } = useAuth();

  const handleModal = (val) => {
    setIsModalActive(val);
    // setDropdownOpen(false);
    setIsView(false);
    setdeleteId(null);
    if (!val) {
      setCandidateData(null);
    }
  };

  let removeNullValues = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;

    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => [key, removeNullValues(value)]),
    );
  };

  let findId = (obj) => {
    let objString = JSON.stringify(obj);
    let id = Object.keys(defaultCandidateDataByApi).find(
      (key) => JSON.stringify(defaultCandidateDataByApi[key]) === objString,
    );

    if (id) {
      return Number(id.replace("id: ", ""));
    }
    return null;
  };

  const deepEqual = (a, b) => {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a && b && typeof a === "object") {
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
      }
      if (!Array.isArray(a) && !Array.isArray(b)) {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) return false;
        for (let key of aKeys) {
          if (!b.hasOwnProperty(key) || !deepEqual(a[key], b[key])) return false;
        }
        return true;
      }
      return false;
    }
    return false;
  };

  function parseDuplicateKey(rawDetails) {
    let column = null;
    let message = null;

    try {
      const outer = JSON.parse(rawDetails);

      if (outer?.conflicting_emails?.length) {
        const match = outer.conflicting_emails[0].match(/^(\w+):/);
        if (match && match[1]) {
          column = match[1].trim();
        }
      }

      if (outer?.error) {
        message = outer.error.trim();
      }
    } catch {}

    return { column, message };
  }

  const addCandidate = async (data, callback, operation = "insert", finalSubmit) => {
    let payload = { columns: data, emailid: user.email, operation };

    let candidateId = candidateData?.id;

    let olderData = candidateData || {};

    if (candidateId) {
      let changedColumns = Object.keys(data).reduce((acc, key) => {
        if (!deepEqual(olderData[key], data[key])) {
          acc[key] = data[key];
        }
        return acc;
      }, {});

      if (Object.keys(changedColumns).length > 0) {
        payload = {
          emailid: user.email,
          modify: {
            columns: changedColumns,
            id: String(candidateId),
          },
        };
      } else {
        return;
      }
    } else {
      data = removeNullValues(data);
    }
    setloading(true);

    let result = await sendEncryptedRequest(payload, keys, fingerprints);
    setloading(false);

    if (result.status) {
      let res = result.data;
      toast.success(res?.message || "success");
      callback(res);
      if (finalSubmit) {
        getcandidate_Details();
      } else {
        getcandidate_Details(undefined, undefined, false, false);
      }
    } else {
      let err = result.data;
      let { column, message } = parseDuplicateKey(err?.response?.data?.details);

      if (column) {
        callback(null, column);
      }
      toast.error(message || err?.response?.data?.error || err?.response?.data?.message || err?.message || "error");
    }
  };

  const deleteBenchCandidates = async () => {
    let id = deleteId;
    let payload = { emailid: user.email, operation: "delete", id };
    setloading(true);

    let result = await sendEncryptedRequest(payload, keys, fingerprints);
    setloading(false);
    let data = result.data;

    if (result.status) {
      toast.success(data?.message || "success");
      getcandidate_Details();
    } else {
      toast.error(
        data?.response?.data?.error || data?.response?.data?.message || data?.message || data?.error || "error",
      );
    }
  };

  const extraPayloadKey = useMemo(() => JSON.stringify(extraPayload), [extraPayload]);

  useEffect(() => {
    // let deviceData = getDeviceData();
    // console.log(deviceData,'aaaaaaaa')

    if (user?.email) {
      getRecruiter_Details();
      getTeams();
    }
  }, [user?.email]);

  useEffect(() => {
    setDefaultCandidateDataByApi({});
    setFilteredCandidatesDefault([]);
    setFilteredCandidates([]);
  }, [pathname]);

  useEffect(() => {
    if (user?.email && keys.sessionToken) {
      getcandidate_Details();
    }
  }, [user?.email, pathname, extraPayloadKey, keys.sessionToken]);

  useEffect(() => {
    const handleScroll = () => {
      if (pickerRef.current) {
        pickerRef.current.close?.();
      }

      if (contactPickerRef.current) {
        contactPickerRef.current.close?.();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  useEffect(() => {
    if (recruiterData?.length) {
      let simpleData = recruiterData.map((recruiter) => {
        return { recruiter_alias_name: recruiter.recruiter_alias_name, ...recruiter.details[0] };
      });
      setSimpleRecruiterData(simpleData);
    }
  }, [recruiterData?.length]);

  useEffect(() => {
    applyFilters(filters, searchValue || searchName);
  }, [searchValue, filters]);

  const getTeams = () => {
    const options = {
      emailid: user?.email,
      type: "teams",
    };
    // setloading(true);
    api
      .TeamsManagement(options)
      .then((res) => {
        // setloading(false);
        setTeamsData(res.records);
      })
      .catch((err) => {
        // setloading(false);
        console.log(err, "error is err");
      });
  };

  const getRecruiter_Details = () => {
    let payload = { emailid: user.email, operation: "retrieve" };
    setloading(true);
    api
      .Recruiter_Details(payload)
      .then((res) => {
        setloading(false);
        setRecruiterData(res?.data || []);
      })
      .catch((err) => {
        setloading(false);
        console.log(err);
      });
  };

  // const filterApiData = (data) => {

  //   return data.filter((item) => !!item.currently_in_project == !isAvailebleTalent);

  // };

  const getcandidate_Details = async (id, operation = "retrieve", isHide = true) => {
    let payload = { emailid: user?.email, role: user?.user_role, ...extraPayload, retrieve_mode: "light" };

    if (id) {
      payload = { emailid: user?.email, operation, id: String(id) };
    }

    setloading(true);
    setloaderPage(true);

    const result = await sendEncryptedRequest(payload, keys, fingerprints);

    if (result.status) {
      let data = result.data;
      if (id) {
        setCandidateData(data[0]);
      } else {
        let val = data;
        if (val && typeof val === "object" && val._counts) {
          setTotalCandidates(val._counts);
          delete val._counts;
        }
        if (!Array.isArray(val)) {
          val = Object.values(val);
        }

        let newVal = val;

        applyFilters(filters, searchValue || searchName, newVal);

        setDefaultCandidateDataByApi(data);
        setFilteredCandidatesDefault(newVal);
      }
    }

    setloading(false);
    setloaderPage(false);
  };

  const applyFilters = (newFilters, search = searchName || "", defaultData) => {
    let data = defaultData || filteredCandidatesdefault;

    const filteredData = data.filter((c) => {
      const matchesFilters =
        (newFilters.visa_status === "All" || c.visa_status === newFilters.visa_status) &&
        (newFilters.current_status === "All" || c.current_status === newFilters.current_status) &&
        (newFilters.priority === "All" || c.priority === newFilters.priority) &&
        (newFilters.assigned_recruiter === "All" || c.assigned_recruiter === newFilters.assigned_recruiter) &&
        (newFilters.assigned_team === "All" || c.assigned_team === newFilters.assigned_team) &&
        (newFilters.opt_letter_status === "All" || c.opt_letter_status === newFilters.opt_letter_status) &&
        (newFilters.send_work_status_email === "All" ||
          (newFilters.send_work_status_email === "Yes" && c.send_work_status_email === true) ||
          (newFilters.send_work_status_email === "No" && c.send_work_status_email === false));

      const searchTerm = search?.toLowerCase().trim();
      const fullName = `${c.first_name || ""} ${c.last_name || ""}`.trim().toLowerCase();

      const matchesSearch =
        !searchTerm ||
        fullName.includes(searchTerm) ||
        c.primary_email?.toLowerCase().includes(searchTerm) ||
        c.secondary_email?.toLowerCase().includes(searchTerm) ||
        c.visa_status?.toLowerCase().includes(searchTerm) ||
        c.current_status?.toLowerCase().includes(searchTerm) ||
        c.priority?.toLowerCase().includes(searchTerm) ||
        c.assigned_recruiter?.toLowerCase().includes(searchTerm) ||
        c.assigned_team?.toLowerCase().includes(searchTerm);

      return matchesFilters && matchesSearch;
    });

    if (searchName) {
      setTimeout(() => {
        setSearchValue(searchName);
        setSearchParams({});
      }, 1000);
    }

    setFilteredCandidates(filteredData);

    setCurrentPage(1);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredCandidates.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredCandidates.length / rowsPerPage);

  const renderPagination = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (start > 1) pages.push(1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 1) pages.push("...");
      if (end < totalPages) pages.push(totalPages);
    }

    return (
      <div className="d-flex align-items-center gap-1">
        <span
          className={`lefticon pointer ${currentPage === 1 ? styles.disabled : styles.pages}`}
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        >
          ◀
        </span>
        {pages.map((page, index) => (
          <button
            key={index}
            className={`btn ${styles.pages} ${currentPage === page ? "btn-primary " + styles.activePage : "btn-light"}`}
            onClick={() => typeof page === "number" && setCurrentPage(page)}
            disabled={page === "..."}
          >
            {page}
          </button>
        ))}
        <span
          className={`righticon pointer ${currentPage === totalPages ? styles.disabled : styles.pages}`}
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
        >
          ▶
        </span>
      </div>
    );
  };

  let priorityValues = ["High", "Medium", "Low"];

  let statusFilter = [
    "Active",
    "In Active",
    "Pending Onboarding",
    "Marketing Hold",
    "On Hold",
    "Employer Change",
    "Onboarding Rejected",
    "Other",
  ];

  let visaData = ["OPT", "CPT", "H1B", "H4 EAD", "GC", "GC EAD", "USC", "STEM OPT", "L2/L2 EAD"];

  const filterKeys = {
    Recruiter: { icon: "person-available", cssIcon: true },
    Status: { key: "current_status", icon: status_filter, data: statusFilter },
    Priority: { key: "priority", icon: order_filter, data: priorityValues },
    Visa: { key: "visa_status", icon: visa_filter, data: visaData },
    Team: { key: "assigned_team", icon: teamGroup, data: simpleteamsData },
    "Work Status Email": {
      key: "send_work_status_email",
      style: { width: "260px" },
      icon: "mail",
      googleIcon: true,
      data: ["Yes", "No"],
    },
    "Offer Letter Status": {
      key: "opt_letter_status",
      icon: status_filter,
      style: { width: "265px" },
      data: ["ISSUED", "NOT ISSUED"],
    },
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id && centralSearch.role !== "") {
      setloading(true);
      setTimeout(() => {
        getcandidate_Details(id);
        setIsModalActive(true);
        setIsView(false);
        setCentralSearch([]);
        navigate(location.pathname, { replace: true });
        setCentralOpen(false);
      }, 0);
    }
  }, [location.search]);

  const returnIcon = (gender) => {
    let icons = {
      Male: male_icon,
      Female: female_icon,
    };

    return icons[gender] || otherGender;
  };

  const returnPriorityIcons = (priority) => {
    priority = String(priority).toLowerCase();
    const icons = {
      high: high,
      medium: medium,
    };

    return icons[priority] || low;
  };

  const addData = [
    { label: "Send Invitation", value: "Send Invitation", cssIcon: "send-solid" },
    { label: "Manual Entry", value: "Manual Entry", image: status_filter },
  ];

  const contactActionDropdown = (data) => {
    let contactOptions = [
      {
        label: "Show Phone Number",
        value: "phone",
        icon: <FiPhone size={16} />,
      },
      {
        label: "Send Email",
        value: "email",
        icon: <FiMail size={16} />,
      },
    ];

    if (isViewContact) {
      contactOptions = [
        {
          label: "Show Phone Number",
          value: "phone",
          icon: <FiPhone size={16} />,
        },
      ];
    }

    return (
      <SelectPicker
        ref={contactPickerRef}
        data={contactOptions}
        appearance="subtle"
        cleanable={false}
        searchable={false}
        onChange={(val) => {
          let id = findId(data);
          setContactActionType({ type: val, data, id: id });
        }}
        placement="autoVertical"
        menuStyle={{ zIndex: 99999999, width: "max-content" }}
        popupContainer={() => document.body}
        menuClassName="themeiconsSelect"
        renderMenuItem={(label, item) => (
          <div className="d-flex align-items-center gap-2">
            {item.icon}
            <span>{item.label}</span>
          </div>
        )}
        renderValue={() => null}
        placeholder=""
        icon={null}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          display: "inline-block",
        }}
        toggleAs={() => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "600",
              padding: "4px 12px",
              color: "#0B4DA1",
              background: "hsla(215, 87.30%, 27.80%, 0.04)",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <TbMessageDots size={16} />
            <span style={{ fontSize: "14px" }}>Contact</span>
          </div>
        )}
      />
    );
  };

  const renderActions = (c, idKey) => {
    const menuId = `dropdown-menu-${idKey}`;
    const btnId = `dropdown-btn-${idKey}`;
    let docClickHandler = null;
    let cleanupOnScrollResize = null;

    function closeMenu(menu) {
      const data = _menuHandlers.get(menu);
      if (!data) return;
      menu.classList.remove("show");
      data.btn.setAttribute("aria-expanded", "false");
      document.removeEventListener("click", data.docClickHandler);
      window.removeEventListener("scroll", data.cleanupOnScrollResize, true);
      window.removeEventListener("resize", data.cleanupOnScrollResize);
      _menuHandlers.delete(menu);
    }

    const _menuHandlers = new WeakMap();

    function openMenu(btn, menu) {
      if (_menuHandlers.has(menu)) return;

      menu.style.position = "absolute";
      menu.style.zIndex = "9999";
      btn.setAttribute("aria-expanded", "true");

      const prev = {
        visibility: menu.style.visibility,
        display: menu.style.display,
        transition: menu.style.transition,
      };

      menu.style.visibility = "hidden";
      menu.style.display = "block";
      menu.style.transition = "none";

      const rect = btn.getBoundingClientRect();
      const docLeft = window.scrollX || window.pageXOffset;
      const docTop = window.scrollY || window.pageYOffset;

      requestAnimationFrame(() => {
        const mRect = menu.getBoundingClientRect();

        let left = rect.left + docLeft - mRect.width - 8;
        if (left < docLeft + 8) left = docLeft + 8;

        let top = rect.top + docTop + 5;
        const viewportBottom = (window.innerHeight || document.documentElement.clientHeight) + (window.scrollY || 0);
        if (top + mRect.height > viewportBottom - 8) {
          top = Math.max(docTop + 8, viewportBottom - mRect.height - 8);
        }

        menu.style.left = `${Math.round(left)}px`;
        menu.style.top = `${Math.round(top)}px`;

        menu.style.transition = prev.transition || "";
        menu.style.visibility = prev.visibility || "";
        menu.style.display = prev.display || "";

        menu.classList.add("show");

        const docClickHandler = (ev) => {
          if (!menu.contains(ev.target) && !btn.contains(ev.target)) closeMenu(menu);
        };

        const cleanupOnScrollResize = () => closeMenu(menu);

        document.addEventListener("click", docClickHandler);
        window.addEventListener("scroll", cleanupOnScrollResize, true);
        window.addEventListener("resize", cleanupOnScrollResize);

        _menuHandlers.set(menu, { docClickHandler, cleanupOnScrollResize, btn });
      });
    }

    const toggleMenu = (e) => {
      if (typeof document === "undefined") return;
      const menu = document.getElementById(menuId);
      const btn = document.getElementById(btnId);
      if (!menu || !btn) return;
      if (menu.classList.contains("show")) {
        closeMenu(menu);
      } else {
        openMenu(btn, menu);
      }
    };

    const handleView = () => {
      const id = typeof findId === "function" ? findId(c) : undefined;
      if (typeof getcandidate_Details === "function") getcandidate_Details(id);
      if (typeof setIsModalActive === "function") setIsModalActive((v) => !v);
      if (typeof setIsView === "function") setIsView(true);
      closeMenu();
    };

    const handleEdit = () => {
      const id = typeof findId === "function" ? findId(c) : undefined;
      if (typeof getcandidate_Details === "function") getcandidate_Details(id);
      if (typeof setIsModalActive === "function") setIsModalActive((v) => !v);
      if (typeof setIsView === "function") setIsView(false);
      closeMenu();
    };

    const handleDelete = () => {
      const id = typeof findId === "function" ? findId(c) : undefined;
      if (typeof setdeleteModal === "function") setdeleteModal(true);
      const newdeleteText = `Are you sure you want to delete <b> ${c?.first_name || ""} ${
        c?.last_name || ""
      }’s </b> record ?<br/> This cannot be undone.`;
      if (typeof setDeleteText === "function") setDeleteText(newdeleteText);
      if (typeof setdeleteId === "function") setdeleteId(id);
      closeMenu();
    };

    const handleResend = () => {
      if (typeof setisInviteModalupdate === "function") setisInviteModalupdate(c);
      if (typeof setisInviteModalActive === "function") setisInviteModalActive(true);
      closeMenu();
    };

    const menu = (
      <ul id={menuId} className="dropdown-menu" style={{ position: "absolute" }}>
        <li>
          <button
            className={`${styles?.dropdown_item || ""} d-flex align-items-center gap-2 dropdown-item`}
            onClick={handleView}
          >
            <span className="font14 material-symbols-outlined">visibility</span>
            View
          </button>
        </li>

        {isActions ? (
          <>
            <li>
              <button
                className={`${styles?.dropdown_item || ""} d-flex align-items-center gap-2 dropdown-item`}
                onClick={handleEdit}
              >
                <span className="font14 material-symbols-outlined">edit_square</span>
                Edit
              </button>
            </li>

            <li>
              <button
                onClick={handleDelete}
                className={`${styles?.dropdown_item || ""} d-flex align-items-center gap-2 dropdown-item`}
              >
                <span className="font14 material-symbols-outlined">delete</span>
                Delete
              </button>
            </li>

            {isResend ? (
              <li>
                <button
                  onClick={handleResend}
                  className={`${styles?.dropdown_item || ""} d-flex align-items-center gap-2 dropdown-item`}
                >
                  {RotateCw ? (
                    <RotateCw style={{ height: "14px", width: "14px" }} />
                  ) : (
                    <span className="material-symbols-outlined">autorenew</span>
                  )}
                  Resend Invitation
                </button>
              </li>
            ) : null}
          </>
        ) : null}
      </ul>
    );

    return (
      <div className="dropdown" style={{ display: "inline-block" }}>
        <button id={btnId} className="btn btn-light" type="button" aria-expanded="false" onClick={toggleMenu}>
          ⋮
        </button>

        {typeof document !== "undefined" ? ReactDOM.createPortal(menu, document.body) : menu}
      </div>
    );
  };

  return (
    <>
      {centralOpen && (
        <>
          <div className="signatureContainer">
            <CandidateSpotlightSearch
              centralSearch={centralSearch}
              setCentralSearch={setCentralSearch}
              centralOpen={centralOpen}
              setCentralOpen={setCentralOpen}
              user={user}
            />
          </div>
        </>
      )}
      <div className="d-flex backgroundImage">
        <div className={`${styles.container} container-fluid py-4 pt-2 px-2 px-sm-2 px-md-2 rightcontent`}>
          <div className="headerBackground text-white p-2 rounded-top" style={{ height: "90px" }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h2 className="mb-0 mt-1 ml-1 ms-1 fw-bold fs-5 h2">
                  {heading?.replace("/", "-") || "Talent Pool - Active Talent"}
                </h2>
                {/* <p className="mb-0 ms-1 mt-1"> {heading || "Talent Pool / Active Talent"}</p> */}
              </div>
              <div className="d-flex align-items-center gap-2">
                {/* <SearchBox value={searchValue} onChange={setSearchValue} /> */}

                {/* <div className={styles.userbox}></div> */}
              </div>
            </div>
          </div>
          <div className="py-3 px-0 px-sm-3 shadow-sm rounded-bottom">
            <div className={`headerboxglass ${styles.headerboxglass}`}>
              <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3 signatureContainer">
                <div className="flex flex-col gap-4 items-start w-full">
                  <div className="!p-2 !py-0 !bg-card  w-[100%]">
                    <div className="!space-y-2">
                      {/* --- Main Search Bar (Top) --- */}
                      <div className="relative flex-1 max-w-2xl">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2">
                          <Search className="h-5 w-5 text-talent-search-icon bg-[#036eca] text-white p-1 rounded-md" />
                        </div>
                        <div
                          type="text"
                          // value={searchValue}
                          // onChange={(e) => setSearchValue(e.target.value)}
                          className="flex w-full rounded-xl border border-input bg-background !px-3 !py-2 !pl-7 h-9 text-sm focus:outline-none !border-transparent shadow-none focus:ring-2 focus:ring-blue-600"
                          placeholder="Search all candidates by name, email, position, or visa status..."
                          style={{ alignItems: "center", cursor: "pointer" }}
                          onClick={() => {
                            setCentralOpen(true);
                          }}
                        >
                          Search all candidates by name, email, position, or visa status...
                        </div>
                      </div>

                      {/* <div className="h-px bg-border/60" style={{ backgroundColor: "#d6d6d6" }}></div> */}

                      {/* --- Filters Section --- */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="!text-xs text-muted-foreground font-medium">Quick filters:</span>

                        {Object.keys(filterKeys)
                          .slice(0, 3)
                          .map((filterType, index) => {
                            const filter = filterKeys[filterType];
                            const filterKey = filter?.key;

                            // =========================================================
                            //  CASE 1: RECRUITER FILTER (Rich Component with Search)
                            // =========================================================
                            if (filterType === "Recruiter") {
                              const isActive = filters.assigned_recruiter && filters.assigned_recruiter !== "All";

                              // Prepare Recruiter Data specifically for SelectPicker
                              const dataToMap = [
                                { details: [{ recruiter_name: "Filter by Recruiter" }], recruiter_alias_name: "All" },
                                ...recruiterData,
                              ].map((item) => {
                                return {
                                  label: item?.details[0]?.recruiter_name || "",
                                  value: item.recruiter_alias_name,
                                };
                              });

                              return (
                                <div key={index} className="relative">
                                  {/* Assuming SelectPicker is imported from rsuite or your UI library */}
                                  <SelectPicker
                                    caretAs={() => <FaChevronDown />}
                                    searchable={true} // <--- Enables the search box inside dropdown
                                    open={isRecruiterOpen} // <--- ADD THIS
                                    onOpen={() => setIsRecruiterOpen(true)} // <--- ADD THIS
                                    onClose={() => setIsRecruiterOpen(false)}
                                    // Render the button face
                                    renderValue={(value, item) => {
                                      return (
                                        <div className="d-flex align-items-center gap-2">
                                          {/* Use the specific Recruiter Icon */}
                                          <Users className="h-3 w-3 text-[#080118]" />
                                          <span className="truncate max-w-[120px] text-[#080118] text-xs font-medium">
                                            {item?.label || "Filter by Recruiter"}
                                          </span>
                                        </div>
                                      );
                                    }}
                                    // Render the items in the dropdown list
                                    renderMenuItem={(label, item) => {
                                      return (
                                        <div className="d-flex align-items-center gap-2">
                                          <Users size={12} className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-sm font-medium">{label}</span>
                                        </div>
                                      );
                                    }}
                                    // Apply Tailwind-like styling via class props to match your other buttons
                                    // Note: You might need to adjust 'selectpickerNormaltransparent' CSS to match the height of your other buttons
                                    className={`selectpickerNormaltransparent bg-transparent ${styles.recruiterPicker} ${
                                      isActive ? "text-blue-600 " : ""
                                    }`}
                                    menuClassName={`selectpickerNormalitemsTransparent ${styles.recruiterPickerMenu}`}
                                    placement="autoVertical"
                                    cleanable={false}
                                    onChange={(value) => setFilters({ ...filters, assigned_recruiter: value })}
                                    value={filters.assigned_recruiter || "All"}
                                    data={dataToMap}
                                    placeholder="Filter by Recruiter"
                                    style={{ width: 180 }} // Adjust width as needed
                                  />
                                </div>
                              );
                            }

                            // =========================================================
                            //  CASE 2: STANDARD FILTERS (Status, Priority, etc.)
                            // =========================================================

                            const currentFilterValue = filters[filterKey] || "All";
                            const isActive = currentFilterValue !== "All";

                            // Prepare Standard Data
                            const rawData = filter.data
                              ? filter.data
                              : [...new Set(filteredCandidatesdefault.map((c) => c[filterKey]))];

                            const filterData = [
                              { label: `Filter by ${filterType}`, value: "All" },
                              ...rawData.map((item) => {
                                const val = item?.val || item;
                                const label = item?.key || item;
                                return { label: label, value: val };
                              }),
                            ].filter((item) => item.value !== undefined && item.value !== null && item.value !== "");

                            const normalizedValue = String(currentFilterValue ?? "All");
                            const selectedOption = filterData.find((d) => String(d.value) === normalizedValue);
                            const displayLabel = selectedOption ? selectedOption.label : `Filter by ${filterType}`;

                            return (
                              <div key={index} className="relative">
                                <Select
                                  value={normalizedValue}
                                  className="!border-none"
                                  onOpenChange={(isOpen) => {
                                    if (isOpen) setIsRecruiterOpen(false);
                                  }}
                                  onValueChange={(value) => {
                                    const selected = filterData.find((opt) => String(opt.value) === value);
                                    setFilters({ ...filters, [filterKey]: selected ? selected.value : value });
                                  }}
                                >
                                  <SelectTrigger
                                    className={`h-6 min-w-[170px] max-w-[210px] px-3 text-sm font-medium !border-none ${
                                      isActive
                                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                                        : "bg-transparent text-[#080118] hover:text-foreground hover:bg-secondary"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      {filterType === "Status" && <Filter className="h-3 w-3 shrink-0" />}
                                      {filterType === "Priority" && <Flag className="h-3 w-3 shrink-0" />}
                                      <span className="max-w-[120px] text-xs truncate">{displayLabel}</span>
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filterData.map((opt, i) => (
                                      <SelectItem
                                        key={`${filterType}-${i}-${String(opt.value)}`}
                                        value={String(opt.value)}
                                      >
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })}

                        {/* --- Clear Filters Button --- */}
                        <div className="flex items-center ml-0 pl-0 gap-3">
                          <button
                            onClick={() => {
                              setFilters(initialFilters);
                              setSearchValue("");
                            }}
                            className="flex items-center gap-1 text-sm bg-transparent text-muted-foreground hover:text-red-500 transition-colors py-2 px-1"
                          >
                            <X className="h-4 w-4" />
                            <span className=" md:inline">Clear Filters</span>
                          </button>

                          <button
                            onClick={() => setOpenFilterModal(true)}
                            className="p-1 hover:bg-secondary bg-transparent rounded-full transition-colors"
                          >
                            <MoreVertical className="h-5 w-5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="d-flex align-items-center gap-1">
                {Object.keys(filterKeys)
                  .slice(0, 3)
                  .map((filterType, index) => {
                    let isActive = filters[filterKeys[filterType]?.key] !== "All";
                    let filter = filterKeys[filterType];

                    let filterData = filter.data
                      ? filter.data
                      : [...new Set(filteredCandidatesdefault.map((c) => c[filterKeys[filterType]?.key]))];

                    if (filterType === "Recruiter") {
                      isActive = filters.assigned_recruiter && filters.assigned_recruiter !== "All";

                      let dataToMap = [
                        { details: [{ recruiter_name: "Filter by Recruiter" }], recruiter_alias_name: "All" },
                        ...recruiterData,
                      ].map((item) => {
                        return { label: item?.details[0]?.recruiter_name || "", value: item.recruiter_alias_name };
                      });

                      return (
                        <>
                          <SelectPicker
                            caretAs={() => <FaChevronDown />}
                            renderValue={(value, item) => {
                              return (
                                <div className="mx-auto d-flex align-items-center gap-1" style={{ maxWidth: "95%" }}>
                                  <span className={`${filter.icon} `} style={{ height: "16px" }} />
                                  <span title={item?.label} className="text-truncate w-100">
                                    {item?.label || "Filter by Recruiter"}
                                  </span>
                                </div>
                              );
                            }}
                            classPrefix="transparentFilter_"
                            className={`selectpickerNormaltransparent ${
                              isActive ? "bg-white px-0 " + styles.activeSelect : ""
                            }`}
                            menuClassName="selectpickerNormalitemsTransparent"
                            placement="autoVertical"
                            cleanable={false}
                            onChange={(value) => setFilters({ ...filters, assigned_recruiter: value })}
                            value={filters.assigned_recruiter || "All"}
                            data={dataToMap}
                            placeholder="Select Recruiter"
                          />

                        </>
                      );
                    }

                    return (
                      <>
                        <div
                          key={index}
                          className={`filter-select d-flex align-items-center ${styles.selectFilter}  ${
                            isActive ? styles.activeSelect : styles.inactiveSelect
                          }`}
                        >
                          <img
                            className={styles.selectImage}
                            src={filterKeys[filterType].icon}
                            alt=""
                            width="20"
                            height="20"
                          />
                          <select
                            className={`form-select`}
                            onChange={(e) => setFilters({ ...filters, [filterKeys[filterType]?.key]: e.target.value })}
                            value={filters[filterKeys[filterType]?.key] || "All"}
                          >
                            {[{ key: "Filter by " + filterType, val: "All" }, ...filterData].map(
                              (option, index) =>
                                option && (
                                  <option
                                    key={index}
                                    value={option?.val || option}
                                    className={`${styles.dropdownlist} ${
                                      filters[filterKeys[filterType]?.key] === option ? styles.list_active : ""
                                    }`}
                                  >
                                    {option?.key || option}
                                  </option>
                                ),
                            )}
                          </select>
                        </div>
                      </>
                    );
                  })}

                <div
                  className="d-flex align-items-center gap-1 pointer fw-light"
                  onClick={() => {
                    setFilters(initialFilters);
                    setSearchValue("");
                  }}
                >
                  <span class="material-symbols-outlined">close</span>
                  <span className="mobHFilters">Clear Filters</span>
                </div>
                <div
                  className="pointer p-2 fs-3 ms-3"
                  onClick={() => {
                    setOpenFilterModal(true);
                  }}
                >
                  ⋮
                </div>
              </div> */}
                <div className={styles.addSection}>
                  {isActions ? (
                    <>
                      <SelectPicker
                        ref={pickerRef}
                        data={addData}
                        appearance="subtle"
                        placement="autoVertical"
                        cleanable={false}
                        searchable={false}
                        className="customrsuiteselectnoborder"
                        // value={value}
                        onChange={(val) => {
                          if (val == "Manual Entry") {
                            setIsView(false);
                            setIsModalActive(!isModalActive);
                          } else if (val == "Send Invitation") {
                            setIsView(false);
                            setisInviteModalActive(true);
                          }
                        }}
                        menuStyle={{ zIndex: 99999999, width: "max-content" }}
                        popupContainer={() => document.body}
                        menuClassName="themeiconsSelect"
                        renderMenuItem={(label, item) => (
                          <div className="d-flex align-items-center gap-2">
                            {item?.cssIcon && (
                              <span class={item?.cssIcon} style={{ height: "16px", width: "16px" }}></span>
                            )}
                            {item?.image && <img src={item.image} style={{ height: "16px", width: "16px" }} />}
                            <span>{item?.label}</span>
                          </div>
                        )}
                        renderValue={(value, item) => (
                          <div className="d-flex align-items-center gap-2 text-dark">
                            {/* {item?.icon && (
                            <span class="material-symbols-outlined" style={{ fontSize: "16px" }}>
                              {item.icon}
                            </span>
                          )}
                          <span>{item?.label}</span> */}
                            <span className="pe-1 text-sm"> + Add Talent</span>
                          </div>
                        )}
                        placeholder={"+ Add Talent"}
                      />
                      {/* <span
                      className="pointer addBtn"
                      onClick={() => {
                        setIsView(false);
                        setIsModalActive(!isModalActive);
                      }}
                    >
                      + Add Talent
                    </span> */}
                      <span className={` ${styles.sep}`} />
                    </>
                  ) : (
                    <></>
                  )}

                  <span className={`${styles.themefontDark} d-flex align-items-center gap-2 w-[120px]`}>
                    <img src={teamGroup} />
                    <span className="mobHFilters">Candidates: </span>
                    {filteredCandidates?.length || 0}
                  </span>
                </div>
              </div>
            </div>
            {isEmptyData ? (
              <div className="bg-white pt-4 pb-5 rounded-2">
                <EmptyView
                  title="No talent added yet"
                  description="Start building your talent pool by adding candidates. Use the <b>+ Add Talent</b> button to get started."
                  hide={loading || loaderPage}
                ></EmptyView>{" "}
              </div>
            ) : (
              <>
                <div className={`table-responsive nowrap ${styles.table}`}>
                  <table className="table table-borderless table-hover align-middle">
                    <thead>
                      <tr className={`${styles.lightColor} ${styles.tableHead}`}>
                        <th style={{ maxWidth: "300px" }}>
                          <div className={`${styles.th} ps-2`}>
                            <img src={user_icon} />
                            Candidate Name
                          </div>
                        </th>
                        {candidateAnalysis ? (
                          <th>
                            <div className={`${styles.th} d-flex justify-content-center align-items-center`}>
                              <span class="material-symbols-outlined">monitoring</span>
                              Profile Analyzer
                            </div>
                          </th>
                        ) : (
                          ""
                        )}
                        <th>
                          <div className={styles.th}>
                            <img src={visa_status} />
                            Visa Status
                          </div>
                        </th>
                        <th>
                          <div className={styles.th}>
                            <img src={status_filter} />
                            Offer letter Status
                          </div>
                        </th>

                        <th>
                          <div className={styles.th}>
                            <img src={priorityorder} />
                            Priority
                          </div>
                        </th>
                        <th>
                          <div className={styles.th}>
                            <img src={list} />
                            Status
                          </div>
                        </th>
                        {contactInfo && !isHideContact ? (
                          <th>
                            <div className={styles.th}>
                              <img src={userChat} />
                              Contact
                            </div>
                          </th>
                        ) : (
                          <></>
                        )}
                        <th>
                          <div className={`${styles.th}`}>
                            <span className="material-symbols-outlined">action_key</span>
                            <div>Action</div>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                      {currentRows.map((c, index) => {
                        return (
                          <tr key={index} className={c.status === "Active" ? styles.activeRow : styles.inactiveRow}>
                            <td
                              onClick={() => {
                                let id = findId(c);
                                console.log(c);
                                getcandidate_Details(id);
                                setIsModalActive(!isModalActive);
                                setIsView(true);
                              }}
                              style={{ maxWidth: "300px" }}
                            >
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  className={styles.userIcon}
                                  src={returnIcon(c.gender)}
                                  alt={c.first_name + " " + c.last_name}
                                  size={14}
                                />
                                <div style={{ lineHeight: "16px" }}>
                                  <strong className="fs-14">
                                    {(c.first_name || "") + "  " + (c.last_name || " ")}
                                  </strong>
                                  <br />
                                  <small>{c.primary_email || c.secondary_email || ""}</small>
                                </div>
                              </div>
                            </td>
                            {candidateAnalysis ? (
                              <td>
                                <div
                                  onClick={() => {
                                    setshowAnalyzeModal(c);
                                  }}
                                  className={`${styles.analyzebutton}`}
                                >
                                  Analyze
                                </div>
                              </td>
                            ) : (
                              ""
                            )}
                            <td className={styles.themefont}>
                              <div
                                className={`${styles[String(c.visa_status).replaceAll(" ", "_")]} ${styles.statusbadge}`}
                              >
                                <span className="user-circle-solid"></span>
                                <div>{c.visa_status || "N/A"}</div>
                              </div>
                            </td>

                            <td style={{ maxWidth: "200px" }}>{renderStatusLabel(c.opt_letter_status)}</td>

                            <td className={`${styles.themefont}`}>
                              <div className="d-flex gap-1 align-items-center">
                                {c.priority || "N/A"}
                                <img src={returnPriorityIcons(c.priority)} style={{ width: "20px" }} />
                              </div>
                            </td>
                            <td>
                              <span
                                className={`${styles.badge} ${
                                  c.current_status === "Active" ? styles["bg-success"] : styles["bg-danger"]
                                }`}
                              >
                                <span
                                  className={`${styles.dotcircle} ${
                                    c.current_status === "Active" ? "" : styles.dotcircleinactive
                                  }`}
                                ></span>
                                {c.current_status || " "}
                              </span>
                            </td>
                            {contactInfo && !isHideContact ? <td>{contactActionDropdown(c)}</td> : <></>}
                            <td>{renderActions(c, index)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex flex-wrap justify-content-between align-items-center">
                  <div className="my-3">
                    <label> Show </label>
                    <select
                      className="form-select d-inline w-auto ms-2"
                      onChange={(e) => setRowsPerPage(Number(e.target.value))}
                      value={rowsPerPage}
                    >
                      {[5, 10, 15, 20, 30, 50, 100].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <label> &nbsp; Row </label>
                  </div>
                  <div className="d-flex justify-content-center my-3">{renderPagination()}</div>
                  <div />
                  <div />
                </div>
              </>
            )}
          </div>
        </div>
        <CandidateModal
          teamsData={simpleteamsData}
          disabled={isView}
          isModalActive={isModalActive}
          setIsModalActive={handleModal}
          update={!!candidateData}
          isLoading={loading}
          updateTable={getcandidate_Details}
          recruitersBList={simpleRecruiterData}
          addCandidate={addCandidate}
          candidateData={candidateData} // Pass data when updating
        />
        <TalentPoolInvite
          isUpdate={isInviteModalupdate}
          setShow={() => {
            setisInviteModalActive(false);
            setisInviteModalupdate(false);
          }}
          show={isInviteModalActive}
          update={getcandidate_Details}
        />
        <AnalyzeModal isModalActive={showAnalyzeModal} setIsModalActive={setshowAnalyzeModal} />
        <ContactMail
          updateTable={getcandidate_Details}
          isModalActive={contactActionType?.type == "email"}
          data={contactActionType?.data}
          allData={contactActionType}
          setIsModalActive={setContactActionType}
        />

        <Confirm
          title="Delete Candidate"
          text={deleteText}
          show={deleteModal}
          result={(result) => {
            if (result) {
              deleteBenchCandidates();
            }
            setdeleteModal(false);
          }}
        />
        <Confirm
          title="Resend Onboarding Invite"
          icon="refresh"
          text={deleteText}
          show={resendModal}
          deleteTitle="Resend Invite"
          result={(result) => {
            if (result) {
              setisInviteModalupdate(resendModal);
              setisInviteModalActive(true);
            }
            setresendModal(false);
          }}
        />
        <Confirm
          deleteTitle="Copy Number"
          icon="content_copy"
          hideCancel
          title="Phone Number"
          text={`<b>${contactActionType?.data?.first_name} ${contactActionType?.data?.last_name}'s</b> phone number:<b> ${
            contactActionType?.data?.primary_contact || contactActionType?.data?.secondary_contact
          }</b>. 
        <br/>
        You can copy the number and dial it.`}
          show={contactActionType?.type == "phone"}
          result={(result) => {
            if (result) {
              const contact = contactActionType?.data?.primary_contact || contactActionType?.data?.secondary_contact;

              if (contact) {
                navigator.clipboard
                  .writeText(contact)
                  .then(() => {
                    toast.info("Contact copied to clipboard");
                  })
                  .catch((e) => toast.error("Failed to copy contact"));
              }
            }
            setContactActionType(false);
          }}
        />
        <FilterModal
          initialFilters={initialFilters}
          filters={filters}
          setFilters={setFilters}
          recruiterData={recruiterData}
          filterKeys={filterKeys}
          filteredCandidatesdefault={filteredCandidatesdefault}
          show={openFilterModal}
          result={() => {
            setOpenFilterModal(false);
          }}
        />
        <ThemeLoader show={loading || loaderPage} />
      </div>
    </>
  );
};

export default ActiveTalent;
