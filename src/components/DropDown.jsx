import React, { useState, useEffect, useRef } from "react";
import "../assets/styles/DropDown.css";

const DropDown = ({ selected, setSelected, data, text, style }) => {
  const [clicked, setClicked] = useState(false);
  const dropdownRef = useRef(null);

  const handleClick = () => {
    setClicked(!clicked);
  };

  const handleSelect = (item) => {
    // console.log("dropdown", item);
    setSelected(item);
    setClicked(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setClicked(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // Attach event listener

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup on unmount
    };
  }, []);

  return (
    <div className="custom-select" ref={dropdownRef}>
      <button
        onClick={handleClick}
        className="custom-select-btn d-flex justify-between gap-4 align-center"
        style={style}
      >
        <span className="selected value">{selected ? selected.text : text}</span>
        <span className="arrow"></span>
      </button>
      {clicked && (
        <ul className="selected-dropdown">
          {data.map((value) => (
            <li
              key={value.value}
              className={selected.text == value.text ? "activedropselect" : ""}
              onClick={() => handleSelect(value)}
            >
              {value.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropDown;
