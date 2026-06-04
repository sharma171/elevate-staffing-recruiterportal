import React, { useState, useEffect } from "react";

const TaskDescription = ({ description }) => {
  const [expanded, setExpanded] = useState(false);

  const words = description?.split(" ") || [];
  const isLong = words.length > 10;
  const shortText = words.slice(0, 10).join(" ") + (isLong ? "..." : "");

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  useEffect(() => {
    if (expanded == true) {
      setTimeout(() => {
        setExpanded(false);
      }, 8000);
    }
  }, [expanded]);
  return (
    <div className="fontgray fs-12">
      {expanded ? description : shortText}{" "}
      {isLong && (
        <button type="button" onClick={toggleExpanded} className="text-blue-500 underline cursor-pointer ml-1 seemore">
          {expanded ? "See Less" : "See More"}
        </button>
      )}
    </div>
  );
};

export default TaskDescription;
