import React, { useEffect, useState } from "react";

function EmptyView({ hide, title = "", description = "" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    if (!hide) {
      timer = setTimeout(() => setVisible(true), 200);
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timer);
  }, [hide]);

  return (
    <div
      className="d-flex bg-white flex-column align-items-center justify-content-center text-center p-3 gap-2 fontgray"
      style={{ minHeight: "125px" }}
    >
      {visible ? (
        <>
          <h2 className="h2"> {title}</h2>
          <div className="font12" dangerouslySetInnerHTML={{ __html: description }}></div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default EmptyView;
