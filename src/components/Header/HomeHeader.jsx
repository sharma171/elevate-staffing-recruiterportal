import { useEffect, useRef, useState } from "react";
import { ReactComponent as LogoIcon } from "../../assets/images/elevateStaffinglogo.svg";
import { Popover, Whisper } from "rsuite";
import { useLocation, useNavigate } from "react-router-dom";

function HomeHeader({ contactUsForm: contactUsFormProps }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(null);

  const location = useLocation();

  useEffect(() => {
    setIsMaintenance(window.maintenance_mode);
    const handler = (e) => {
      setIsMaintenance(e.detail || window.maintenance_mode);
    };
    window.addEventListener("maintenance-change", handler);
    return () => {
      window.removeEventListener("maintenance-change", handler);
    };
  }, [location]);

  const whisperRef = useRef();
  const navigate = useNavigate();

  const contactUsForm = (_, isContact) => {
    contactUsFormProps();
    let link = "/requestademo";
    if (isContact) {
      link += "?contact=true";
    }
    navigate(link);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (whisperRef.current?.close) {
        whisperRef.current.close();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  return (
    <>
      <header>
        <div class="container header-container">
          <div class="logo">
            <div class="logo-icon" onClick={() => navigate("/")}>
              <LogoIcon />
            </div>
          </div>
          <nav>
            <ul>
              <li className="mobileH">
                <a href="/#features">Features</a>
              </li>
              <li className="mobileH">
                <a href="/#why-us">Why Choose Us</a>
              </li>
              <li className="mobileH">
                <a href="/#use-cases">Use Cases</a>
              </li>
              <li className="mobileH">
                <a href="/#testimonials">Testimonials</a>
              </li>
              <li className="mobileH">
                <a href="/#pricing">Pricing</a>
              </li>
              <li className="mobileH">
                <a class="btn btn-outline" onClick={() => contactUsForm("", true)}>
                  Learn More
                </a>
              </li>
              <li className="mobileH">
                <Whisper
                  ref={whisperRef}
                  placement="autoVertical"
                  trigger="click"
                  speaker={
                    <Popover style={{ padding: "0px", boxShadow: "unset" }}>
                      <div class="list-group p-0 m-0" id="list-tab" role="tablist">
                        <a
                          onClick={() => navigate(isMaintenance ? "/maintenance" : "/employeelogin")}
                          style={{
                            "--bs-list-group-active-bg": "#073276",
                            "--bs-list-group-active-border-color": "#073276",
                          }}
                          className="list-group-item list-group-item-action"
                          id="list-home-list"
                          data-bs-toggle="list"
                          href="/employeelogin"
                          role="tab"
                          aria-controls="list-home"
                        >
                          Employee Login
                        </a>
                        <a
                          onClick={() => navigate(isMaintenance ? "/maintenance" : "/login")}
                          style={{
                            "--bs-list-group-active-bg": "#073276",
                            "--bs-list-group-active-border-color": "#073276",
                          }}
                          className="list-group-item list-group-item-action"
                          id="list-profile-list"
                          data-bs-toggle="list"
                          href="/login"
                          role="tab"
                          aria-controls="list-profile"
                        >
                          Employer Login
                        </a>
                      </div>
                    </Popover>
                  }
                >
                  <a className="btn login-btn">Login</a>
                </Whisper>
              </li>

              <li className="mobileH">
                <a onClick={contactUsForm} class="btn btn-primary">
                  Get Started
                </a>
              </li>
              <input
                type="checkbox"
                id="menu-toggle"
                class="menu-toggle"
                onChange={(e) => setMobileMenu(e.target.checked)}
              />
              <label for="menu-toggle" class="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </label>
            </ul>
          </nav>
        </div>
      </header>
      {mobileMenu && (
        <>
          <nav class="hamb-menu open" style={{ position: "fixed" }}>
            <ul>
              <li>
                <a href="/#features">Features</a>
              </li>
              <li>
                <a href="/#why-us">Why Choose Us</a>
              </li>
              <li>
                <a href="/#use-cases">Use Cases</a>
              </li>
              <li className="mobileH">
                <a href="/#pricing">Pricing</a>
              </li>
              <li>
                <a href="/#testimonials">Testimonials</a>
              </li>
              <li className="mobileH">
                <a class="btn btn-outline" onClick={contactUsForm}>
                  Learn More
                </a>
              </li>
              <li>
                <Whisper
                  ref={whisperRef}
                  placement="autoVertical"
                  trigger="click"
                  speaker={
                    <Popover style={{ padding: "0px", boxShadow: "unset" }}>
                      <div class="list-group p-0 m-0" id="list-tab" role="tablist">
                        <a
                          onClick={() => navigate("/employeelogin")}
                          style={{
                            "--bs-list-group-active-bg": "#073276",
                            "--bs-list-group-active-border-color": "#073276",
                          }}
                          className="list-group-item list-group-item-action"
                          id="list-home-list"
                          data-bs-toggle="list"
                          href="/employeelogin"
                          role="tab"
                          aria-controls="list-home"
                        >
                          Employee Login
                        </a>
                        <a
                          onClick={() => navigate("/login")}
                          style={{
                            "--bs-list-group-active-bg": "#073276",
                            "--bs-list-group-active-border-color": "#073276",
                          }}
                          className="list-group-item list-group-item-action"
                          id="list-profile-list"
                          data-bs-toggle="list"
                          href="/login"
                          role="tab"
                          aria-controls="list-profile"
                        >
                          Employer Login
                        </a>
                      </div>
                    </Popover>
                  }
                >
                  <a className="btn login-btn">Login</a>
                </Whisper>
              </li>
              <li>
                <a onClick={contactUsForm} class="btn btn-primary">
                  Get Started
                </a>
              </li>
            </ul>
          </nav>
        </>
      )}
    </>
  );
}

export default HomeHeader;
