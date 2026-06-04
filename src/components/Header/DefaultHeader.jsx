import { useEffect, useState } from "react";
import ElevateIcon from "./elevateIcon.svg";
import "./MainHeader.css";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

function toBase64Unicode(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function getLogoURL(raw) {
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

const DefaultHeader = ({ address, orgData }) => {
  const navigate = useNavigate();
  const [logoURL, setLogoURL] = useState("");

  let organisation = orgData.org_data?.[0] || {};

  useEffect(() => {
    if (organisation?.org_logo_file) {
      getLogoURL(organisation.org_logo_file).then(function (finalUrl) {
        setLogoURL(finalUrl);
      });
    }
  }, [organisation]);

  return (
    <>
      <div className="MainHeader" id="siteMainHeader">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <div className="mainHRow">
            {organisation?.org_logo_file ? (
              <img
                src={logoURL}
                alt={organisation?.preferred_org_name}
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
                {organisation?.preferred_org_name || ""}
              </h1>
              {organisation?.org_address ? (
                <div className="addressRow recruiterOrg gap-2 d-flex align-items-center w-100">
                  <MapPin size={14} style={{ flexShrink: 0 }} />
                  <span className="addressText w-100 text-truncate">{organisation?.org_address || ""}</span>
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
        </div>
      </div>
    </>
  );
};

export default DefaultHeader;
