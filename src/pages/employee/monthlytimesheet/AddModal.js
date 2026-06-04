import styles from "./Addmodal.module.css";
import { useState, useEffect, useMemo, useRef } from "react";
import OverlayModal from "../../../components/OverlayModal";
import api from "../../../networking/api";
import { toast } from "react-toastify";
import { useAuth } from "../../../authContext";
import { FaCalendarAlt } from "react-icons/fa";
import { DatePicker, CustomProvider } from "rsuite";
import enUS from "rsuite/locales/en_US";
import { ThemeLoader } from "../../../components";
import { toBase64 } from "../../../helpers/StrHelpers";
import { X } from "lucide-react";

function getWeekRangeForDate(date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function getWeeksInMonth(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const start = getWeekRangeForDate(firstOfMonth)[0];
  const end = getWeekRangeForDate(lastOfMonth)[6];

  const weeks = [];
  let current = new Date(start);

  while (current <= end) {
    const week = getWeekRangeForDate(current);
    weeks.push(week);
    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

function formatRange(week = []) {
  const options = { month: "short", day: "numeric" };
  const start = week[0]?.toLocaleDateString("en-US", options);
  const end = week[6]?.toLocaleDateString("en-US", options);
  return `${start} - ${end}`;
}

let currentMonth = new Date().getMonth() - 1;
let currentyear = new Date().getFullYear();

function WeekNavigator({ onChange, month = currentMonth, year = currentyear }) {
  const allWeeks = useMemo(() => getWeeksInMonth(year, month), [year, month]);
  const [weekIndex, setWeekIndex] = useState(0);

  const currentWeek = allWeeks[weekIndex];
  const formatted = formatRange(currentWeek);

  const handlePrev = () => {
    if (weekIndex > 0) setWeekIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (weekIndex < allWeeks.length - 1) setWeekIndex((i) => i + 1);
  };

  useEffect(() => {
    let lastIndex = weekIndex == allWeeks.length - 1;
    onChange?.({ currentWeek, allWeeks, isLastIndex: lastIndex, weekIndex, handleNext });
  }, [weekIndex]);

  useEffect(() => {
    setWeekIndex(0);
  }, [month]);

  let disabledNext = weekIndex === allWeeks.length - 1;
  let disabledBack = weekIndex === 0;

  return (
    <div className="d-flex align-items-center justify-content-between border rounded p-3 w-100 mx-auto">
      <button type="button" onClick={handlePrev} disabled={disabledBack} className={`btn btn-outline-custom`}>
        &lt; Previous
      </button>
      <div className="fw-medium text-center flex-grow-1">
        Week {weekIndex + 1}: {formatted}
      </div>
      <button type="button" onClick={handleNext} disabled={disabledNext} className={`btn btn-outline-custom`}>
        Next &gt;
      </button>
    </div>
  );
}

function AddModal({ show, setShow, update, edit, allMonthsData = [], userEmail }) {
  const initialValues = {
    monthYear: null,
    hours: "",
    file: null,
    comments: "",
    selectedOption: "file",
    // selectedOption: "manual",
  };

  const { user } = useAuth();
  const [formData, setFormData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [errors, setErrors] = useState({});
  const [weeksData, setWeeksData] = useState({});
  const [activeCommentDate, setActiveCommentDate] = useState(null);
  const textareaRef = useRef();

  const primary_email = userEmail || user?.email;
  let isEmployee = String(localStorage.getItem("userType")).toLowerCase() === "employee";

  let isLastIndex = weeksData?.isLastIndex;
  let month = 0;
  let year = 0;
  let date = new Date(formData.monthYear || new Date());

  if (formData.monthYear) {
    month = date.getMonth();
    year = date.getFullYear();
  } else {
    month = date.getMonth() - 1;
    if (month == 0) {
      year = date.getFullYear() - 1;
    } else {
      year = date.getFullYear();
    }
  }

  let monthYearToShow = date.toLocaleString("en-US", { month: "long", year: "numeric" });

  let monthToView = String(month + 1).padStart(2, "0");
  let finalStrtocompare = monthToView + year;

  let isIncludesMonth = allMonthsData.includes(finalStrtocompare);

  useEffect(() => {
    let timeout = setTimeout(() => {
      if (edit?.submission_type == "manual") {
        getTimesheet();
      } else if (edit?.submission_type == "file") {
        let newEdit = structuredClone(edit);
        newEdit.selectedOption = newEdit?.submission_type;
        newEdit.monthYear = parseMonthYear(newEdit.month);
        newEdit.hours = newEdit?.total_hours || "";
        setFormData(newEdit);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [edit]);

  useEffect(() => {
    setActiveCommentDate(null);
  }, [weeksData?.weekIndex]);

  useEffect(() => {
    formData.daily_hours = {};
    setFormData({ ...formData });
  }, [month]);

  useEffect(() => {
    setLoading(false);
    if (show) {
      setFormData(initialValues);
      setErrors({});
    }
  }, [show]);

  function parseMonthYear(monthYearStr) {
    if (typeof monthYearStr !== "string" || !/^\d{6}$/.test(monthYearStr)) {
      throw new Error("Input must be a string in MMYYYY format");
    }

    const month = parseInt(monthYearStr.slice(0, 2), 10) - 1;
    const year = parseInt(monthYearStr.slice(2), 10);

    return new Date(year, month, 1); // First day of the month
  }

  const getTimesheet = () => {
    let payload = {
      primary_email: primary_email,
      task: "fetch_document_hours",
      document_id: edit?.document_id,
    };

    if (!isEmployee) {
      payload = {
        task: "fetch_document_hours_employer",
        employer_email: user?.email,
        document_id: edit?.document_id,
      };
    }

    setLoader(true);
    api
      .getTimesheets(payload)
      .then((res) => {
        setLoader(false);

        let newRes = structuredClone(res);
        newRes.monthYear = parseMonthYear(newRes.month);
        newRes.selectedOption = "manual";

        let newRes1 = structuredClone(newRes);

        setFormData({ ...edit, ...newRes });
        setTimeout(() => {
          setFormData({ ...edit, ...newRes1 });
        }, 500);
      })
      .catch((err) => {
        setLoader(false);
        console.log(err);
      });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.monthYear) newErrors.monthYear = "Month is required";

    if (formData.selectedOption != "manual") {
      if (!formData.hours || isNaN(formData.hours) || Number(formData.hours) <= 0)
        newErrors.hours = "Total hours must be a positive number";
      if (!formData.file) newErrors.file = "Timesheet file is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalHours = Object.values(formData.daily_hours || {}).reduce(
      (acc, item) => acc + (Number(item.hours) || 0),
      0,
    );

    if ((!totalHours || isNaN(totalHours)) && formData.selectedOption == "manual") {
      return toast.error("Please fill manual entry details!");
    }

    const validationErrors = validate();

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    let payload = {
      primary_email: primary_email,
      month: new Date(formData.monthYear).getMonth() + 1,
      year: new Date(formData.monthYear).getFullYear(),
      hours: formData.hours,
    };

    if (formData.selectedOption == "manual") {
      payload = {
        submission_method: "manual",
        primary_email: primary_email,
        month: new Date(formData.monthYear).getMonth() + 1,
        year: new Date(formData.monthYear).getFullYear(),
        hours: formData.hours,
        daily_entries: formData.daily_hours,
      };
    }

    if (!isEmployee) {
      if (edit) {
        payload.action = "edit_employer";
      } else {
        payload.action = "submit_employer";
      }
      payload.employer_email = user?.email;
    }

    if (edit) {
      payload.document_id = edit.document_id;

      if (formData.selectedOption == "file") {
        const base64 = await toBase64(formData.file);
        payload.file_data = base64;
        payload.file_name = formData.file.name;
      }
    }

    if (formData.comments) {
      payload.comments = formData.comments;
    }

    let payloadformdata = new FormData();

    payloadformdata.append("file", formData.file);
    payloadformdata.append("meta", JSON.stringify(payload));

    if (!isEmployee) {
      if (edit) {
        payloadformdata.append("action", "edit_employer");
      } else {
        payloadformdata.append("action", "submit_employer");
      }
    }

    setLoading(true);

    api
      .createTimesheet(edit ? payload : payloadformdata, {}, edit ? "/edit_timesheet" : "")
      .then((res) => {
        setLoading(false);
        toast.success(res.message || "Timesheet submitted successfully");
        setShow(false);
        update && update();
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err?.error || err?.message || "Something went wrong");
      });
  };

  if (!show) return null;

  const currentDate = new Date();
  const minDate = new Date();
  minDate.setFullYear(currentDate.getFullYear() - 3);
  minDate.setMonth(0, 1);

  const disableOutOfRange = (date) => {
    const isBeforeMin = date < minDate;
    const isAfterCurrent = date > currentDate;
    return isBeforeMin || isAfterCurrent;
  };

  const handleWeekChange = (dataObj) => {
    setWeeksData(dataObj);
  };

  const renderFIleOptions = () => {
    return (
      <>
        <div className="mb-4">
          <label className="form-label">Total Hours Worked</label>
          <div className="d-flex align-items-center">
            <span
              className="material-symbols-outlined themeColor ms-2"
              style={{ marginRight: "-28px", zIndex: 1, fontSize: "20px" }}
            >
              schedule
            </span>
            <input
              type="number"
              value={formData.hours}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                let val = Number(e.target.value);
                if (isNaN(val) || val < 0) {
                  return handleChange("hours", 0);
                }
                if (val > 720) {
                  val = 720;
                }
                handleChange("hours", val || "");
              }}
              className={`inputBorder form-control showarrows ${errors.hours ? "is-invalid" : ""}`}
              placeholder="Total Hours Worked"
              style={{ boxShadow: "unset", border: "1px solid #d5d5d5", paddingLeft: "32px" }}
            />
          </div>
          <div className="fontgray">Note: You can enter a maximum of 720 hours only.</div>
          {errors.hours && <div className="text-danger font12">{errors.hours}</div>}
        </div>

        <div className="mb-4">
          <label className="form-label">Upload Timesheet</label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => {
              const file = e.target.files[0];
              const allowedTypes = [
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              ];

              if (!file) return;

              if (!allowedTypes.includes(file.type)) {
                toast.error("Only PDF and DOCX files are allowed.");
                e.target.value = "";
                handleChange("file", null);
                return;
              }

              handleChange("file", file);
            }}
            className={`inputBorder form-control ${errors.file ? "is-invalid" : ""}`}
            style={{ boxShadow: "unset", border: "1px solid #d5d5d5" }}
          />
          <div className="fontgray">Please upload timesheet files in either .pdf or .docx format.</div>
          {errors.file && <div className="text-danger font12">{errors.file}</div>}
        </div>
      </>
    );
  };

  const renderhourlyData = () => {
    const handleHoursChange = (day, value) => {
      let val = value === "" ? "" : Number(value);
      if (val !== "" && val > 24) val = 24;
      setFormData((prev) => ({
        ...prev,
        daily_hours: {
          ...prev.daily_hours,
          [day]: {
            ...prev.daily_hours?.[day],
            hours: val,
          },
        },
      }));
    };

    const handleNotesChange = (day, value) => {
      setFormData((prev) => ({
        ...prev,
        daily_hours: {
          ...prev.daily_hours,
          [day]: {
            ...prev.daily_hours?.[day],
            notes: value,
          },
        },
      }));
    };

    const totalHours = Object.values(formData.daily_hours || {}).reduce(
      (acc, item) => acc + (Number(item.hours) || 0),
      0,
    );

    const renderHoursBoxes = (dates = []) => {
      const targetMonth = month;
      const targetYear = year;

      return (
        <div>
          {dates.map((dateStr, idx) => {
            const date = new Date(dateStr);
            const day = date.getDate();
            const isOutsideMonth = date.getMonth() !== targetMonth || date.getFullYear() !== targetYear;
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            const formatted = date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            const disabled = isOutsideMonth || isWeekend;
            const daily = formData.daily_hours?.[day] || {};

            return (
              <div key={idx} className="w-100">
                <div
                  className="d-flex align-items-center justify-content-between w-100 gap-2"
                  style={{ color: disabled ? "#aaaaaa" : "#000000" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined mb-1" style={{ fontSize: "20px" }}>
                      date_range
                    </span>
                    <div className="my-3">
                      {formatted}
                      {isOutsideMonth ? <span> (Outside Month)</span> : isWeekend ? <span> (Weekend)</span> : null}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      placeholder="Hours"
                      inputMode="numeric"
                      disabled={disabled}
                      className={`inputBorder form-control showarrows ${disabled ? "" : "darkborder"}`}
                      type="number"
                      style={{ maxWidth: "100px", MozAppearance: "textfield" }}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      value={disabled ? "" : daily.hours || ""}
                      onChange={(e) => {
                        if (disabled) {
                          return;
                        }

                        let val = e.target.value;
                        if (val < 0 || isNaN(val)) {
                          return handleHoursChange(day, 0);
                        }
                        handleHoursChange(day, val);
                      }}
                    />
                    <span
                      className="material-symbols-outlined pointer"
                      style={{ fontVariationSettings: "unset", cursor: "pointer" }}
                      onClick={() => {
                        if (disabled) {
                          setActiveCommentDate(null);
                        } else {
                          setActiveCommentDate((prev) => (prev === day ? null : day));
                          setTimeout(() => {
                            textareaRef?.current?.focus();
                          }, 100);
                        }
                      }}
                    >
                      tooltip
                    </span>
                  </div>
                </div>
                {activeCommentDate === day && (
                  <textarea
                    ref={textareaRef}
                    disabled={disabled}
                    className="inputBorder form-control my-2"
                    rows={2}
                    placeholder="Enter comment"
                    value={daily.notes || ""}
                    onChange={(e) => handleNotesChange(day, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div>
        <div className="d-flex align-items-center justify-content-between text-dark fw-bold my-2">
          <div>Weekly Hours</div>
          <div>Total Hours: {totalHours}</div>
        </div>
        <WeekNavigator onChange={handleWeekChange} month={month} year={year} />
        <div className="border rounded p-3 w-100 mt-3">{renderHoursBoxes(weeksData?.currentWeek)}</div>
      </div>
    );
  };

  const renderOptionalData = () => {
    const reutrnCheckBox = () => {
      return (
        <div className="mb-3">
          {edit?.submission_type == "manual" ? (
            <></>
          ) : (
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="Timesheet"
                id="radioDefault1"
                value="file"
                checked={formData.selectedOption === "file"}
                onChange={(evt) => {
                  formData.selectedOption = evt.target.value;
                  setFormData({ ...formData });
                }}
              />
              <label className="form-check-label" htmlFor="radioDefault1">
                Upload Client Timesheets
              </label>
            </div>
          )}

          {edit?.submission_type == "file" ? (
            <></>
          ) : (
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="Timesheet"
                id="radioDefault2"
                value="manual"
                checked={formData.selectedOption === "manual"}
                onChange={(evt) => {
                  formData.selectedOption = evt.target.value;
                  setFormData({ ...formData });
                }}
              />
              <label className="form-check-label" htmlFor="radioDefault2">
                Enter Daily Hours Manually
              </label>
            </div>
          )}
        </div>
      );
    };

    return (
      <>
        {reutrnCheckBox()}
        {formData.selectedOption == "file" ? renderFIleOptions() : renderhourlyData()}
      </>
    );
  };

  return (
    <OverlayModal
      modalStyle={{ background: "white" }}
      style={{ maxWidth: "700px", background: "white" }}
      isActive={show}
      onClose={() => setShow(false)}
    >
      <div>
        <div className="mb-4 d-flex gap-2 justify-content-between">
          <div>
            <div className="themeColor h4">Submit Monthly Timesheet</div>
            <div className="fontgray fs-6">
              Submit your timesheet for the current month. Please ensure all information is accurate.
            </div>
          </div>

          <button
            style={{
              position: "fixed",
              top: "10px",
              right: "25px",
              zIndex: 1,
            }}
            type="button"
            onClick={() => setShow(false)}
            className="hidemodalclosebtn pdfcontrollButtonsPDF "
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Month</label>
            <DatePicker
              maxDate={"2099"}
              disabledDate={disableOutOfRange}
              oneTap
              format="MM/yyyy"
              onChange={(date) => handleChange("monthYear", date)}
              value={formData.monthYear}
              placeholder="MM/YYYY"
              style={{ width: "100%" }}
              cleanable={false}
              showMonth
              caretAs={FaCalendarAlt}
              className={errors?.monthYear ? "rs-picker-error" : ""}
            />
            {isIncludesMonth && !edit && formData?.monthYear ? (
              <div className="font12 pt-1" style={{ color: "#ff5722" }}>
                Looks like the {monthYearToShow} timesheet is already created.
              </div>
            ) : (
              <></>
            )}
            {errors.monthYear && <div className="text-danger font12">{errors.monthYear}</div>}
          </div>

          <div className="mb-4">{renderOptionalData()}</div>

          <div className="mb-4">
            <label className="form-label">Comments (Optional)</label>
            <textarea
              rows={3}
              value={formData.comments}
              onChange={(e) => handleChange("comments", e.target.value)}
              className="inputBorder form-control"
              placeholder="Any additional comments about this timesheet"
              style={{ resize: "none", boxShadow: "unset", border: "1px solid #d5d5d5" }}
            />
          </div>

          <div className="d-flex justify-content-end mt-4 pt-1 gap-3">
            {isLastIndex || formData.selectedOption != "manual" ? (
              <></>
            ) : (
              <button
                type="button"
                onClick={() => weeksData?.handleNext?.()}
                disabled={loading}
                className="themeButtonoutline d-flex align-items-center"
                style={{ height: "56px" }}
              >
                {loading ? (
                  <>
                    <div className="spinner-border text-light spinner-border-sm" role="status" />
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined me-1">resume</span>
                    Save & Continue
                  </>
                )}
              </button>
            )}
            <button
              onClick={(e) => {
                if (userEmail) {
                  handleSubmit(e);
                }
              }}
              type={userEmail ? "button" : "submit"}
              disabled={loading}
              className="themeButton d-flex align-items-center"
              style={{ height: "56px" }}
            >
              {loading ? (
                <>
                  <div className="spinner-border text-light spinner-border-sm" role="status" />
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined me-1">upload</span>
                  Submit Timesheet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <ThemeLoader show={loader} />
    </OverlayModal>
  );
}

export default AddModal;
