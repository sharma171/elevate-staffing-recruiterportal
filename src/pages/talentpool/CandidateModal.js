import { useEffect, useState } from "react";
import styles from "./css/NewCandidateModal.module.css";
import OverlayModal from "../../components/OverlayModal";
import AllForms from "./AllForms";
// import ImmigrationForm from "./immigrationFiles/ImmigrationForm";
import CandidateTasks from "./CandidateTasks";
import otherGender from "../../images/otherGender.svg";
import images from "../../assets/images/new";
import CandidateFiles from "./CandidateFIles";
import { useAuth } from "../../authContext";
import api from "../../networking/api";
import { toast } from "react-toastify";
import { Confirm, ThemeLoader } from "../../components";
import WeeklyTimesheet from "./WeeklyTimesheet";
import MonthlyTimesheetDefaultView from "./MonthlyTimesheetDefaultView";
import CandidateProjectsTab from "./CandidateProjectsTab";
import RenderOnboardingSection from "./onboarding/RenderOnboardingSection";
import VendorManagement from "./VendorManagement";
import sendEncryptedRequest from "../../components/EncryptedRequest";
import { getDeviceData } from "../../DeviceStore";
import {
  X,
  Settings,
  FileText,
  FolderKanban,
  ClipboardCheck,
  Calendar,
  DollarSign,
  Clock,
  User,
  Globe,
  Send,
} from "lucide-react";
import ContactMail from "./ContactMail";
import { ImmigrationTab } from "./immigration/ImmigrationTab";

const { female_icon, male_icon } = images;

function getTalentKey(status) {
  if (!status) {
    return;
  }

  const statusKeyMap = {
    "active talent": "active",
    "available talent": "available",
    "inactive talent": "inactive",
    "pending talent": "pending",
  };

  return statusKeyMap[status.toLowerCase()] || null;
}

function getPermissions(access = "documents") {
  const stored = sessionStorage.getItem("permissions");

  if (!stored) return null;

  const { data } = JSON.parse(stored);

  return String(data?.modules?.talentPool?.sections[access]).toLocaleLowerCase();
}

function taskPermitions() {
  const stored = sessionStorage.getItem("permissions");
  if (!stored) return null;

  const { data, timestamp } = JSON.parse(stored);

  return String(data.modules?.taskboard?.accessLevel).toLocaleLowerCase();
}

function getAddonValue(addonVal) {
  let orgDatalocal = localStorage.getItem("Organisation");

  if (!orgDatalocal) {
    return null;
  }

  const orgData = (() => {
    try {
      let data = JSON.parse(orgDatalocal) || {};
      return data?.org_data?.[0] || {};
    } catch {
      return {};
    }
  })();

  let rawAddOns = orgData?.add_ons;

  let addOns = [];
  if (Array.isArray(rawAddOns)) {
    addOns = rawAddOns;
  } else if (typeof rawAddOns === "string") {
    try {
      addOns = JSON.parse(rawAddOns);
    } catch {
      addOns = rawAddOns.replace(/[\[\]\s]/g, "").split(",");
    }
  }

  return addOns.includes(addonVal);
}

