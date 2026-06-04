import { useEffect, useId, useState } from "react";
import styles from "./css/styles.module.css";
import api from "../../networking/api";
import { axiosApi, Confirm, ThemeLoader } from "../../components";
import { useAuth } from "../../authContext";
import { toast } from "react-toastify";
import { MailCheck, MailOpen, ShieldIcon, XCircle } from "lucide-react";
import { FiExternalLink } from "react-icons/fi";
import EmailInput from "./EmailInput";
import axios from "axios";
import { Mail, CheckCircle, Shield, Unplug } from "lucide-react";
import { pickDateOnly } from "../../helpers/StrHelpers";
import { getLogoURL } from "../../components/Header/Mainheader";

const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64Only = dataUrl.split(",")[1];
      resolve(base64Only);
    };
    reader.onerror = reject;
  });
};

const API_URL = "https://authenticate-users-with-email-provider-v3-305451280005.us-east1.run.app";

function sanitizeEmailConfigs(data) {
  return data.map(({ category_name, config_id, email_addresses, is_enabled }) => ({
    category_name,
    config_id,
    email_addresses,
  }));
}

function CompanyDetails() {
  const [activeTab, setActiveTab] = useState(1);
  const [errors, setErrors] = useState({});
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [loading, setloading] = useState(false);
  const [formData, setFormData] = useState({});
  const [emailFormData, setEmailFormData] = useState([]);
  const [emailConfData, setemailConfData] = useState({});
  const [emailFormDataApi, setEmailFormDataApi] = useState([]);
  const [openConfModal, setopenConfModal] = useState(false);
  // const [authMethod, setAuthMethod] = useState("");
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [listIntegrationsData, setlistIntegrationsData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [mailerrorModal, setMailErrorModal] = useState("");
  const [logoPreviewURL, setlogoPreviewURL] = useState("");
  const [logoLoader, setlogoLoader] = useState("");

  const { user } = useAuth();

  let userEmail = user?.email;

  useEffect(() => {
    if (uploadedDocs[0]?.file_content) {
      let payload = {
        action: "update_logo",
        admin_email: userEmail,
        logo_file: uploadedDocs[0]?.file_content,
      };
      setlogoLoader(true);
      axiosApi
        .post("https://fetch-update-org-data-emails-v3-305451280005.us-east1.run.app/", payload)
        .then((res) => {
          toast.success(res?.data?.message || "Logo Updated");
          getCompanyDetails();
          window.dispatchEvent(new Event("refreshCompanyData"));
        })
        .catch((err) => {
          console.log(err, "error");
        })
        .finally(() => setlogoLoader(false));
    }
  }, [uploadedDocs[0]]);

  useEffect(() => {
    if (formData?.org_logo_file) {
      getLogoURL(formData?.org_logo_file)
        .then(function (finalUrl) {
          setlogoPreviewURL(finalUrl);
        })
        .catch((err) => {});
    }
  }, [formData?.org_logo_file]);

  let uniqueId = useId();

  useEffect(() => {
    localStorage.removeItem("isscrape");

    if (user?.email) {
      getCompanyDetails();
      getCompanyEmails();
      listIntegrations();
    }
  }, [user?.email]);

  useEffect(() => {
    getPincodeDetails();
  }, [formData.org_zipcode]);

  useEffect(() => {
    const dataList = listIntegrationsData?.integrations;

    if ((emailConfData?.email_address || emailConfData?.email_addressScrape) && dataList?.length) {
      let emailMatch = false;
      let scrapeEmailMatch = false;

      dataList.forEach((item) => {
        if (item.email_address === emailConfData?.email_address) {
          emailMatch = true;
        }
        if (item.email_address === emailConfData?.email_addressScrape) {
          scrapeEmailMatch = true;
        }
      });

      if (emailMatch || scrapeEmailMatch) {
        setIsError(true);
        const errorMsg = `
        ${
          emailMatch
            ? `The email address <b>${emailConfData?.email_address}</b> is already associated with the Rate Confirmation Scraping Account`
            : ""
        }
    ${
      scrapeEmailMatch
        ? `The email address <b>${emailConfData?.email_addressScrape}</b> is already associated with the Outgoing Email Account`
        : ""
    }
      `;

        setMailErrorModal(errorMsg);
      } else {
        setIsError(false);
        setErrors((prev) => ({
          ...prev,
          email_address: "",
          email_addressScrape: "",
        }));
      }
    } else {
      setIsError(false);
    }
  }, [emailConfData?.email_address, emailConfData?.email_addressScrape, listIntegrationsData]);

  const listIntegrations = () => {
    const payload = {
      action: "list_integrations",
      requesting_user_email: user?.email,
    };

    axios
      .post(API_URL, payload, { headers: { "Content-Type": "application/json" } })
      .then(({ data }) => {
        setlistIntegrationsData(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const checkAuthHealth = (data) => {
    const payload = {
      action: "test_connection",
      requesting_user_email: user?.email,
      integration_id: data?.integration_id,
    };
    setloading(true);

    axios
      .post(API_URL, payload, { headers: { "Content-Type": "application/json" } })
      .then(({ data }) => {
        if (data.success) {
          toast.success(data.message);
        } else {
          toast.error(data.message || data?.error_details);
        }
        listIntegrations();
        setloading(false);
      })
      .catch((error) => {
        setloading(false);
        toast.error(error?.response?.data?.error || error?.response?.data?.message || error?.message);
        console.log("Health Check Error:", error);
      });
  };

  const getCompanyDetails = () => {
    let payload = {
      action: "org_data",
      admin_email: user?.email,
    };
    setloading(true);
    api
      .CompanyDetails(payload)
      .then((res) => {
        setloading(false);

        if (res?.data?.[0]) {
          setFormData(res?.data?.[0]);
        }
      })
      .catch((err) => {
        setloading(false);
        console.log(err);
      });
  };

  const getCompanyEmails = () => {
    let payload = {
      action: "retrieve_emails",
      admin_email: user?.email,
    };
    setloading(true);
    api
      .CompanyDetails(payload)
      .then((res) => {
        setloading(false);
        setEmailFormData(sanitizeEmailConfigs(res.data));
        setEmailFormDataApi(sanitizeEmailConfigs(res.data));
      })
      .catch((err) => {
        setloading(false);
        console.log(err);
      });
  };

  const getPincodeDetails = () => {
    if (String(formData.org_zipcode).length == 5) {
      let payload = { zip_code: formData.org_zipcode };
      setloading(true);
      api
        .zipCodeInfo(payload)
        .then((data) => {
          setloading(false);
          if (data) {
            let city = data?.data?.city;
            let state = data?.data?.state;
            let country = data?.data?.country;

            if (city) {
              formData.org_city = city;
            }
            if (state) {
              formData.org_state = state;
            }
            if (country) {
              formData.org_country = country;
            }

            setFormData({ ...formData });
          }
        })
        .catch((err) => {
          setloading(false);
          console.log(err);
        });
    }
  };

  const filterPayload = (data) => {
    const existingByCategory = emailFormDataApi.reduce((acc, { category_name, email_addresses, config_id }) => {
      acc[category_name] = { email_addresses, config_id };
      return acc;
    }, {});

    const incomingByCategory = data.reduce((acc, item) => {
      acc[item.category_name] = item;
      return acc;
    }, {});

    const dataNew = [];
    const dataUpdate = [];
    const dataDelete = [];

    for (const item of data) {
      const existing = existingByCategory[item.category_name];
      if (existing) {
        // if (item.email_addresses && item.email_addresses !== existing.email_addresses) {
        if (item.email_addresses !== existing.email_addresses) {
          dataUpdate.push({
            config_id: existing.config_id,
            category_name: item.category_name,
            email_addresses: item.email_addresses || null,
          });
        }
        // else if (!item.email_addresses) {
        //   dataDelete.push({
        //     config_id: existing.config_id,
        //     category_name: item.category_name,
        //   });
        // }
      } else if (item.email_addresses) {
        dataNew.push(item);
      }
    }

    for (const [category_name, { config_id }] of Object.entries(existingByCategory)) {
      if (!incomingByCategory[category_name]) {
        dataDelete.push({ config_id, category_name });
      }
    }

    return { dataNew, dataUpdate, dataDelete };
  };

  const submitEmails = () => {
    const { dataNew, dataUpdate, dataDelete } = filterPayload(emailFormData);
    const promises = [];

    if (dataDelete.length) {
      const payload = {
        action: "delete_email_config",
        admin_email: user?.email,
        config_data: dataDelete,
        ...(dataDelete.length === 1 && { config_id: dataDelete[0].config_id }),
      };
      promises.push(
        api
          .CompanyDetails(payload)
          .then((res) => toast.success(res.message || "Deleted Successfully"))
          .catch((err) => toast.error(err.error)),
      );
    }

    if (dataNew.length) {
      const payload = {
        action: "create_email_config",
        admin_email: user?.email,
        config_data: dataNew,
      };
      promises.push(
        api
          .CompanyDetails(payload)
          .then((res) => toast.success(res.message || "Created Successfully"))
          .catch((err) => toast.error(err.error)),
      );
    }

    if (dataUpdate.length) {
      let payload = {
        action: "update_emails",
        admin_email: user?.email,
        update: dataUpdate.length === 1 ? dataUpdate[0] : dataUpdate,
      };

      if (dataUpdate.length == 1) {
        payload = {
          action: "update_emails",
          admin_email: user?.email,
          update: dataUpdate[0],
        };
      } else {
        payload = {
          action: "update_emails",
          admin_email: user?.email,
          updates: dataUpdate,
        };
      }

      promises.push(
        api
          .CompanyDetails(payload)
          .then((res) => toast.success(res.message || "Email configuration updated successfully"))
          .catch((err) => toast.error(err.error)),
      );
    }

    if (!promises.length) return;

    setloading(true);
    Promise.all(promises)
      .then(() => {
        getCompanyEmails();
      })
      .finally(() => {
        setloading(false);
      });
  };

  const submitForm = () => {
    let newFormData = { ...formData };
    // let logoURL = uploadedDocs?.[0]?.file_content;

    // if (logoURL) {
    //   newFormData.logo_file = logoURL;
    // }

    let payload = {
      action: "org_data",
      admin_email: user?.email,
      update: newFormData,
    };

    setloading(true);
    api
      .CompanyDetails(payload)
      .then((res) => {
        setloading(false);
        toast.success("Updated Successfully");
      })
      .catch((err) => {
        setloading(false);
        toast.error(err.error);
        console.log(err);
      });
  };

  // const handleSaveConf = (isscraping = false) => {
  //   // setopenConfModal(true);
  //   let extraKey = isscraping ? "Scrape" : "";
  //   let extra = {
  //     purpose: "Email to use to send all emails to consultants",
  //     purpose_description: "Primary email for consultant communications and updates",
  //   };

  //   if (isscraping) {
  //     extra = {
  //       purpose: "Email to scrap rate confirmations",
  //       purpose_description: "This email receives rate confirmations from vendors for processing",
  //     };
  //   }

  //   if (!emailConfData["oauth2_config" + extraKey]) {
  //     errors["oauth2_config" + extraKey] = "Provider is required";
  //     return setErrors({ ...errors });
  //   }

  //   const requestingUserEmail = user?.email;
  //   const encodedPassword = encodeBase64(emailConfData?.["email_password" + extraKey]);
  //   const username = emailConfData?.["email_address" + extraKey];
  //   let provider = emailConfData?.["oauth2_config" + extraKey] === "microsoft" ? "outlook" : "gmail";

  //   let newPayload = {
  //     action: "basic_auth_connect",
  //     requesting_user_email: requestingUserEmail,
  //     provider,
  //     email_address: username,
  //     username: username,
  //     password: encodedPassword,
  //     ...extra,
  //   };

  //   console.log(newPayload, "newpayload");

  //   return;

  //   setloading(true);

  //   return axios
  //     .post(API_URL, newPayload, { headers: { "Content-Type": "application/json" } })
  //     .then((response) => {
  //       setloading(false);
  //       toast.success(`Connected ${username} successfully!`);
  //       return response.data;
  //     })
  //     .catch((error) => {
  //       setloading(false);
  //       const message = error?.response?.data?.error || error.response?.data?.message || error.message;
  //       toast.error(`${message}`);
  //       console.log(error, "connect error");
  //     });
  // };

  const handleChange = (key, value) => {
    errors[key] = "";
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangeConf = (key, value) => {
    errors[key] = "";
    setemailConfData((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangeEmail = (categoryName, value) => {
    setEmailFormData((prev) => {
      const index = prev.findIndex((item) => item.category_name === categoryName);
      if (index !== -1) {
        return prev.map((item) => (item.category_name === categoryName ? { ...item, email_addresses: value } : item));
      }
      return [...prev, { category_name: categoryName, email_addresses: value }];
    });
  };

  const renderInput = (label = "", key = "", placeholder = "", hide, disabledWithwarn) => {
    if (hide) {
      return <></>;
    }
    return (
      <div className="mb-3">
        <label htmlFor={"uid" + uniqueId + key} className="form-label fw-500 font14 mb-1" style={{ color: "#020817" }}>
          {label}
        </label>
        <input
          title={
            disabledWithwarn ? "This field cannot be edited. Please contact your administrator for assistance." : ""
          }
          disabled={disabledWithwarn}
          style={{ boxShadow: "unset" }}
          value={formData[key]}
          onChange={(e) => handleChange(key, e.target.value)}
          className="form-control"
          id={"uid" + uniqueId + key}
          placeholder={placeholder}
        />
        {errors[key] && <div className="text-danger font12">{errors[key]}</div>}
      </div>
    );
  };

  const renderEmailInput = (label, categoryName, placeholder, information) => (
    <div className="mb-4" key={categoryName}>
      <label
        htmlFor={`uid${uniqueId}${categoryName}`}
        className="form-label fw-500 font14 mb-1"
        style={{ color: "#020817" }}
      >
        {label}
      </label>
      <div className="d-flex align-items-center position-relative">
        <span
          className="material-symbols-outlined fontgray position-absolute my-auto mt-1"
          style={{
            fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48",
            fontSize: "18px",
            left: "10px",
          }}
        >
          mail
        </span>

        <input
          id={`uid${uniqueId}${categoryName}`}
          className="form-control font14 fw-400"
          style={{ boxShadow: "unset", paddingLeft: "35px" }}
          value={emailFormData.find((item) => item.category_name === categoryName)?.email_addresses || ""}
          onChange={(e) => handleChangeEmail(categoryName, e.target.value)}
          placeholder={placeholder}
        />
      </div>

      <div className="font12 fontgray my-1">{information}</div>
    </div>
  );

  const renderEmailInputConf = (label, key, placeholder, information, hide) => {
    if (hide) {
      return <></>;
    }
    return (
      <div className="mb-3" key={key}>
        <label htmlFor={`uid${uniqueId}${key}`} className="form-label fw-500 font14 mb-1" style={{ color: "#020817" }}>
          {label}
        </label>
        <div className="d-flex align-items-center position-relative">
          <span
            className="material-symbols-outlined fontgray position-absolute my-auto mt-1"
            style={{
              fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48",
              fontSize: "18px",
              left: "10px",
            }}
          >
            mail
          </span>

          <input
            id={`uid${uniqueId}${key}`}
            className="form-control font14 fw-400"
            style={{ boxShadow: "unset", paddingLeft: "35px" }}
            value={emailConfData[key] || ""}
            onChange={(e) => handleChangeConf(key, e.target.value)}
            placeholder={placeholder}
          />
        </div>
        {errors[key] ? <div className="text-danger">{errors[key]} </div> : <></>}
        <div className="font12 fontgray my-1">{information}</div>
      </div>
    );
  };

  const renderFileInput = (label = "", key = "", accept = "", multiple = false, hide = false) => {
    if (hide) return null;

    const onFileChange = (e) => {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      const maxSize = 2 * 1024 * 1024;

      const files = multiple ? Array.from(e.target.files) : [e.target.files[0]];

      const invalidFile = files.find((file) => !allowedTypes.includes(file.type) || file.size > maxSize);

      if (invalidFile) {
        setErrors((prev) => ({
          ...prev,
          [key]: "Only JPG, JPEG, PNG files up to 2MB are allowed",
        }));
        return;
      }

      Promise.all(
        files.map((file) =>
          toBase64(file).then((base64) => {
            const doc_expiry = uploadedDocs.find((d) => d.document_type === key)?.doc_expiry || null;

            const obj = {
              file_name: file.name,
              document_type: key,
              file_content: base64,
            };

            if (doc_expiry) {
              obj.doc_expiry = doc_expiry;
            }

            return obj;
          }),
        ),
      )
        .then((updatedDocs) => {
          setUploadedDocs((prev) => [...prev.filter((doc) => doc.document_type !== key), ...updatedDocs]);

          setErrors((prev) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
          });
        })
        .catch(() => {
          setErrors((prev) => ({
            ...prev,
            [key]: "File processing failed",
          }));
        });
    };

    return (
      <div>
        <label htmlFor={`uid${uniqueId}${key}`} className="form-label fw-500 font14 mb-1" style={{ color: "#020817" }}>
          {label}
        </label>
        <input
          disabled={logoLoader}
          type="file"
          accept={accept}
          multiple={multiple}
          id={`uid${uniqueId}${key}`}
          className="form-control"
          style={{ boxShadow: "unset" }}
          onChange={onFileChange}
        />
        {errors[key] && <div className="text-danger font12">{errors[key]}</div>}
      </div>
    );
  };

  const handleDisconnect = (email, provider, authType) => {
    const payload = {
      action: "disconnect_email",
      requesting_user_email: user?.email,
      email_address: email,
      provider,
      auth_type: authType,
    };

    setloading(true);

    axios
      .post(API_URL, payload, { headers: { "Content-Type": "application/json" } })
      .then((res) => {
        console.log(res, "response from api");

        let data = res.data;
        setloading(false);
        listIntegrations();
        toast.success(data?.message);
      })
      .catch((err) => {
        setloading(false);
        console.log(err, "err response from api");

        toast.error(`Disconnect error: ${err}`);
      });
  };

  const renderAvailableAuths = (title, icon) => {
    const accountsDataAll = listIntegrationsData?.integrations || [];

    let accountsData = accountsDataAll.filter((item) => {
      if (title) {
        return item.purpose == "Email to scrap rate confirmations";
      } else {
        return item.purpose != "Email to scrap rate confirmations";
      }
    });

    return (
      <div className={styles.ceaContainer}>
        <h4 className={styles.ceaTitle}>
          {icon ?? <MailOpen className="me-2" />}
          {title || "Connected Sending Accounts"}
        </h4>
        <div className={styles.ceaList}>
          {accountsData.map((acc, idx) => {
            if (acc?.purpose != "Email to use to send all emails to consultants" && !title) {
              return <></>;
            }

            return (
              <>
                <div key={idx} className={styles.ceaCard}>
                  <div className={styles.ceaCardHeader}>
                    <div className={styles.ceaAccountInfo}>
                      <div className={styles.ceaAccountDetails}>
                        <Mail className={styles.ceaMailIcon} />
                        <span className={styles.ceaEmailText}>{acc.email_address}</span>
                      </div>
                      <div className={styles.ceaStatusBadge}>
                        {acc.status === "active" ? (
                          <>
                            <CheckCircle className={styles.ceaCheckIcon} />
                            <span className={styles.ceaActiveBadge}>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className={styles.ceaErrorIcon} />
                            <span className={`${styles.ceaErrorBadge} capitalize`}>{acc.status || "Error"}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={styles.ceaActions}>
                      <button type="button" onClick={() => checkAuthHealth(acc)} className={styles.ceaTestBtn}>
                        <Shield className={styles.ceaShieldIcon} />
                        Test Connection
                      </button>
                      {acc.status == "disconnected" ? (
                        <></>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDisconnect(acc.email_address, acc.provider, acc.auth_type)}
                          className={styles.ceaDisconnectBtn}
                        >
                          <Unplug className={styles.ceaUnplugIcon} />
                          Disconnect
                        </button>
                      )}
                    </div>
                  </div>
                  <div className={`capitalize ${styles.ceaCardFooter}`}>
                    <span>Provider: {acc.provider}</span>
                    <span>Auth: {acc.auth_type}</span>
                    <span>Connected: {pickDateOnly(acc.created_at)}</span>
                    <span>Connected: {pickDateOnly(acc.updated_at)}</span>
                  </div>
                </div>
              </>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEmailInputConfOptions = (isscraping) => {
    let extra = isscraping ? "Scrape" : "";

    if (!emailConfData["email_address" + extra]) {
      return <></>;
    }
    let label = isscraping ? "Scrape" : "";
    let labelre = !isscraping ? "Scrape" : "";

    return (
      <div>
        {/* <label
          htmlFor={`uid${uniqueId}_${label}`}
          className="form-label fw-500 font14 mb-3"
          style={{ color: "#020817" }}
        >
          Authentication Method
        </label>
        <div id="authMethod" className="d-flex flex-column gap-2">
          <div className="form-check d-flex align-items-center">
            <input
              id={`password_${label}`}
              name="authMethod"
              type="radio"
              className="form-check-input mb-1"
              value={"password" + label}
              checked={authMethod === "password" + label}
              onChange={() => {
                emailConfData["email_address" + labelre] = "";
                setAuthMethod("password" + label);
                setemailConfData({ ...emailConfData });
              }}
            />
            <label
              htmlFor={`password_${label}`}
              style={{ color: "#020817", fontSize: "14px" }}
              className="form-check-label fw-500 d-flex align-items-center ms-2"
            >
              <LockIcon className="icon-sm me-1" style={{ width: "16px", marginBottom: "2px" }} />
              Password Authentication
            </label>
          </div>

          <div className="form-check d-flex align-items-center">
            <input
              id={`oauth2_${label}`}
              name="authMethod"
              type="radio"
              className="form-check-input mb-1"
              value={"oauth2" + label}
              checked={authMethod === "oauth2" + label}
              onChange={() => setAuthMethod("oauth2" + label)}
            />
            <label
              htmlFor={`oauth2_${label}`}
              style={{ color: "#020817", fontSize: "14px" }}
              className="form-check-label fw-500 d-flex align-items-center ms-2"
            >
              <ShieldIcon className="icon-sm me-1" style={{ width: "16px", marginBottom: "2px" }} />
              OAuth2 Authentication
            </label>
          </div>
        </div>
        <div className="form-text mb-3">Choose how to authenticate with the email provider</div> */}

        {/* {authMethod === "password" + label ? (
          <>
            {renderEmailInputConf(
              "Email Password",
              "email_password" + label,
              "Email Password",
              "Enter the password for this email address",
              !emailConfData["email_address" + label]
            )}
          </>
        ) : authMethod === "oauth2" + label ? (
          <> */}
        <div className="mb-4">
          {emailConfData["oauth2_config" + label] && !isError ? (
            <div
              onClick={() => {
                // handleUserAccess( ? "deactivate" : "activate");
              }}
              className={`mt-3 ${styles.actionButtonBig}`}
            >
              <ShieldIcon className="icon-sm me-1" style={{ width: "20px", color: "#4864dc" }} />
              <div className="d-flex flex-column gap-2">
                <div className="fw-500 mb-2">OAuth2 Setup Required</div>
                {/* <div className="font14 fw-normal" style={{ color: "#4864dc" }}>
                  Register app in Azure Active Directory
                </div> */}

                <button
                  onClick={() => setShowEmailAuth(label ? label : true)}
                  type="button"
                  className={styles["oauth-btn"]}
                >
                  <FiExternalLink className={styles["oauth-btn__icon"]} />
                  Setup OAuth Credentials
                </button>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
        {/* </>
        ) : (
          <></>
        )} */}
      </div>
    );
  };

  const renderEmailConfigOptions = (title, description, icon) => {
    let newTitle = String(title).replaceAll(" ", "_");
    let extraKey = title ? "Scrape" : "";

    return (
      <div>
        <div className="d-flex align-items-center gap-1 mb-4" style={{ lineHeight: "0.9" }}>
          {icon ?? <MailOpen className="me-2 mt-1" />}{" "}
          <div>
            <h4 className={`mb-0 pb-0 ${styles.ceaTitle}`}>{title ?? "Outgoing Email Account"}</h4>
            <div className="fontgray mt-0 pt-0">
              {description ?? "Configure an email account to send outgoing emails from the system"}
            </div>
          </div>
        </div>
        <div>
          <div className="mb-3">
            <label
              htmlFor={`uid${uniqueId}oauth2_${newTitle}`}
              className="form-label fw-500 font14 mb-1"
              style={{ color: "#020817" }}
            >
              Provider
            </label>
            <select
              id={`uid${uniqueId}oauth2_${newTitle}`}
              className="form-select"
              style={{ boxShadow: "unset", fontSize: "14px" }}
              value={title ? emailConfData.oauth2_configScrape : emailConfData.oauth2_config || ""}
              onChange={(e) => {
                if (!e.target.value) {
                  handleChangeConf(title ? "email_addressScrape" : "email_address", "");
                }
                handleChangeConf(title ? "oauth2_configScrape" : "oauth2_config", e.target.value);
              }}
            >
              <option value="">Select OAuth2 Configuration</option>
              <option value="google">Gmail / Google Workspace</option>
              <option value="microsoft">Office 365 Enterprise</option>
            </select>
            {errors["oauth2_config" + extraKey] && (
              <div className="text-danger font12">{errors["oauth2_config" + extraKey]}</div>
            )}
            {<div className="form-text mt-1">Choose your email provider for authentication</div>}
          </div>

          {renderEmailInputConf(
            "From Email Address",
            "email_address" + extraKey,
            "From Email Address",
            "Enter a single email address to use as the sender for outgoing emails",
            !emailConfData["oauth2_config" + extraKey],
          )}

          {renderEmailInputConfOptions(!!title)}
        </div>
        {emailConfData["email_address" + extraKey] ? (
          <div className="d-flex align-items-center justify-content-end gap-2">
            <div className="themeButtonoutline" onClick={() => setemailConfData({})}>
              <span class="material-symbols-outlined">close</span>
              cancel
            </div>
            {/* {authMethod === "oauth2" + extraKey || !emailConfData["email_password" + extraKey] ? (
              <></>
            ) : (
              <div className="themeButton" onClick={() => handleSaveConf(!!title)}>
                <span class="material-symbols-outlined">save</span>
                save
              </div>
            )} */}
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  };

  const renderOutGoingAccounts = () => {
    let accountsData = listIntegrationsData?.integrations?.filter(
      (item) => item.purpose != "Email to scrap rate confirmations",
    );

    return (
      <div className="border rounded p-3 my-3 mb-md-4 md-3">
        <div className="mb-4">
          <div className={`h5 ${styles.bodyHeaer} mb-1`}>Email Configuration</div>
          <div className="fontgray">
            Configure email accounts for sending outgoing emails and scraping rate confirmations. Also set up recipients
            for different types of communications.
          </div>
        </div>
        {accountsData?.length ? renderAvailableAuths() : renderEmailConfigOptions()}
      </div>
    );
  };

  const renderScrappingAccounts = () => {
    let accountsData = listIntegrationsData?.integrations?.filter(
      (item) => item.purpose == "Email to scrap rate confirmations",
    );
    return (
      <div className="border rounded p-3 my-3 mb-md-4 md-3">
        {accountsData?.length
          ? renderAvailableAuths("Connected Scraping Accounts", <MailCheck className="me-2 mt-2" />)
          : renderEmailConfigOptions(
              "Rate Confirmation Scraping Account",
              "Configure an email account to scrape rate confirmation emails",
              <MailCheck className="me-2 mt-2" />,
            )}
      </div>
    );
  };

  const renderTab1Data = () => {
    return (
      <div>
        {renderOutGoingAccounts()}
        {renderScrappingAccounts()}
        <div>
          {renderEmailInput(
            "Receive copy of vendor follow-up emails",
            "vendor_followup",
            "Receive copy of vendor follow-up emails",
            "Enter comma-separated email addresses to receive vendor follow-up emails",
          )}
          {renderEmailInput(
            "Copy of weekly work status & reminder emails",
            "work_status",
            "Copy of weekly work status & reminder emails",
            "Enter comma-separated email addresses to receive work status and reminder emails",
          )}
          {renderEmailInput(
            "Bench candidates calls and applications",
            "bench_candidates_updates",
            "Bench candidates calls and applications",
            "Enter comma-separated email addresses to receive bench candidate communications",
          )}
          {renderEmailInput(
            "Copy of on-boarding emails",
            "onboarding",
            "Copy of on-boarding emails",
            "Enter comma-separated email addresses to receive on-boarding email copies",
          )}
          {renderEmailInput(
            "Copy of HR Tickets",
            "hr_tickets",
            "Copy of HR Tickets",
            "Enter comma-separated email addresses to receive copies of HR tickets.",
          )}

          {renderEmailInput(
            "Copy of Invoicing emails",
            "invoicing_emails",
            "Copy of Invoicing emails",
            "Enter comma-separated email addresses to receive copies of Invoicing emails.",
          )}
        </div>
        <div className="d-flex mt-3">
          <div className="themeButton ms-auto" onClick={currentTab?.onSubmit}>
            <span class="material-symbols-outlined mb-1">save</span>
            Save Configuration
          </div>
        </div>
      </div>
    );
  };

  const renderTab2Data = () => {
    return (
      <div>
        <div className="card p-3 mb-3">
          <div className="mb-3">
            <div className={`d-flex align-items-center gap-2 pointer h4 mb-1 ${styles.bodyHeaer}`}>Company Logo</div>

            <div className="font12 fontgray">Upload your company logo (PNG, JPG, JPEG only, max 2MB)</div>
          </div>

          <div className="d-flex align-items-center gap-2">
            {logoPreviewURL ? (
              <div className="p-2 rounded rounded-3" style={{ background: "#e7e7ef" }}>
                <img
                  src={logoPreviewURL}
                  className="rounded"
                  alt="Company logo"
                  style={{ maxHeight: "80px", maxWidth: "80px" }}
                />{" "}
              </div>
            ) : (
              <></>
            )}
            <div className="w-100">
              {renderFileInput("Upload New Logo", "logo_file", "image/jpeg,image/jpg,image/png", false)}
              <div className="font12 my-1">Recommended size: 200x200px. Maximum file size: 2MB</div>
            </div>
            {logoLoader ? (
              <div>
                <div class="spinner-border m-1" style={{ width: "1.5rem", height: "1.5rem" }} role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>

        <div className="card p-3 mb-1">
          <div className="mb-3">
            <div className={`d-flex align-items-center gap-2 pointer h4 mb-1 ${styles.bodyHeaer}`}>
              Company Settings
            </div>
            <div className="font12 fontgray">Configure general company information and system settings.</div>
          </div>

          <div className="gridContainertwoView">
            {renderInput("Organization Name", "org_name", "Organization Name", false, true)}

            {renderInput("Address Line 1", "org_address", "Address Line 1")}
            {renderInput("Address Line 2", "org_address2", "Address Line 2")}
            {renderInput("ZIP Code", "org_zipcode", "ZIP Code")}
            {renderInput("City", "org_city", "City")}
            {renderInput("State", "org_state", "State")}
            {renderInput("Country", "org_country", "Country")}
            {renderInput("Phone Number", "phonenumber", "Phone Number")}
            {renderInput("Contact Email", "contact_email", "Contact Email")}
            {renderInput("Invoice Email", "invoice_email", "Invoice Email")}
            {renderInput("Preferred Organization Name", "preferred_org_name", "Preferred Organization Name")}
            {renderInput("Website", "org_website", "Website")}
          </div>
          <div className="d-flex mt-3">
            <div className="themeButton ms-auto" onClick={currentTab?.onSubmit}>
              <span class="material-symbols-outlined mb-1">save</span>
              Save Configuration
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabsArray = [
    {
      id: 1,
      title: "Email Configuration",
      bodyTitle: "Email Configuration",
      description:
        "Configure the email addresses to receive copies of different types of communications. Multiple email addresses can be added using commas (e.g., email1@example.com, email2@example.com).",
      renderData: () => renderTab1Data(),
      onSubmit: submitEmails,
    },
    {
      id: 2,
      title: "Settings",
      bodyTitle: "Company Settings",
      description: "Configure general company information and system settings.",
      renderData: () => renderTab2Data(),
      onSubmit: submitForm,
      showHeader: false,
    },
  ];

  const currentTab = tabsArray.find((tab) => tab.id === activeTab);

  const rendertabsData = () => (
    <div className={styles.tabsSection}>
      {tabsArray.map((card) => (
        <div
          key={card.id}
          className={`${styles.tabItem} ${activeTab === card.id ? styles.activeTab : ""} pointer`}
          onClick={() => {
            setActiveTab(card.id);
          }}
        >
          <div>{card.title}</div>
        </div>
      ))}
    </div>
  );

  const bodyHeader = () => (
    <div className="my-3">
      <div className={`d-flex align-items-center gap-2 pointer h4 ${styles.bodyHeaer}`}>
        {/* {currentTab.googleicon && <span className="material-symbols-outlined">{currentTab.googleicon}</span>}
        {currentTab.cssIcon && <span className={currentTab.cssIcon}></span>} */}
        <div>{currentTab.bodyTitle}</div>
      </div>
      <div className="font12 fontgray">{currentTab.description}</div>
    </div>
  );

  if (showEmailAuth) {
    return (
      <div className={styles.screen}>
        <div className={styles.container}>
          <div className={styles.card}>
            <EmailInput
              isscrape={showEmailAuth !== true}
              goBakc={() => setShowEmailAuth(false)}
              emailConfData={emailConfData}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-100 bg-white rounded p-3 p-md-4`}>
      {rendertabsData()}
      {currentTab.showHeader ? bodyHeader() : ""}
      <div className="sepline"></div>
      <div className={`mt-4`}>{currentTab.renderData()}</div>
      <ThemeLoader show={loading} />
      <Confirm
        deleteTitle="Okay"
        show={openConfModal}
        hideCancel
        result={() => {
          setopenConfModal(false);
        }}
        title="Sender Email Configuration"
        text="<b>Two-Factor Authentication must be disabled on this email account.</b>"
      />

      <Confirm
        deleteTitle="Okay"
        show={mailerrorModal}
        hideCancel
        result={() => {
          setMailErrorModal(false);
        }}
        title="Duplicate Email"
        text={mailerrorModal}
      />
    </div>
  );
}

export default CompanyDetails;
