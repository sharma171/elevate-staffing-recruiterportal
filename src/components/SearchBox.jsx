import React, { useState, useEffect, useId, useRef } from "react";
import images from "../assets/images/new";
import styles from "./css/searchbox.module.css";

function SearchBox({ value, onChange, placeholder, className = "", inputclass = "" }) {
  const { search } = images;
  const id = useId();
  const [inputValue, setInputValue] = useState(value || "");
  const [isActive, setIsActive] = useState(false);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setIsActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (value != inputValue) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (value != inputValue) {
        onChange?.(inputValue);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [inputValue, onChange]);

  return (
    <>
      <div className={`input-group ${styles.searchbox} ${className}`}>
        <img src={search} alt="Search" />
        <input
          className={`form-control border-0 ${styles.searchbox__input} ${inputclass}`}
          placeholder={placeholder || "Type here..."}
          aria-label="Search"
          aria-describedby={id}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
      <div 
      ref={searchBoxRef}
      className={`input-group ${styles.searchboxMobile} ${className} ${isActive ? styles.active : ""}`}
      onClick={() => setIsActive(true)}
      >
        <img src={search} alt="Search" />
          <div className={`${isActive ? styles.active : ""} ${styles.smallPoppup}`}>

            <input
              className={`form-control border-0 ${styles.searchbox__input} ${inputclass}`}
              placeholder={placeholder || "Type here..."}
              aria-label="Search"
              aria-describedby={id}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
      </div>
    </>
  );
}

export default SearchBox;