const CandidateModal = ({
  isModalActive,
  setIsModalActive,
  update,
  isLoading,
  recruitersBList,
  addCandidate,
  candidateData: candidateValues,
  updateTable,
  disabled: isViewMode,
  teamsData,
}) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(1);
  const [deleteModal, setdeleteModal] = useState(false);
  const [candidateData, setCandidateData] = useState(candidateValues || {});
  const [modalTitle, setModalTitle] = useState("Delete Candidate");
  const [loader, setLoader] = useState(false);
  const [decodedPassword, setDecodedPassword] = useState("");
  const [deleteText, setDeleteText] = useState("");
  const [loading, setloading] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [primaryMailChangedpupup, setPrimaryMailChangedpupup] = useState(false);
  const [isEmailError, setisEmailError] = useState(false);
  const [isContactSection, setIsContactSection] = useState(false);
  const [disabled, setDisabled] = useState(isViewMode);
  const [isTalentEdit, setIsTalentEdit] = useState(isViewMode);

  let { keys, fingerprints } = getDeviceData();

  const candidateTalentPath = getTalentKey(candidateData?.talent_status);

  useEffect(() => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab);
    const isSkipPermition = activeTabData?.permission == "skip";
    const isEditPermition = activeTabData?.permission == "edit";

    const talentPermitions = getPermissions(candidateTalentPath);
    const isEditTalentPermitions = String(talentPermitions).toLowerCase() == "edit";
    setIsTalentEdit(isEditTalentPermitions);

    if (isSkipPermition) {
      const talentPermitions = getPermissions(candidateTalentPath);
      const isEditTalentPermitions = String(talentPermitions).toLowerCase() == "edit";
      setDisabled(!isEditTalentPermitions);
    } else {
      setDisabled(!isEditPermition);
    }
  }, [candidateTalentPath, activeTab]);

  // Get tab configuration
  const getTabConfig = (getPermissions = () => {}, getAddonValue = () => {}) => {
    const tabs = [
      {
        id: 1,
        label: "Candidate Info",
        icon: Settings,
        showCustom: "allForms",
        hide: false,
        hidecreate: false,
        permission: "skip",
        hideLabel: true,
      },
      {
        id: 2,
        icon: FileText,
        label: "Files & Documents",
        showCustom: "fileinput",
        hide: getPermissions() == "hide",
        permission: getPermissions(),
        hidecreate: false,
      },
      {
        id: 3,
        hide: getPermissions("projects") == "hide" || !getAddonValue("PJ"),
        permission: getPermissions("projects"),
        icon: FolderKanban,
        hideFunction: "isProjectsActive",
        label: "Projects",
        showCustom: "projectsSection",
        hidecreate: true,
      },
      {
        id: 4,
        hide: taskPermitions("task_board") == "hide",
        permission: taskPermitions("task_board"),
        hidecreate: true,
        icon: ClipboardCheck,
        label: "View Tasks",
        showCustom: "myTaskSection",
      },
      {
        id: 5,
        hide: getPermissions("weekly_status") == "hide",
        permission: getPermissions("weekly_status"),
        icon: Calendar,
        label: "Weekly Status",
        showCustom: "weeklyTimesheetSection",
        hidecreate: true,
      },
      {
        id: 6,
        hide: getPermissions("invoice") == "hide" || !getAddonValue("INV"),
        permission: getPermissions("invoice"),
        icon: DollarSign,
        label: "Invoicing/Time Sheets",
        showCustom: "monthlyTimesheetSection",
        hidecreate: true,
      },
      {
        id: 7,
        hide: getPermissions("time_sheets") == "hide" || getAddonValue("INV"),
        permission: getPermissions("time_sheets"),
        icon: Clock,
        label: "Monthly Timesheets",
        showCustom: "monthlyTimesheetDefaultSection",
        hidecreate: true,
      },
      {
        id: 8,
        hide: getPermissions("onboarding") == "hide",
        permission: getPermissions("onboarding"),
        icon: User,
        label: "Onboarding",
        showCustom: "renderOnboardingSection",
        hidecreate: true,
      },
      {
        id: 9,
        hide: !getAddonValue("IMM"),
        permission: getPermissions("onboarding"),
        icon: Globe,
        label: "Immigration",
        showCustom: "immigrationForm",
        hidecreate: false,
        hideLabel: true,
      },
    ].filter((tab) => {
      if (tab.hide) return false;
      if (tab.hidecreate && !update) return false;
      return true;
    });

    return tabs;
  };

  const tabs = getTabConfig(getPermissions, getAddonValue);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  let isTimesheetTab = activeTabData?.id === 5 || activeTabData?.id === 6 || activeTabData?.id === 7;
  let isFilesTab = activeTabData?.label === "Files & Documents";
  let isTasksTab = activeTabData?.label === "View Tasks";

  let modalWidthStyle = {
    minWidth: "80%",
  };
  let modalColorStyle = { background: "#fff", padding: "10px 25px 25px 20px" };

  // if (isFilesTab || isTasksTab) {
  //   modalWidthStyle = {
  //     minWidth: "90%",
  //   };
  // } else if (isTimesheetTab) {
  //   modalWidthStyle = {
  //     minWidth: "90%",
  //   };
  // }

  useEffect(() => {
    let booleanKeys = ["currently_in_project", "volunteer_work", "send_work_status_email", "open_to_work"];

    let newObject = { ...candidateValues };

    booleanKeys.forEach((key) => {
      if (key in newObject) {
        newObject[key] = newObject[key] ? "Yes" : "No";
      }
    });

    if (String(newObject.location_preference).trim().toLowerCase().startsWith("other state")) {
      let loc = newObject.location_preference.replace(/^other state\s*[:\-]*\s*/i, "");

      newObject.location_preference_text = loc;
      newObject.location_preference = "Other";
    }
    setCandidateData(newObject);
  }, [candidateValues]);

  useEffect(() => {
    setIsCreated(false);
    setdeleteModal(false);
    setActiveTab(1);
    setPrimaryMailChangedpupup(false);
  }, [isModalActive]);

  useEffect(() => {
    if (isEmailError) {
      setTimeout(() => {
        setisEmailError(false);
      }, 200);
    }
  }, [isEmailError]);

  const handleResponse = (response, err) => {
    if (err) {
      if (err == "primary_email") {
        setActiveTab(1);
        setisEmailError(true);
      }
      return;
    }

    if (update) {
      updateTable(candidateData.id);
      // setIsModalActive(false);
    }

    if (!update) {
      setIsCreated(true);
      setActiveTab(2);
    }
    if (!update) {
      updateTable && updateTable(undefined, undefined, update);
    }
  };

  const handleFormSubmit = (data, showEmailChangePopup) => {
    if (showEmailChangePopup) {
      setPrimaryMailChangedpupup(data);
    } else {
      if (data?.location_preference_text && String(data.location_preference).toLowerCase() == "other") {
        data.location_preference = "Other State : " + data.location_preference_text;
      }

      if (data.location_preference_text || data.hasOwnProperty("location_preference_text")) {
        delete data.location_preference_text;
      }

      if (!update) {
        setCandidateData(data || {});
      }

      addCandidate(data, handleResponse, undefined, false);
    }
  };

  const handleEmailChangeConfirm = (result, formData) => {
    if (result) {
      if (formData?.location_preference_text && String(formData.location_preference).toLowerCase() == "other") {
        formData.location_preference = "Other State : " + formData.location_preference_text;
      }

      if (formData.location_preference_text || formData.hasOwnProperty("location_preference_text")) {
        delete formData.location_preference_text;
      }

      addCandidate(formData, handleResponse, undefined, false);
    }
    setPrimaryMailChangedpupup(false);
  };

  const returnIcon = (gender) => {
    let icons = {
      Male: male_icon,
      Female: female_icon,
    };

    return icons[gender] || otherGender;
  };

  const deleteBenchCandidates = async () => {
    let id = candidateData.id;
    let payload = { emailid: user.email, operation: "delete", id };
    setloading(true);

    let result = await sendEncryptedRequest(payload, keys, fingerprints);
    setloading(false);
    let { data, status } = result;

    if (status) {
      toast.success(data?.message || "success", {
        draggable: "true",
      });
      updateTable && updateTable();
    } else {
      toast.error(data?.error || "error", {
        draggable: "true",
      });
    }
  };

  const decodeBase64 = (encoded) => {
    try {
      const result = atob(encoded);
      setDecodedPassword(result);
    } catch (e) {
      console.log("Invalid Base64 string");
    }
  };

  const candidateActions = (action, employee_email) => {
    if (!action) {
      return;
    }
    let payload = {
      action: action,
      admin_email: user.email,
      employee_email: employee_email,
    };

    setLoader(action);

    api
      .employeeActions(payload)
      .then((res) => {
        toast.success(res.message);

        if (res.encoded_password) {
          decodeBase64(res.encoded_password);
        } else {
          setIsModalActive(false);
        }
        console.log("actions res is", res);
        setLoader(false);
      })
      .catch((err) => {
        setLoader(false);
        toast.error(err?.error || err?.message || "");
        console.log(err, "error is err");
      });
  };

  const renderEditHeader = () => {
    if (!update && !isCreated) {
      return <></>;
    }

    const renderSpinnerCOntent = (content, key) => {
      if (loader == key) {
        return (
          <div className={`pointer d-flex aligin-items-center gap-1 nowrap ${styles.edituserButtons}`}>
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        );
      } else {
        return content;
      }
    };

    const displayGender = candidateData?.gender;
    const displayFirstName = candidateData?.first_name || "";
    const displayLastName = candidateData?.last_name || "";
    const displayPrimaryEmail = candidateData?.primary_email || "";
    const displaySecondaryEmail = candidateData?.secondary_email || "";

    return (
      <div className={`d-flex align-items-center gap-5 justify-content-between ${styles.userbgcontainer}`}>
        <div className="d-flex align-items-center gap-2">
          <div className="flex-shrink-0">
            <img className={styles.userImage} src={returnIcon(displayGender)} alt="user icon" />
          </div>
          <div>
            <strong className="nowrap">
              {displayFirstName} {displayLastName}
            </strong>
            <br />
            <small className="lightfont">{displayPrimaryEmail || displaySecondaryEmail || ""}</small>
          </div>
        </div>
        {!isTalentEdit || isCreated ? (
          <></>
        ) : (
          <div className="d-flex align-items-center gap-2 nowrap align-items-center pe-3">
            {String(candidateData?.online_account).toLocaleLowerCase() != "yes" ? (
              renderSpinnerCOntent(
                <div
                  onClick={() => {
                    setdeleteModal("send-invite");
                    setModalTitle("Send Invite");
                    setDeleteText(
                      `Are you sure you want to send an invite to <b>${candidateData.first_name} ${
                        candidateData.last_name || " "
                      }?</b><br/>This cannot be undone.`,
                    );
                  }}
                  className={`pointer d-flex aligin-items-center gap-1 nowrap ${styles.edituserButtons}`}
                >
                  <span className="send-outline-gray" /> Send Invite
                </div>,
                "send-invite",
              )
            ) : (
              <></>
            )}
            {renderSpinnerCOntent(
              <div
                onClick={() => {
                  setdeleteModal("password-reset");
                  setModalTitle("Reset Password");
                  setDeleteText(
                    `Are you sure you want to reset the password for <b>${candidateData.first_name} ${
                      candidateData.last_name || " "
                    }?</b><br/>`,
                  );
                }}
                className={`pointer d-flex aligin-items-center gap-1 nowrap ${styles.edituserButtons}`}
              >
                <span className="passwordicon" /> Reset Password
              </div>,
              "password-reset",
            )}

            {String(candidateData?.account_status).toLocaleLowerCase() == "active"
              ? renderSpinnerCOntent(
                  <div
                    onClick={() => {
                      setdeleteModal("deactivate");
                      setModalTitle("Block Sign-In");
                      setDeleteText(
                        `Are you sure you want to Block Sign-In for <b>${candidateData.first_name} ${
                          candidateData.last_name || " "
                        }?`,
                      );
                    }}
                    className={`pointer d-flex aligin-items-center gap-1 nowrap ${styles.edituserButtons} `}
                  >
                    <span className="material-symbols-outlined">block</span> Block Sign-in
                  </div>,
                  "deactivate",
                )
              : renderSpinnerCOntent(
                  <div
                    onClick={() => {
                      setdeleteModal("activate");
                      setModalTitle("Activate Recruiter");
                      setDeleteText(
                        `Are you sure you want to activate <b>${candidateData.first_name} ${
                          candidateData.last_name || " "
                        }?`,
                      );
                    }}
                    className={`pointer d-flex aligin-items-center gap-1 nowrap ${styles.edituserButtons} `}
                  >
                    <span className="material-symbols-outlined">check_circle</span> Active
                  </div>,
                  "activate",
                )}
            <div
              onClick={() => {
                setdeleteModal(true);
                setModalTitle("Delete Candidate");
                setDeleteText(
                  `Are you sure you want to delete <b> ${candidateData?.first_name || ""}  ${
                    candidateData?.last_name || " "
                  }'s </b> record ? <br/> This cannot be undone.`,
                );
              }}
              className={`pointer d-flex aligin-items-center gap-1 nowrap ${styles.edituserButtons} `}
            >
              <span className="deleteusericon" /> Delete User
            </div>

            <div className="successoutlineButton border pointer" onClick={() => setIsContactSection(true)}>
              <Send size={14} strokeWidth={3} />
              <span> Contact </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderfilesInput = () => {
    return (
      <div>
        <CandidateFiles
          disabled={disabled}
          candidateCreateData={update ? null : candidateData}
          candidateDetails={candidateData}
        />
      </div>
    );
  };

  const renderMyTask = () => {
    return (
      <div>
        <CandidateTasks candidateDetails={candidateData} disabled={disabled} />
      </div>
    );
  };

  const renderweeklyTimesheetSection = () => {
    return (
      <div>
        <WeeklyTimesheet candidateDetails={candidateData} />
      </div>
    );
  };

  const rendermonthlyTimesheetSection = () => {
    let isDisabled = getPermissions("invoice") == "view";

    return (
      <div>
        <VendorManagement candidateDetails={candidateData} disabled={disabled || isDisabled} />
      </div>
    );
  };

  const rendermonthlyTimesheetSectiondefaultView = () => {
    let isDisabled = getPermissions("time_sheets") == "view";

    return (
      <div>
        <MonthlyTimesheetDefaultView candidateDetails={candidateData} disabled={disabled || isDisabled} />
      </div>
    );
  };

  const renderOnboardingSection = () => {
    let isDisabled = getPermissions("onboarding") == "view";

    return (
      <div>
        <RenderOnboardingSection candidateDetails={candidateData} disabled={disabled || isDisabled} />
      </div>
    );
  };

  const renderProjectsSection = () => {
    let isDisabled = getPermissions("projects") == "view" || disabled;

    return (
      <div>
        <CandidateProjectsTab candidateDetails={candidateData} disabled={isDisabled} />
      </div>
    );
  };
  const RenderImmigrationForm = () => {
    let isDisabled = getPermissions("projects") == "view" || disabled;

    return (
      <div>
        <ImmigrationTab disabled={disabled} candidate={candidateData} />
      </div>
    );
  };

  const customInputs = (custom) => {
    let obj = {
      fileinput: renderfilesInput,
      myTaskSection: renderMyTask,
      weeklyTimesheetSection: renderweeklyTimesheetSection,
      monthlyTimesheetSection: rendermonthlyTimesheetSection,
      monthlyTimesheetDefaultSection: rendermonthlyTimesheetSectiondefaultView,
      renderOnboardingSection: renderOnboardingSection,
      projectsSection: renderProjectsSection,
      immigrationForm: RenderImmigrationForm,
      allForms: () => (
        <AllForms
          isEmailError={isEmailError}
          disabled={disabled}
          isLoading={isLoading}
          onSubmit={handleFormSubmit}
          candidateData={candidateData}
          recruitersBList={recruitersBList}
          teamsData={teamsData}
          update={update}
          onEmailChangeConfirm={handleEmailChangeConfirm}
          onProjectsChange={() => {
            if (getPermissions("projects") != "hide" && getAddonValue("PJ")) {
              setActiveTab(3);
            }
          }}
        />
      ),
    };

    if (obj[custom]) {
      return obj[custom]();
    }
    return <></>;
  };

  const renderFormInnerContent = () => {
    const Icon = activeTabData?.icon;

    return (
      <>
        <div className={styles.tabcontentcontainerMain}>
          {activeTabData?.hideLabel ? (
            <></>
          ) : (
            <div className={`${styles.tabinfo} ${activeTabData?.id === 1 ? styles.tabinfoActive : ""}`}>
              {activeTabData?.id === 3 ? (
                <div style={{ fontSize: "20px", fontWeight: "700", marginTop: "-10px" }}>
                  {candidateData.first_name} {candidateData.last_name}'s Projects
                </div>
              ) : (
                <>
                  <Icon size={18} />
                  <div>{activeTabData?.label}</div>
                </>
              )}
            </div>
          )}
          <div className={styles.tabcontentcontainer}>{customInputs(activeTabData?.showCustom)}</div>
        </div>
      </>
    );
  };

  return (
    <>
      {isModalActive && (
        <OverlayModal
          isActive={isModalActive}
          onClose={() => setIsModalActive(false)}
          style={modalWidthStyle}
          modalStyle={modalColorStyle}
        >
          <button
            style={{
              position: "fixed",
              top: "10px",
              right: "25px",
              zIndex: 1,
            }}
            type="button"
            onClick={() => setIsModalActive(false)}
            className="hidemodalclosebtn pdfcontrollButtonsPDF "
          >
            <X size={20} strokeWidth={3} />
          </button>

          <div className="modal-content">
            <div className="modal-header">{renderEditHeader()} </div>
            <div className="modal-body">
              {/* Tab Navigation */}
              <div
                style={update ? {} : { width: "max-content" }}
                className={`d-flex ${styles.tabContainer} justify-content-start`}
              >
                {tabs.map((tab) => {
                  let Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      className={`btn ${styles.tabBTN} ${activeTab === tab.id ? styles.activetab : styles.navtab}`}
                      onClick={() => {
                        if (disabled || update) {
                          setActiveTab(tab.id);
                        }
                      }}
                    >
                      <Icon size={15} />
                      <p className={styles.buttonText}>{tab.label}</p>
                    </button>
                  );
                })}
              </div>

              {/* Form Content */}
              {renderFormInnerContent()}
            </div>
            <ThemeLoader show={loading || isLoading} fixed />
          </div>

          <ContactMail
            updateTable={() => {}}
            isModalActive={isContactSection}
            data={candidateData}
            allData={candidateData}
            setIsModalActive={setIsContactSection}
          />

          <Confirm
            show={decodedPassword}
            deleteTitle="Copy"
            icon="content_copy"
            result={(result) => {
              if (result) {
                navigator.clipboard
                  .writeText(decodedPassword)
                  .then(() => {
                    toast.success("Copied to clipboard!");
                  })
                  .catch((err) => toast.error("Failed to copy"));
              }
              setDecodedPassword("");
            }}
            title={`Password Updated`}
            text={`Your new password is: <b> ${decodedPassword}</b>`}
          />

          <Confirm
            show={primaryMailChangedpupup}
            result={(result) => handleEmailChangeConfirm(result, primaryMailChangedpupup)}
            title={"Confirm Primary Email Update"}
            text={`<div>
                <div style='font-size: 14px;'>You are about to update the primary email address. Once updated, the employee must use <b>the new email address</b> to log in to the Employee Portal going forward.</div>
                <div style='font-size: 16px;'>Do you want to continue?</div>
              </div>`}
            deleteTitle="Update Email"
          />

          <Confirm
            show={deleteModal}
            result={(result) => {
              if (result) {
                if (deleteModal === true) {
                  deleteBenchCandidates();
                } else {
                  candidateActions(deleteModal, candidateData.original_email || candidateData.primary_email);
                }
              }
              setdeleteModal(false);
            }}
            title={modalTitle}
            text={deleteText}
            deleteTitle="Yes, I'm Sure"
          />
        </OverlayModal>
      )}
    </>
  );
};

export default CandidateModal;
