import React, { useEffect, useState } from "react";
import Dashnav from "../../components/dashnav";
import "./roleRecruiter.css";
import { useGlobalContext } from "../../globalContext";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";

const RoleRecruiterAnalysis = () => {
  const { selectedEmail, setSelectedEmail } = useGlobalContext();
  console.log(selectedEmail, "selectedEmail");

  const { user } = useAuth();
  const navigate = useNavigate();
  const [recruitersBList, setBRecruitersList] = useState([]); // State for recruiters list
  const [recruiterBFilter, setBRecruiterFilter] = useState("");
  const [recruiterAliasName, setRecruiterAliasName] = useState(null);
  const [data, setData] = useState(null); // State to store API response
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [openDetails, setOPenDetails] = useState(false);
  let storedUser = JSON.parse(localStorage.getItem("user"));

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  useEffect(() => {
    // if (!recruiterAliasName) return;
    // console.log("recruiterAliasName selected:", recruiterAliasName);
    console.log("storedUser: ", storedUser);

    const fetchRecruiterAnalysis = async () => {
      try {
        setLoading(true);
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
              email: storedUser.email, // Pass recruiterAliasName here
            }),
          }
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

    fetchRecruiterAnalysis();
  }, []); // Trigger re-fetch when recruiterAliasName changes
  // Run this effect when email or recruiterAliasName changes

  function goToTotalAssignedCandidate(activeTab) {
    console.log(activeTab, "activeTab");
    navigate(`/detailsRecruiter?activeTab=${activeTab}`, { state: selectedEmail });
    setOPenDetails(true);
  }

  {
    return (
      <div>
        <div className="main-dash row-flex">
          <section className="w-100">
            <div>
              <div className="top-section row-flex">
                {/* <img  alt="" /> */}
                <svg width="35" height="36" viewBox="0 0 35 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_747_579)">
                    <path
                      d="M15.8562 0.312134C15.5558 0.313335 15.3126 0.55653 15.3114 0.856873V3.04758H14.2166C13.7308 3.04871 13.4875 3.63545 13.83 3.98004L17.1112 7.26236C17.325 7.47726 17.6739 7.47726 17.8877 7.26236L21.17 3.98004C21.5129 3.63509 21.2687 3.04777 20.7823 3.04758H19.6886V0.856873C19.6874 0.55653 19.4442 0.313335 19.1438 0.312134H15.8562ZM24.7023 7.88507C24.567 7.89216 24.4391 7.94926 24.3434 8.04529L23.1642 9.22342C22.9493 9.43721 22.9493 9.78508 23.1642 9.99887C23.378 10.2138 23.7259 10.2138 23.9397 9.99887L25.1178 8.81967C25.332 8.606 25.332 8.25896 25.1178 8.04529C25.0083 7.93536 24.8573 7.87711 24.7023 7.88507ZM10.2753 7.8872C10.1406 7.89398 10.0132 7.95028 9.91745 8.04528C9.70322 8.25896 9.70322 8.60599 9.91745 8.81967L11.0967 9.99887C11.31 10.211 11.6545 10.211 11.8678 9.99887C12.0828 9.78507 12.0828 9.43721 11.8678 9.22342L10.6886 8.04528C10.5793 7.93671 10.4292 7.8793 10.2753 7.8872ZM17.4989 8.51312C15.6925 8.51312 14.2166 9.98962 14.2166 11.7954C14.2166 12.8381 14.7092 13.7706 15.4727 14.3728C13.4543 15.181 12.0291 17.1598 12.0291 19.473V21.7268C9.44331 22.3566 7.3797 23.393 6.03058 24.7025C5.13846 25.5685 4.56609 26.589 4.41346 27.6537H3.82599C3.52395 27.655 3.28007 27.9007 3.28125 28.2028C3.28242 28.5031 3.52562 28.7463 3.82599 28.7475H4.40705C4.44742 29.0517 4.52344 29.3567 4.63776 29.6597C5.29662 31.4056 7.01129 32.795 9.27979 33.7698C11.5483 34.7446 14.4019 35.3088 17.4712 35.3121C20.5404 35.3154 23.4039 34.7555 25.6796 33.7858C27.9553 32.8161 29.6771 31.435 30.3494 29.6917C30.4704 29.378 30.5504 29.0628 30.5919 28.7475H31.174C31.4744 28.7463 31.7176 28.5031 31.7188 28.2028C31.72 27.9007 31.4761 27.6549 31.174 27.6537H30.5844C30.4325 26.6004 29.8706 25.5898 28.994 24.7303C27.6463 23.409 25.574 22.3623 22.9709 21.7278V19.4731C22.9709 17.1598 21.5456 15.1811 19.5273 14.3728C20.2908 13.7706 20.7823 12.838 20.7823 11.7954C20.7823 9.98962 19.3054 8.51312 17.4989 8.51312ZM9.30008 11.2507C8.99637 11.2495 8.74988 11.496 8.75107 11.7997C8.75228 12.1017 8.99804 12.3456 9.30008 12.3444H10.9674C11.2695 12.3457 11.5152 12.1017 11.5164 11.7997C11.5176 11.496 11.2711 11.2495 10.9674 11.2507H9.30008ZM24.0646 11.2507C23.7626 11.2519 23.5187 11.4977 23.5199 11.7997C23.521 12.1001 23.7643 12.3433 24.0646 12.3444H25.7352C26.036 12.3438 26.2798 12.1005 26.281 11.7997C26.2822 11.4973 26.0376 11.2513 25.7352 11.2507H24.0646ZM23.5231 13.4393C23.3878 13.4464 23.2599 13.5035 23.1642 13.5995C22.9493 13.8133 22.9493 14.1611 23.1642 14.3749L24.3434 15.5541C24.5571 15.7684 24.9041 15.7684 25.1178 15.5541C25.3328 15.3403 25.3328 14.9925 25.1178 14.7787L23.9397 13.5995C23.8299 13.4893 23.6784 13.431 23.5231 13.4393ZM11.4534 13.4414C11.3191 13.4484 11.1921 13.5047 11.0967 13.5995L9.91745 14.7787C9.70251 14.9925 9.70251 15.3403 9.91745 15.5541C10.1308 15.7662 10.4753 15.7662 10.6886 15.5541L11.8678 14.3749C12.0828 14.1611 12.0828 13.8133 11.8678 13.5995C11.7582 13.4906 11.6077 13.4332 11.4534 13.4414ZM17.4989 15.0778C19.9326 15.0778 21.8761 17.0261 21.8761 19.4731V22.2192C21.8761 22.5314 21.6443 22.765 21.3313 22.765C21.0184 22.765 20.7823 22.5314 20.7823 22.2192V19.9975C20.7833 19.6311 20.4797 19.4519 20.2376 19.4528C19.8746 19.4555 19.6878 19.7465 19.6886 19.9975V26.8366C19.6886 27.3004 19.3339 27.6559 18.8693 27.6559C18.4048 27.6559 18.0447 27.2846 18.0447 26.8366V24.3757C18.0289 23.6626 16.9658 23.6626 16.9499 24.3757V26.8366C16.9499 27.2993 16.5952 27.6559 16.1307 27.6559C15.6662 27.6559 15.3114 27.3004 15.3114 26.8366V19.9975C15.3114 19.7724 15.141 19.4547 14.7624 19.4528C14.3953 19.4551 14.2187 19.7476 14.2166 19.9975V22.2192C14.2166 22.5314 13.9806 22.765 13.6676 22.765C13.3547 22.765 13.1229 22.5314 13.1229 22.2192V19.4731C13.1229 17.0261 15.0653 15.0778 17.4989 15.0778ZM12.1477 22.8269C12.3909 23.4293 12.9821 23.8587 13.6676 23.8587C13.8597 23.8587 14.0445 23.8244 14.2166 23.7626V24.6395C12.5111 24.9252 11.1179 25.4135 10.1439 26.0665C9.60658 26.4268 9.18943 26.8435 8.94867 27.3387C8.89933 27.4401 8.85934 27.5458 8.82798 27.6537H8.19779C7.89408 27.6525 7.64759 27.8991 7.64878 28.2028C7.64998 28.5048 7.89575 28.7487 8.19779 28.7475L8.82584 28.7486C8.8455 28.8167 8.86894 28.8834 8.89634 28.9494C9.33465 30.006 10.4994 30.7052 12.0088 31.2181C13.3884 31.6869 15.0994 31.9725 16.9531 32.0202V32.5778C16.9531 33.3071 18.0469 33.3071 18.0469 32.5778V32.0202C19.8849 31.973 21.5838 31.692 22.9581 31.2298C24.4733 30.7202 25.6404 30.0224 26.0909 28.9697C26.1221 28.8966 26.1481 28.8225 26.1699 28.7475H26.8012C27.1032 28.7487 27.349 28.5048 27.3502 28.2028C27.3514 27.8991 27.1049 27.6526 26.8012 27.6537H26.1699C26.1407 27.5529 26.1049 27.4542 26.0599 27.3589C25.8247 26.8618 25.4142 26.4455 24.8807 26.0836C23.906 25.4225 22.5039 24.9269 20.7834 24.6385V23.7626C20.9555 23.8244 21.1403 23.8587 21.3324 23.8587C22.0172 23.8587 22.6086 23.4304 22.8523 22.8291C25.2456 23.4337 27.1031 24.405 28.2303 25.51C28.9375 26.2034 29.3652 26.918 29.5013 27.6537H28.9822C28.6802 27.6549 28.4363 27.9007 28.4375 28.2028C28.4387 28.5031 28.6819 28.7463 28.9822 28.7475H29.4917C29.4551 28.9307 29.3999 29.1152 29.3283 29.3008C28.8169 30.6268 27.361 31.8818 25.2513 32.7807C23.1416 33.6796 20.4104 34.2205 17.4754 34.2173C14.5404 34.2142 11.8144 33.668 9.71238 32.7647C7.61034 31.8614 6.16351 30.6021 5.66315 29.2762C5.59622 29.0989 5.5454 28.9226 5.51041 28.7475H6.01349C6.31595 28.7492 6.5624 28.5052 6.56357 28.2028C6.56478 27.8986 6.31762 27.652 6.01349 27.6537H5.5008C5.63857 26.9108 6.0726 26.1892 6.79322 25.4897C7.9231 24.393 9.77096 23.4278 12.1477 22.8269ZM14.2166 25.7482V26.8366C14.2166 27.8877 15.0794 28.7496 16.1307 28.7496C16.6719 28.7496 17.1494 28.5372 17.4989 28.1718C17.8485 28.5371 18.3281 28.7496 18.8693 28.7496C19.9206 28.7496 20.7823 27.8877 20.7823 26.8366V25.7514C22.3095 26.0281 23.5221 26.4823 24.2665 26.9872C24.5971 27.2115 24.8291 27.4427 24.9725 27.6537H24.6137C24.3116 27.655 24.0677 27.9007 24.0689 28.2028C24.0701 28.5031 24.3133 28.7463 24.6137 28.7475H24.9693C24.63 29.2327 23.807 29.7904 22.6109 30.1927C21.377 30.6076 19.7767 30.8664 18.0469 30.9147V30.3903C18.0469 29.6609 16.9531 29.6609 16.9531 30.3903V30.9158C15.2079 30.8677 13.5983 30.6059 12.3602 30.1852C11.1806 29.7843 10.368 29.2288 10.0296 28.7475H10.3864C10.6867 28.7463 10.9299 28.5031 10.9311 28.2028C10.9323 27.9007 10.6884 27.6549 10.3864 27.6537H10.0296C10.1754 27.4391 10.4133 27.2038 10.7538 26.9755C11.5002 26.475 12.7028 26.0231 14.2166 25.7482Z"
                      fill="#15649C"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_747_579">
                      <rect width="35" height="35" fill="white" transform="translate(0 0.312134)" />
                    </clipPath>
                  </defs>
                </svg>

                {user?.user_role === "recruiter" ? (
                  <p className="title-left">My Assigned Candidates</p>
                ) : (
                  <p className="title-left">Recruiter Analysis</p>
                )}
                <button className="profile-button-right">
                  <img alt="" className="profile" />
                  Your Profile
                </button>
              </div>

              <div className="grid">
                <div className="grid-insider-one" onClick={() => goToTotalAssignedCandidate("tab2")}>
                  <div>
                    <div className="total-assig-one">
                      Total Assigned <br></br>Candidates
                    </div>
                    <div className="row-flex-data">
                      <div className="number-item-one">{data?.summary?.total_assigned_candidates ?? 0}</div>
                      <div className="all-time-one">/ All Time</div>
                    </div>
                  </div>

                  <div className="side-icon-one">
                    <svg width="33" height="25" viewBox="0 0 33 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        opacity="0.587821"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M7.22583 6.15914C7.22583 9.10466 9.61364 11.4925 12.5592 11.4925C15.5047 11.4925 17.8925 9.10466 17.8925 6.15914C17.8925 3.21362 15.5047 0.825806 12.5592 0.825806C9.61364 0.825806 7.22583 3.21362 7.22583 6.15914ZM20.5592 11.4925C20.5592 13.7016 22.35 15.4925 24.5592 15.4925C26.7683 15.4925 28.5592 13.7016 28.5592 11.4925C28.5592 9.28333 26.7683 7.49247 24.5592 7.49247C22.35 7.49247 20.5592 9.28333 20.5592 11.4925Z"
                        fill="#8280FF"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12.5369 14.1592C6.24163 14.1592 1.07676 17.3945 0.559951 23.7581C0.5318 24.1048 1.1947 24.8258 1.52908 24.8258H23.5547C24.5563 24.8258 24.5719 24.0198 24.5563 23.7592C24.1656 17.2168 18.9207 14.1592 12.5369 14.1592ZM31.8337 24.8258L26.6924 24.8258C26.6924 21.8246 25.7008 19.055 24.0273 16.8267C28.5694 16.8763 32.278 19.1727 32.5571 24.0258C32.5683 24.2213 32.5571 24.8258 31.8337 24.8258Z"
                        fill="#8280FF"
                      />
                    </svg>
                  </div>
                </div>

                <div className="grid-insider-two" onClick={() => goToTotalAssignedCandidate("tab3")}>
                  <div>
                    <div className="total-assig-two">
                      Submissions by <br></br>Type
                    </div>
                    <div className="row-flex-data">
                      <div className="number-item-two">{data?.summary?.submissions_by_type_summary ?? 0}</div>
                      <div className="all-time-two">/ All Time</div>
                    </div>
                  </div>

                  <div className="side-icon-two">
                    <svg width="31" height="35" viewBox="0 0 31 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M0.960205 12.1422L13.8607 19.5903C13.9996 19.6705 14.1453 19.7285 14.2935 19.7652V34.2105L1.88027 26.8643C1.30999 26.5268 0.960205 25.9133 0.960205 25.2507V12.1422ZM30.9602 11.9442V25.2507C30.9602 25.9133 30.6104 26.5268 30.0401 26.8643L17.6269 34.2105V19.6387C17.6571 19.6236 17.6871 19.6074 17.7168 19.5903L30.9602 11.9442Z"
                        fill="#FEC53D"
                      />
                      <path
                        opacity="0.499209"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M1.36548 8.52723C1.52305 8.32824 1.72194 8.16007 1.95382 8.03657L15.0788 1.04591C15.6298 0.752439 16.2907 0.752439 16.8417 1.04591L29.9667 8.03657C30.1454 8.13177 30.3046 8.25352 30.4403 8.39546L16.0501 16.7036C15.9555 16.7583 15.8683 16.8208 15.7888 16.8898C15.7093 16.8208 15.622 16.7583 15.5274 16.7036L1.36548 8.52723Z"
                        fill="#FEC53D"
                      />
                    </svg>
                  </div>
                </div>

                <div className="grid-insider-three" onClick={() => goToTotalAssignedCandidate("tab4")}>
                  <div>
                    {" "}
                    <div className="total-assig-three">
                      Total Interview Tech <br></br>Screenings
                    </div>
                    <div className="row-flex-data">
                      <div className="number-item-three">{data?.summary?.total_interview_tech_screenings ?? 0}</div>
                      <div className="all-time-three">/ All Time</div>
                    </div>
                  </div>
                  <div className="side-icon-three">
                    <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M3.87967 25.7147H27.213C28.0721 25.7147 28.7686 26.4111 28.7686 27.2703C28.7686 28.1294 28.0721 28.8258 27.213 28.8258H2.32411C1.465 28.8258 0.768555 28.1294 0.768555 27.2703V2.38136C0.768555 1.52225 1.465 0.825806 2.32411 0.825806C3.18322 0.825806 3.87967 1.52225 3.87967 2.38136V25.7147Z"
                        fill="#4AD991"
                      />
                      <path
                        opacity="0.5"
                        d="M9.68112 19.0008C9.09354 19.6275 8.10913 19.6593 7.48237 19.0717C6.85562 18.4841 6.82387 17.4997 7.41145 16.873L13.2448 10.6507C13.813 10.0446 14.7573 9.99203 15.3894 10.5314L19.9934 14.4601L25.992 6.86187C26.5244 6.18757 27.5025 6.07249 28.1768 6.60483C28.8511 7.13717 28.9662 8.11535 28.4339 8.78965L21.4339 17.6563C20.8871 18.3489 19.8744 18.4485 19.2032 17.8757L14.4991 13.8616L9.68112 19.0008Z"
                        fill="#4AD991"
                      />
                    </svg>
                  </div>
                </div>

                <div className="grid-insider-four" onClick={() => goToTotalAssignedCandidate("tab1")}>
                  <div>
                    <div className="total-assig-four">
                      Candidates with zero <br></br>Submissions
                    </div>
                    <div className="row-flex-data">
                      <div className="number-item-four">
                        {data?.summary?.candidates_with_zero_submissions_last_24_hours ?? 0}
                      </div>
                      <div className="all-time-four">/ Last 24 Hours</div>
                    </div>
                  </div>
                  <div className="side-icon-four">
                    <svg width="28" height="31" viewBox="0 0 28 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        opacity="0.78"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12.6312 9.80882C12.6512 9.54832 12.8684 9.34717 13.1297 9.34717H13.5475C13.8044 9.34717 14.0195 9.54182 14.045 9.79742L14.6667 16.0138L19.0814 18.5365C19.2372 18.6256 19.3333 18.7912 19.3333 18.9707V19.3592C19.3333 19.6889 19.0199 19.9283 18.7018 19.8416L12.3987 18.1226C12.1673 18.0595 12.0133 17.841 12.0317 17.6018L12.6312 9.80882Z"
                        fill="#FF9066"
                      />
                      <path
                        opacity="0.901274"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M6.72176 0.984404C6.45765 0.669655 5.94771 0.790125 5.85238 1.18979L4.21891 8.03793C4.14123 8.36358 4.39931 8.67208 4.73356 8.65313L11.7783 8.25392C12.1892 8.23063 12.3976 7.74861 12.133 7.43333L10.3316 5.28648C11.4965 4.88844 12.7317 4.68053 14 4.68053C20.2592 4.68053 25.3333 9.75464 25.3333 16.0139C25.3333 22.2731 20.2592 27.3472 14 27.3472C7.74077 27.3472 2.66667 22.2731 2.66667 16.0139C2.66667 14.9631 2.80896 13.934 3.08641 12.9448L0.518845 12.2246C0.180793 13.4298 0 14.7007 0 16.0139C0 23.7459 6.26801 30.0139 14 30.0139C21.732 30.0139 28 23.7459 28 16.0139C28 8.28188 21.732 2.01387 14 2.01387C12.0551 2.01387 10.2029 2.41044 8.51973 3.12714L6.72176 0.984404Z"
                        fill="#FF9066"
                      />
                    </svg>
                  </div>
                </div>

                <div className="grid-insider-five" onClick={() => goToTotalAssignedCandidate("tab5")}>
                  <div>
                    <div className="total-assig-five">Total Rate Confirmations</div>
                    <div className="row-flex-data">
                      <div className="number-item-five">{data?.summary?.total_rate_confirmations ?? 0}</div>
                      <div className="all-time-five">/ All Time</div>
                    </div>
                  </div>
                  <div className="side-icon-five">
                    <svg width="31" height="34" viewBox="0 0 31 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M0.960205 11.6636L13.8607 19.1117C13.9996 19.1919 14.1453 19.2499 14.2935 19.2866V33.7319L1.88027 26.3857C1.30999 26.0482 0.960205 25.4347 0.960205 24.7721V11.6636ZM30.9602 11.4656V24.7721C30.9602 25.4347 30.6104 26.0482 30.0401 26.3857L17.6269 33.7319V19.1601C17.6571 19.145 17.6871 19.1289 17.7168 19.1117L30.9602 11.4656Z"
                        fill="#97FE3D"
                      />
                      <path
                        opacity="0.499209"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M1.36548 8.04859C1.52305 7.84961 1.72194 7.68143 1.95382 7.55793L15.0788 0.567267C15.6298 0.273801 16.2907 0.273801 16.8417 0.567267L29.9667 7.55793C30.1454 7.65313 30.3046 7.77488 30.4403 7.91683L16.0501 16.225C15.9555 16.2796 15.8683 16.3421 15.7888 16.4112C15.7093 16.3421 15.622 16.2796 15.5274 16.225L1.36548 8.04859Z"
                        fill="#97FE3D"
                      />
                    </svg>
                  </div>
                </div>

                <div className="grid-insider-six" onClick={() => goToTotalAssignedCandidate("tab6")}>
                  <div>
                    {" "}
                    <div className="total-assig-six">
                      Total Submissions Last <br></br>24 Hours
                    </div>
                    <div className="row-flex-data">
                      <div className="number-item-six">{data?.summary?.total_submissions_last_24_hours ?? 0}</div>
                      <div className="all-time-six">/ Last 24 Hours</div>
                    </div>
                  </div>
                  <div className="side-icon-six">
                    <svg width="29" height="30" viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        opacity="0.901274"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M7.51131 0.305632C7.2472 -0.00911659 6.73726 0.111353 6.64193 0.511016L5.00846 7.35915C4.93079 7.6848 5.18886 7.9933 5.52311 7.97436L12.5679 7.57515C12.9788 7.55186 13.1871 7.06983 12.9226 6.75456L11.1212 4.60771C12.286 4.20966 13.5212 4.00176 14.7896 4.00176C21.0488 4.00176 26.1229 9.07587 26.1229 15.3351C26.1229 21.5943 21.0488 26.6684 14.7896 26.6684C8.53032 26.6684 3.45622 21.5943 3.45622 15.3351C3.45622 14.2843 3.59851 13.2552 3.87597 12.266L1.3084 11.5458C0.970344 12.751 0.789551 14.0219 0.789551 15.3351C0.789551 23.0671 7.05756 29.3351 14.7896 29.3351C22.5215 29.3351 28.7896 23.0671 28.7896 15.3351C28.7896 7.60311 22.5215 1.33509 14.7896 1.33509C12.8447 1.33509 10.9924 1.73167 9.30928 2.44837L7.51131 0.305632Z"
                        fill="#66CCFF"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
};

export default RoleRecruiterAnalysis;
