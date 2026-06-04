import { useState, useEffect } from "react";
import { useAuth } from "../../authContext";
import "./userstyle.css?v=1.2.3";
import "../benchcandidate/style.css?v=1.2.3";
import "../dashboard/style.css";
import { ReactComponent as SaveIcon } from "./saveIcon.svg";
import { ReactComponent as ResetIcon } from "./resetIcon.svg";
import styles from "../talentpool/css/TalentPool.module.css";
import stylesTwo from "../../components/css/Logout.module.css";
import { toast } from "react-toastify";
import { axiosApi, Confirm, ThemeLoader } from "../../components";
import { Phone, User } from "lucide-react";

import otherGender from "../../images/otherGender.svg";
import images from "../../assets/images/new";

const { female_icon, male_icon } = images;

const employerPortelEndPoint = "https://employer-profile-mgmt-v3-305451280005.us-east1.run.app";
const employeePortelEndPoint = "https://employee-profile-mgmt-v3-305451280005.us-east1.run.app";

const UserProfile = () => {
  const { user } = useAuth();
  let isEmployee = String(localStorage.getItem("userType")).toLowerCase() === "employee";

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    country: "",
    gender: "",
    mobile_no: "",
    country_code: "",
  });

  const [employeeProfile, setEmployeeProfile] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    country: "",
    gender: "",
    mobile_no: "",
    country_code: "",
  });

  const [popupActive, setPopupActive] = useState("");
  const [resetPasswordPopup, setresetPasswordPopup] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [resNotification, setResNotification] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && !isEmployee) {
      fetchProfileData();
    }
    if (isEmployee && user) {
      getEmployeeProfile();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const payload = {
        action: "get-profile",
      };
      setisLoading(true);
      axiosApi
        .post(employerPortelEndPoint + "/profile-management-api", payload)
        .then((res) => {
          setisLoading(false);
          setProfile(res?.data?.profile);
        })
        .catch((err) => {
          setisLoading(false);
          console.log(err);
        });
    } catch (error) {
      setisLoading(false);
      setError(error.message);
    }
  };

  const getEmployeeProfile = async () => {
    try {
      const payload = {
        action: "get-profile",
      };
      setisLoading(true);

      axiosApi
        .post(employeePortelEndPoint, payload)
        .then((res) => {
          setisLoading(false);
          console.log(res?.data?.profile, "res?.data?.profile");
          setEmployeeProfile(res?.data?.profile);
          setProfile(res?.data?.profile);
        })
        .catch((err) => {
          setisLoading(false);
          console.log(err);
        });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.first_name || !profile.last_name || !profile.email) {
      toast.error("Please fill out all fields.");
      return;
    }

    setisLoading(true);
    try {
      const payload = {
        action: "update-profile",
        first_name: profile.first_name,
        last_name: profile.last_name,
        gender: profile.gender,
        country: profile.country,
        mobile_no: profile.mobile_no,
        country_code: profile.country_code,
      };

      axiosApi
        .post(employerPortelEndPoint + "/profile-management-api", payload)
        .then((res) => {
          setPopupActive(
            "Your profile has been updated successfully!<br><br>Thank you for taking the time to update your profile."
          );
          setisLoading(false);
        })
        .catch((error) => {
          setError(error.message);
          toast.error(error.response.data.message || "Failed to update");
          setisLoading(false);
        });
    } catch (error) {
      setError(error.message);
      setisLoading(false);
    }
  };

  const handleEmployeeSubmit = async (e) => {
    try {
      const payload = {
        action: "update-profile",
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        gender: profile?.gender,
      };
      setisLoading(true);

      axiosApi
        .post(employeePortelEndPoint, payload)
        .then((res) => {
          setisLoading(false);
          setPopupActive(
            "Your profile has been updated successfully!<br><br>Thank you for taking the time to update your profile."
          );
        })
        .catch((err) => {
          setisLoading(false);
          console.log(err);
          toast.error(err.response.data.message || "Failed to update");
        });
    } catch (error) {
      setError(error.message);
      setisLoading(false);
    }
  };

  function closePopup() {
    setPopupActive("");
  }

  const sendResetPassword = async () => {
    setisLoading(true);

    const formData = {
      action: "send-password-reset",
      email: isEmployee ? profile.primary_email : profile.email,
    };

    let url = isEmployee
      ? "https://employee-authentication-api-v3-305451280005.us-east1.run.app/"
      : "https://us-east1-recruiterportal.cloudfunctions.net/user_authentication_api_v3";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid credentials");
      }

      const data = await response.json();
      setResNotification("sent");
    } catch (error) {
      console.log("Password reset failed:", error.message);

      toast.error(error.message);
    } finally {
      setisLoading(false);
    }
  };

  const renderContactInfo = () => {
    if (isEmployee) {
      return <></>;
    }
    return (
      <div className="registerForm profilePage col-flex shadow-sm border mt-4 rounded-1 p-3 mb-3">
        <div>
          <div className="registerTopHead">
            <Phone />
            <h4>Contact Information</h4>
          </div>
          <div style={{ color: "#64748b" }}>Keep your contact details up to date</div>
        </div>
        <div className="formInner col-flex">
          <div className="inputRow twoGridView">
            <div className="input col-flex">
              <span className="head">Phone Number</span>
              <div className="row-flex contactinput" style={{ width: "100%" }}>
                <div className="input col-flex" style={{ width: "30%" }}>
                  <select
                    type="text"
                    name="country_code"
                    className="login-input"
                    placeholder="Enter country code"
                    value={profile.country_code}
                    onChange={handleInputChange}
                  >
                    <option value="+91">IND +91</option>
                    <option value="+01">USA +01</option>
                  </select>
                </div>
                <div className="input col-flex">
                  <input
                    type="text"
                    name="mobile_no"
                    className="login-input"
                    placeholder="Enter Mobile Number"
                    value={profile.mobile_no}
                    onChange={handleInputChange}
                    pattern="\d*" // Ensures only numbers can be input
                    maxLength="10" // Limits the input to 10 digits
                    onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ""))} // Extra validation to ensure only numbers
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPersonalInfoForm = (profile = {}) => {
    return (
      <>
        <div className="formInner col-flex">
          <div className="inputRow twoGridView">
            <div className="input col-flex">
              <span className="head">First Name</span>
              <input
                type="text"
                name="first_name"
                className="login-input"
                placeholder="First Name"
                value={profile.first_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="input col-flex">
              <span className="head">Last Name</span>
              <input
                type="text"
                name="last_name"
                className="login-input"
                placeholder="Last Name"
                value={profile.last_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="input col-flex">
              <span className="head">Primary Email ID</span>
              <input
                type="text"
                name="email"
                className="login-input"
                placeholder="Primary Email ID"
                value={profile.email || profile.primary_email || ""}
                // onChange={handleInputChange}
                readOnly
                disabled
              />
            </div>
            <div className="input col-flex">
              <span className="head">Select Your Gender</span>
              <select
                type="text"
                name="gender"
                className="login-input selectarrow"
                placeholder="Select Your Gender"
                value={profile.gender}
                onChange={handleInputChange}
                readOnly={isEmployee}
                disabled={isEmployee}
              >
                <option value="">Select Your Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>
      </>
    );
  };

  const returnIcon = (gender) => {
    let lowerCaseGender = String(gender).toLowerCase();

    let icons = {
      male: male_icon,
      female: female_icon,
    };

    return icons[lowerCaseGender] || otherGender;
  };

  return (
    <div>
      <div className="main-dash row-flex">
        <div className="content profilePage col-flex">
          <div className={`${styles.container} container-fluid py-4 px-2 px-sm-3 px-md-4 rightcontent`}>
            <div
              className="headerBackground text-white p-3 rounded-top d-flex col-flex"
              style={{ borderRadius: "22px !important" }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h2 className="mb-0 fw-bold h2">Profile</h2>
                </div>
                <div className="d-flex align-items-center gap-3"></div>
              </div>
            </div>
            <div className="py-3 px-0 px-sm-3 rounded-bottom">
              <div className={`headerboxglass ${styles.headerboxglass}`}>
                <div className="headerboxoverflow d-flex justify-content-between align-items-center mb-3">
                  <div className=" profileHead d-flex gap-2 justify-content-space-betgween">
                    <div className="profile-row row-flex">
                      {isEmployee ? (
                        <>
                          <img src={returnIcon(employeeProfile.gender)} />

                          <div className="info">
                            <h3 className="name">
                              {employeeProfile.first_name} {employeeProfile.last_name}
                            </h3>
                            <h4 className="email">{employeeProfile.primary_email}</h4>
                          </div>
                        </>
                      ) : (
                        <>
                          <img src={returnIcon(profile.gender)} />
                          <div className="info">
                            <h3 className="name">
                              {profile.first_name} {profile.last_name}
                            </h3>
                            <h4 className="email">{profile.email}</h4>
                          </div>
                        </>
                      )}
                    </div>

                    {/* <div className="profileButtons">
                      <button className="headerButtons" onClick={() => setresetPasswordPopup(true)}>
                        <ResetIcon />
                        <div className="mobHidden">Reset Password</div>
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>
              <div className="registerForm profilePage col-flex shadow-sm border rounded-1 p-3 mb-3">
                <div>
                  <div className="registerTopHead">
                    <User />
                    <h4>Personal Information</h4>
                  </div>
                  <div style={{ color: "#64748b" }}>Update your basic profile information</div>
                </div>

                {renderPersonalInfoForm(profile)}
              </div>

              {renderContactInfo()}

              <button
                className="ms-auto mt-3 themeButton themeButtonHover"
                onClick={(e) => {
                  if (isEmployee) {
                    handleEmployeeSubmit(e);
                  } else {
                    handleSubmit(e);
                  }
                }}
              >
                <SaveIcon />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      {popupActive !== "" && (
        <>
          <div className={stylesTwo.confirmOverlay}>
            <div className={stylesTwo.confirmModal}>
              <div className={`${stylesTwo.modalHeader} d-flex align-items-center justify-content-between`}>
                <h3>Update Status</h3>
                <span
                  class="material-symbols-outlined pointer"
                  onClick={() => {
                    closePopup();
                  }}
                >
                  close
                </span>
              </div>
              <div className={`d-flex flex-column align-items-center ${stylesTwo.modalBody}`}>
                <div className={`${stylesTwo.confirmHeading}`}>
                  <div className="fw-bold">Your Profile has been successfully updated.</div>
                </div>

                <div className={stylesTwo.buttonContainer}>
                  <button
                    onClick={() => {
                      closePopup();
                    }}
                    className={`${stylesTwo.confirmButton} ${stylesTwo.confirmYes}`}
                  >
                    <span class="logout-icon " />
                    ok
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {resNotification !== "" && (
        <>
          <div className={stylesTwo.confirmOverlay}>
            <div className={stylesTwo.confirmModal}>
              <div className={`${stylesTwo.modalHeader} d-flex align-items-center justify-content-between`}>
                <h3>Password Reset</h3>
                <span
                  class="material-symbols-outlined pointer"
                  onClick={() => {
                    setResNotification("");
                  }}
                >
                  close
                </span>
              </div>
              <div className={`d-flex flex-column align-items-center ${stylesTwo.modalBody}`}>
                <div className={`${stylesTwo.confirmHeading}`}>
                  <div className="fw-bold">We've sent a password reset link to your registered email.</div>
                  <div className="fw-bold">Please check your inbox.</div>
                </div>

                <div className={stylesTwo.buttonContainer}>
                  <button
                    onClick={() => {
                      setResNotification("");
                    }}
                    className={`${stylesTwo.confirmButton} ${stylesTwo.confirmYes}`}
                  >
                    <span class="logout-icon " />
                    ok
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <ThemeLoader show={isLoading} />
      <Confirm
        result={(val) => {
          if (val) {
            sendResetPassword();
          }
          setresetPasswordPopup(false);
        }}
        title="Reset Password"
        text="Are you sure you want to reset your password?"
        deleteTitle="OK"
        show={resetPasswordPopup}
      />
    </div>
  );
};

export default UserProfile;
