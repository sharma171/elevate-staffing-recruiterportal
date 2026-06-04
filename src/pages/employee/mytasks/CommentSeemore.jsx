import React, { useState,useEffect } from 'react';

const CommentssSeemore = ({ Comments }) => {
  const [expanded, setExpanded] = useState(false);

  const words = Comments?.split(' ') || [];
  const isLong = words.length > 10;
  const shortText = words.slice(0, 10).join(' ') + (isLong ? '...' : '');

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
useEffect(()=>{
    if(expanded==true){
        setTimeout(()=>{
            setExpanded(false);
        },8000);
    }
},[expanded])
  return (
    <>
      {expanded ? Comments : shortText}{' '}
      {isLong && (
        <div
          onClick={toggleExpanded}
          className="text-blue-500 underline cursor-pointer ml-1 seemore"
        >
          {expanded ? 'See Less' : 'See More'}
        </div>
      )}
    </>
  );
};

export default CommentssSeemore;
