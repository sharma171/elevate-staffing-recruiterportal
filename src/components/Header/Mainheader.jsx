import { useAuth } from "../../authContext";
import ElevateIcon from "./elevateIcon.svg";
import "./MainHeader.css";
import ProfileLogoComponent from "../../components/ProfileComponent";

import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import api from "../../networking/api";
import { useEffect, useState } from "react";

function toBase64Unicode(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

export function getLogoURL(raw) {
  return new Promise(function (resolve) {
    if (!raw) return resolve("");

    if (raw.startsWith("data:")) return resolve(raw);

    if (/<svg[\s>]/i.test(raw)) {
      return resolve("data:image/svg+xml;base64," + toBase64Unicode(raw));
    }

    if (/^(https?:)?\/\//i.test(raw)) {
      if (/\.svg(\?|$)/i.test(raw)) {
        fetch(raw)
          .then(function (r) {
            return r.text();
          })
          .then(function (svg) {
            resolve("data:image/svg+xml;base64," + toBase64Unicode(svg));
          })
          .catch(function () {
            resolve(raw);
          });
      } else {
        resolve(raw);
      }
      return;
    }

    if (/^PHN2Zy/i.test(raw.trim())) {
      return resolve("data:image/svg+xml;base64," + raw.trim());
    }

    resolve("data:image/png;base64," + raw.trim());
  });
}

const Mainheader = () => {
  const { user, organisation } = useAuth();
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState({});
  const [logoURL, setLogoURL] = useState("");

  let isEmployee = String(localStorage.getItem("userType")).toLowerCase() === "employee";

  let logoURLORG = organisation?.org_data[0]?.org_logo_file;

  useEffect(() => {
    if (logoURLORG && !companyData?.org_logo_file) {
      getLogoURL(logoURLORG)
        .then(function (finalUrl) {
          setLogoURL(finalUrl);
        })
        .catch((err) => {});
    }
  }, [logoURLORG]);

  useEffect(() => {
    if (!Object.keys(companyData).length) {
      getCompanyDetails();
    }
  }, [user?.email]);

  useEffect(() => {
    const handler = () => {
      getCompanyDetails();
    };
    window.addEventListener("refreshCompanyData", handler);
    return () => window.removeEventListener("refreshCompanyData", handler);
  }, [user?.email]);

  useEffect(() => {
    if (companyData?.org_logo_file) {
      getLogoURL(companyData.org_logo_file).then(function (finalUrl) {
        setLogoURL(finalUrl);
      });
    }
  }, [companyData]);

  const getCompanyDetails = () => {
    if (!user?.email) return;
    if (isEmployee) return;

    let payload = {
      action: "org_data",
      admin_email: user?.email,
    };

    api
      .CompanyDetails(payload)
      .then((res) => {
        if (res?.data?.[0]) {
          setCompanyData(res.data[0]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      {organisation && user && (
        <div className="MainHeader" id="siteMainHeader">
          <div className="d-flex align-items-center justify-content-between gap-2">
            <div className="mainHRow">
              {logoURL ? (
                <img
                  src={logoURL}
                  alt={organisation?.org_data?.[0]?.preferred_org_name}
                  style={{
                    maxWidth: "46px",
                    maxHeight: "46px",
                    borderRadius: "6px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <></>
              )}

              <div className="brand justify-content-center">
                <h1 className="Company pointer" onClick={() => navigate("/")}>
                  {organisation?.org_data?.[0]?.preferred_org_name || ""}
                </h1>
                {organisation?.org_data?.[0]?.org_address ? (
                  <div className="addressRow recruiterOrg gap-2 d-flex align-items-center w-100">
                    <MapPin size={14} style={{ flexShrink: 0 }} />
                    <span className="addressText w-100 text-truncate">
                      {organisation?.org_data?.[0]?.org_address || ""}
                    </span>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>

            <div className="ms-auto logo flex-wrap nowrap text-white d-flex align-items-center gap-2 MainHeaderPowerBy">
              <span className="powerByText">Powered by</span>
              <img src={ElevateIcon} alt="" className="icon d-none d-sm-block" style={{ height: 30 }} />
              <span className="company_name">Elevate Staffing AI</span>
            </div>

            <div className="ms-2 d-md-block d-none">
              <ProfileLogoComponent />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Mainheader;
