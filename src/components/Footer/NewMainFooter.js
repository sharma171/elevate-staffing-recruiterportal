import { useState } from "react";
import { Facebook, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import Confirm from "../Confirm";
import ContactUsForm from "../ContactUsForm";
import RequestDemoForm from "../RequestDemoForm";
import ElevateIcon from "./elevateIcon.svg";
import styles from "./Nesmainfooter.module.css";

function MainFooter() {
  const [activeForm, setActiveForm] = useState(null);
  const [popupOverlay, setPopupOverlay] = useState(null);

  return (
    <>
      <div className="RecruiterHome">
        <div className={styles.footerMain}>
          <footer className={styles.footer}>
            <div className={styles.footersection}>
              {/* <div className="logo">
                  <div className="logo-icon footer" style={{ height: "100px" }}>
                    <img
                      src={ElevateIcon}
                      alt="Elevate Staffing.ai"
                      className="icon d-none d-sm-block"
                      style={{ maxHeight: 80 }}
                    />
                  </div>
                </div> */}

              <div className="h5 fw-bold text-white mb-3">ElevateStaffing.ai</div>

              <div className="mb-3">The All-In-One AI Platform for Modern Staffing Teams</div>

              <div className="mb-3">© 2025 ElevateStaffing.ai. All rights reserved.</div>

              <div className="mt-2 gap-3 d-flex align-items-center ">
                <a
                  target="_blank"
                  href="https://www.linkedin.com/company/elevatestaffing-ai/about/?viewAsMember=true"
                  className="linkedinSimpleSocialButton"
                  style={{ color: "rgb(40, 87, 218)", padding: "8px" }}
                >
                  <Linkedin size={18} />
                </a>
                <a
                  target="_blank"
                  style={{ padding: "8px" }}
                  href="https://www.youtube.com/@ElevatestaffingAI"
                  className="youTubeSimpleSocialButton mt-1"
                >
                  <Youtube style={{ color: "red" }} size={18} />
                </a>
                <a
                  target="_blank"
                  style={{ padding: "8px" }}
                  href="https://www.instagram.com/elevatestaffing.ai/?hl=en"
                  className="youTubeSimpleSocialButton mt-1"
                >
                  <div className="instagramISimpleSocialButton" style={{ maxHeight: "18px", maxWidth: "18px" }} />
                </a>
                <a
                  target="_blank"
                  style={{ padding: "8px" }}
                  href="https://www.facebook.com/profile.php?id=61582449860561"
                  className="linkedinSimpleSocialButton mt-1"
                >
                  <Facebook style={{ color: "#2F88FF" }} size={18} />
                </a>
              </div>
            </div>
            <div className={styles.footersection}>
              <div className="h5 fw-bold text-white mb-3">Products</div>
              <ul className="footer-links">
                <li>
                  <a href="https://elevatestaffing.ai/login" target="_blank">
                    Elevate Staffing
                  </a>
                </li>
                <li>
                  <a href="https://recruit.elevatestaffing.ai/" target="_blank">
                    Elevate Recruit
                  </a>
                </li>
                <li>
                  <Link to="/products/#ElevateStaffingFeatures">Features</Link>
                </li>
                {/* <li>
                  <Link to="/pricing" onClick={() => window.scrollTo(0, 0)}>
                    Pricing
                  </Link>
                </li> */}
              </ul>
            </div>
            <div className={styles.footersection}>
              <div className="h5 fw-bold text-white mb-3">Company</div>
              <ul className="footer-links">
                <li>
                  <Link to="/#">Home</Link>
                </li>

                <li>
                  <a href="#" onClick={() => setActiveForm("contact")}>
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" onClick={() => setActiveForm("demo")}>
                    Request Demo
                  </a>
                </li>
                <li>
                  <a href="https://blogs.elevatestaffing.ai/" target="_blank">
                    Blogs
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.footersection}>
              <div className="h5 fw-bold text-white mb-3">Legal</div>
              <ul className="footer-links">
                <li>
                  <Link to="/privacypolicy">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/termsofservice">Terms of Service</Link>
                </li>
                <li>
                  <Link to="/cookiespolicy">Cookie Policy</Link>
                </li>
                <li>
                  <Link to="/gdprpage">GDPR Compliances</Link>
                </li>
              </ul>
            </div>
          </footer>

          <div className="p-3 text-center">
            <div>
              Contact:{" "}
              <a className="fw-semibold text-white" href="mailto:contact@elevatestaffing.ai">
                contact@elevatestaffing.ai
              </a>
            </div>
          </div>
        </div>
        <ContactUsForm
          isVisible={activeForm === "contact"}
          onClose={() => setActiveForm(null)}
          onSuccess={setPopupOverlay}
        />

        <RequestDemoForm
          isVisible={activeForm === "demo"}
          onClose={() => setActiveForm(null)}
          onSuccess={setPopupOverlay}
        />
      </div>

      <Confirm
        hideCancel
        show={popupOverlay}
        result={() => setPopupOverlay(null)}
        title="Form Status"
        text={`
          <div>
            <div><b>${popupOverlay?.message}</b></div>
            <div>${popupOverlay?.subhead}</div>
          </div>
        `}
        deleteTitle={popupOverlay?.button}
        icon="task_alt"
      />
    </>
  );
}

export default MainFooter;
