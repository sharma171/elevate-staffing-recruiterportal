import React, { useState, useEffect } from "react";
import "./TimePicker.css"; // Assuming you have a CSS file for styling
import { ReactComponent as TimePickerIcon } from "./TimePicker.svg";

const TimePicker = ({ time, setTime, currentEmail }) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [ampm, setAmpm] = useState("AM");
  const [timePickerActive, setTimePickerActive] = useState(false);

  const incrementHours = () => {
    setHours((prev) => (prev < 12 ? prev + 1 : 1));
  };

  const decrementHours = () => {
    setHours((prev) => (prev > 1 ? prev - 1 : 12));
  };

  const incrementMinutes = () => {
    setMinutes((prev) => (prev < 59 ? prev + 1 : 0));
  };

  const decrementMinutes = () => {
    setMinutes((prev) => (prev > 0 ? prev - 1 : 59));
  };

  const toggleAmPm = () => {
    setAmpm((prev) => (prev === "AM" ? "PM" : "AM"));
  };

  const handleTimeChange = () => {
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
    setTime(formattedTime);
  };

  // Whenever values change, update parent time
  useEffect(() => {
    handleTimeChange();
  }, [hours, minutes, ampm]);

  return (
      <>
      {currentEmail.hotmail_data.send_hotlist === true ? (
        <>
          <div className="custom-time-picker" readOnly>
            <label><span>{currentEmail.hotmail_data.time_hotlistsend}</span> <TimePickerIcon/></label>
          </div>
        </>
        ):(
        <>
          <div className="custom-time-picker" onClick={() => setTimePickerActive(true)} onMouseLeave={() => setTimePickerActive(false)}>
            <label>{hours!==0?(<>{`${hours} : ${minutes} ${ampm}`}</>):(<span>Select Time</span>)} <TimePickerIcon/></label>
            {timePickerActive && (
              <>
              <div className="time-container">
                  <div className="time-section">
                  <button onClick={incrementHours}>▲</button>
                  <div>{hours.toString().padStart(2, "0")} h</div>
                  <button onClick={decrementHours}>▼</button>
                  </div>
                  <span>:</span>
                  <div className="time-section">
                  <button onClick={incrementMinutes}>▲</button>
                  <div>{minutes.toString().padStart(2, "0")} m</div>
                  <button onClick={decrementMinutes}>▼</button>
                  </div>
                  <div className="time-section col-flex ampm">
                  {/* <button onClick={(toggleAmPm)}>▲</button> */}
                  {/* <div>{ampm}</div> */}
                  <button className={`${ampm=="AM"?"active":""}`} onClick={()=>setAmpm("AM")}>AM</button>
                  <button className={`${ampm=="PM"?"active":""}`} onClick={()=>setAmpm("PM")}>PM</button>
                  </div>
              </div>
              </>
              )}
            
          </div>
        </>
      )}
        
      </>
  );
};

export default TimePicker;