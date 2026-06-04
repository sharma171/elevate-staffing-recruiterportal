import React, { useState } from "react";
import moment from "moment-timezone";
import { Calendar } from "rsuite";
import "rsuite/dist/rsuite.min.css";

import styles from "./ScheduleVerificationModal.module.css";
import { OverlayModal } from "../../../components";
import { CalendarIcon, Clock, Info, Video, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../../authContext";
import axios from "axios";

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

const formatTimeSlot = (time) => {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
};

export default function ScheduleVerificationModal({
  open,
  onOpenChange,
  candidate,
  onSuccess,
  isReschedulingInProgress = false,
}) {
  const [selectedDate, setSelectedDate] = useState(moment().add(1, "day").toDate());
  const [selectedTime, setSelectedTime] = useState("14:00");
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const userEmail = user?.email;

  if (!open) return null;

  const minDate = moment().startOf("day");
  const maxDate = moment().add(15, "years").endOf("day");

  const convertESTtoUTC = (date, time) => {
    return moment
      .tz(`${moment(date).format("YYYY-MM-DD")} ${time}`, "America/New_York")
      .utc()
      .toISOString();
  };

  const validateDateTime = () => {
    const selected = moment(`${moment(selectedDate).format("YYYY-MM-DD")} ${selectedTime}`);

    if (selected.isBefore(moment())) {
      return "Please select a future date and time";
    }

    return null;
  };

  const isTimeDisabled = (time) => {
    const now = moment();
    const selectedDay = moment(selectedDate).startOf("day");

    if (selectedDay.isAfter(now, "day")) {
      return false;
    }

    if (selectedDay.isBefore(now, "day")) {
      return true;
    }

    const slotTime = moment(`${now.format("YYYY-MM-DD")} ${time}`);

    return slotTime.isSameOrBefore(now);
  };

  const handleSchedule = () => {
    const error = validateDateTime();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      action: "create-verification-call",
      requesting_user_email: userEmail,
      employee_email: candidate?.original_email,
      scheduled_at: convertESTtoUTC(selectedDate, selectedTime),
      scheduled_timezone: "America/New_York",
      additional_message: additionalMessage,
    };

    axios
      .post("https://send-video-verification-employee-onboarding-v1-305451280005.us-east1.run.app", payload)
      .then(({ data }) => {
        onSuccess(data);
        onOpenChange(false);
      })
      .catch((err) => toast.error(err.message || "Failed"))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <OverlayModal
      isActive={open}
      onClose={() => onOpenChange(false)}
      modalStyle={{ background: "#fff" }}
      style={{ maxWidth: "750px" }}
    >
      <div>
        <div className="h5 fw-semibold d-flex justify-content-between align-items-center mb-0">
          <div className="d-flex align-items-center gap-2">
            <Video size={20} strokeWidth={3} />
            <span>Schedule I-9 Video Verification</span>
          </div>

          <span
            className="hidemodalclosebtn pdfcontrollButtonsPDF d-flex justify-content-center align-items-center pointer"
            onClick={() => onOpenChange(false)}
          >
            <X size={22} strokeWidth={3} />
          </span>
        </div>

        <div>Schedule a video call to verify the candidate's identity and documents.</div>

        {isReschedulingInProgress && (
          <div className={`${styles.warning} my-3`}>
            <div className="d-flex gap-2">
              <Info size={20} />
              <div>
                <div className="fw-semibold h6">Rescheduling Active Call</div>
                <div>The current call is in progress and will be ended when you schedule a new call.</div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.infoSection}>
          <div className="fw-semibold h6">Candidate Information</div>
          <div className="mb-1 ms-2">
            Name:{" "}
            <span className="fw-semibold">
              {candidate?.first_name} {candidate?.last_name}
            </span>
          </div>
          <div className="mb-1 ms-2">
            Email: <span className="fw-semibold">{candidate?.primary_email}</span>
          </div>
        </div>

        <div className={styles.section}>
          <div className="fw-bold d-flex align-items-center gap-2">
            <CalendarIcon size={18} />
            <span>Select Date</span>
          </div>
          <div className="d-flex justify-content-center w-100">
            <div className="p-3 border rounded pb-1">
              <Calendar
                compact
                value={selectedDate}
                onChange={(date) => {
                  const selected = moment(date);
                  if (selected.isBefore(minDate)) return;
                  setSelectedDate(date);
                }}
                className={styles.calendar}
                disabledDate={(date) => moment(date).isBefore(minDate)}
                // disabledDate={(date) => moment(date).isBefore(minDate) || moment(date).isAfter(maxDate)}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className="fw-semibold d-flex align-items-center gap-1">
            <Clock size={16} style={{ marginBottom: "2px" }} />
            <label className="p-0 m-0">Select Time</label>
          </div>

          <select
            className="form-select bigHoverInput"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t} disabled={isTimeDisabled(t)}>
                {formatTimeSlot(t)}
              </option>
            ))}
          </select>
        </div>

        <div className={`${styles.timeInfo} my-3 d-flex align-items-center gap-2`}>
          <Info size={16} />
          <span>All times are in Eastern Time (EST/EDT)</span>
        </div>

        <div className={styles.summary}>
          <div>Selected Schedule</div>
          <div className="fw-bold h6 mt-2">
            {moment(selectedDate).format("dddd, MMMM D, YYYY")} at {formatTimeSlot(selectedTime)} EST
          </div>
        </div>

        <div className={styles.section}>
          <label className="fw-semibold mb-1">Additional Instructions (Optional)</label>
          <textarea
            placeholder="Please have your passport and work authorization documents ready. Ensure you are in a well-lit area."
            maxLength={500}
            className="bigHoverInput"
            value={additionalMessage}
            onChange={(e) => setAdditionalMessage(e.target.value)}
          />
          <div className={styles.counter}>{additionalMessage.length} / 500</div>
        </div>

        <div className={`${styles.infoSection} text-muted`}>
          <div className="d-flex align-items-center gap-2 fw-bold text-dark">
            <Info size={20} />
            <span>What happens next:</span>
          </div>
          <ul>
            <li className="mt-1">Candidate receives email with call details</li>
            <li className="mt-1">You receive confirmation email</li>
            <li className="mt-1">Both parties can join 15 minutes early</li>
            <li className="mt-1">Call will be recorded for compliance</li>
          </ul>
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type="button" onClick={handleSchedule} disabled={isSubmitting}>
            {isSubmitting ? "Scheduling..." : "Schedule Call"}
          </button>
        </div>
      </div>
    </OverlayModal>
  );
}
