import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import styles from "./css/DemoScheduler.module.css";
import { formatDateToET } from "../helpers/StrHelpers";

const DemoScheduler = ({
  startHour = 9,
  endHour = 16.5,
  initialSelectedDemo = null,
  onChange = () => {},
  error = "",
  disabled,
  className,
}) => {
  const parseInitialDate = (d) => {
    if (!d) return null;
    const maybeDate = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    return isNaN(maybeDate?.getTime?.()) ? null : maybeDate;
  };

  const initialRaw = parseInitialDate(initialSelectedDemo?.date);
  const initialFormatted = initialRaw ? formatDateToET(initialRaw) : null;

  const [selectedDateRaw, setSelectedDateRaw] = useState(initialRaw);
  const [selectedDateFormatted, setSelectedDateFormatted] = useState(initialFormatted);
  const [selectedTime, setSelectedTime] = useState(initialSelectedDemo ? initialSelectedDemo.time : null);
  const [selectedSlot, setSelectedSlot] = useState(initialSelectedDemo ? initialSelectedDemo.selectedSlot || "" : "");
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (selectedDateRaw && selectedTime !== null) {
      onChange({ date: selectedDateFormatted, time: selectedTime, selectedSlot });
    } else {
      onChange({ date: null, time: null, selectedSlot: "" });
    }
  }, [selectedDateRaw, selectedTime, selectedSlot]);

  useEffect(() => {
    const closeOnScroll = () => setCalendarOpen(false);
    window.addEventListener("scroll", closeOnScroll, true);
    return () => window.removeEventListener("scroll", closeOnScroll, true);
  }, []);

  const generateTimeSlots = () => {
    const slots = [];
    for (let time = startHour; time <= endHour; time += 0.5) {
      const hours = Math.floor(time);
      const minutes = time % 1 === 0.5 ? 30 : 0;
      const displayHour = hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? "PM" : "AM";
      slots.push({ label: `${displayHour}:${minutes === 0 ? "00" : "30"} ${ampm} EST`, value: time });
    }
    return slots;
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setSelectedTime(slot.value);
  };

  const handleChangeDate = (date) => {
    if (!date) {
      setSelectedDateRaw(null);
      setSelectedDateFormatted(null);
      setSelectedTime(null);
      setSelectedSlot("");
      return;
    }

    setSelectedDateRaw(date);
    setSelectedDateFormatted(formatDateToET(date));
    setSelectedTime(null);
    setSelectedSlot("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <label className={styles.label}>
          Select Demo Date <span className="text-danger">*</span>
        </label>
        <DatePicker
          selected={selectedDateRaw}
          onChange={(date) => handleChangeDate(date)}
          onSelect={(date) => {
            handleChangeDate(date);
            setCalendarOpen(false);
          }}
          open={calendarOpen}
          onClickOutside={() => setCalendarOpen(false)}
          onInputClick={() => setCalendarOpen(true)}
          shouldCloseOnSelect={true}
          toggleCalendarOnIconClick
          calendarIconClassName="calenderIconRight"
          className={`${styles.datepicker} ps-2 ${className}`}
          minDate={new Date()}
          showYearDropdown
          showMonthDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={50}
          showIcon
          placeholderText="Pick a date"
          disabled={disabled}
        />
        {error && <div className={styles.error}>{error}</div>}
      </div>

      {selectedDateRaw && selectedTime === null && (
        <div className={`${styles.section} mt-3`}>
          <label className={styles.label}>Select Time Slot - EST (30-minute intervals)</label>
          <div className={styles.slotsContainer}>
            {generateTimeSlots().map((slot, idx) => (
              <div
                key={idx}
                className={`${styles.slotDiv} ${selectedTime === slot.value ? styles.selectedSlot : ""}`}
                onClick={() => handleSlotClick(slot)}
              >
                <span className={styles.clock}>🕒</span> {slot.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDateRaw && selectedTime !== null && selectedSlot && (
        <div className={`${styles.section} mt-3`}>
          <div
            className={`${styles.selectedInfo} pointer hoverthemetext`}
            onClick={() => {
              setSelectedTime(null);
              setSelectedSlot("");
              setCalendarOpen(false);
            }}
          >
            <span>
              📅{" "}
              {selectedDateFormatted ||
                (selectedDateRaw instanceof Date ? selectedDateRaw.toLocaleDateString() : String(selectedDateRaw))}
            </span>
            <span className="ms-2">🕒 {selectedSlot.label}</span>
            <span className="ms-3 badge text-bg-secondary"> Change </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoScheduler;
