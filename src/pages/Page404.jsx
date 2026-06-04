import React, { useState, useEffect } from "react";
import images from "../assets/images/new";

const { page404 } = images;

function Page404() {
  const [visible, setVisible] = useState(false);

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleBackToHome();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return <div className="w-100" style={{ height: "100vh", background: "#fff" }} />;
  }

  return (
    <div
      className="w-100 d-flex align-items-center flex-column pb-5 page404"
      style={{ background: "#f4f7fc", minHeight: "99dvh" }}
    >
      <img src={page404} alt="404" />
      <div className="d-flex flex-column justify-content-center align-items-center text-center px-3 pt-5">
        <h2 className="fs-1 fw-bold mb-3 themeColor">Oops... Page Not Found</h2>
        <p className="fs-5">
          This page isn’t working. Please return to the{" "}
          <b className="themeColor pointer" style={{ cursor: "pointer" }} onClick={handleBackToHome}>
            Home page.
          </b>
        </p>
      </div>
    </div>
  );
}

export default Page404;
