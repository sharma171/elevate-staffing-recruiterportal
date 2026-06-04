import React, { useEffect } from "react";
import styles from "./css/Pagination.module.css";

const Pagination = ({
  data = [],
  currentPage,
  setCurrentPage,
  rowsPerPage,
  setRowsPerPage,
  onPaginatedChange,
  hideExtra = false,
  defaultpageHide = 5,
  minVersion = false,
  alltotalrecords,
}) => {
  const rowSizeOptions = [5, 10, 15, 20, 30, 50, 100];
  const totalPages = Math.ceil((alltotalrecords || data.length) / rowsPerPage);

  useEffect(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginated = data.slice(start, end);
    onPaginatedChange && onPaginatedChange(paginated);
  }, [data, currentPage, rowsPerPage, onPaginatedChange]);

  if ((alltotalrecords || data?.length) <= defaultpageHide) {
    return <></>;
  }

  if (minVersion) {
    return (
      <div>
        <div className="d-flex justify-content-center align-items-center my-2 mb-1">
          <span
            className={`lefticon pointer ${currentPage === 1 ? styles.disabled : styles.pages}`}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          >
            ◀
          </span>
          <span className={`mx-3 ${styles.currentPage}`}>{`${currentPage}`}</span>
          <span
            className={`righticon pointer ${currentPage === totalPages ? styles.disabled : styles.pages}`}
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          >
            ▶
          </span>
        </div>
        <div className="text-center font12">Page {`${currentPage} of ${totalPages}`}</div>
      </div>
    );
  }

  const getPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (start > 1) pages.push(1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      if (end < totalPages) pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPages();

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-4">
      {hideExtra ? (
        <></>
      ) : (
        <div className="my-3">
          <label>Show</label>
          <select
            className="form-select d-inline w-auto ms-2"
            onChange={(e) => {
              setCurrentPage(1);
              setRowsPerPage(Number(e.target.value));
            }}
            value={rowsPerPage}
          >
            {rowSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <label>&nbsp;Row</label>
        </div>
      )}
      <div className="d-flex justify-content-center my-3">
        <div className="d-flex align-items-center gap-1">
          <span
            className={`lefticon pointer ${currentPage === 1 ? styles.disabled : styles.pages}`}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          >
            ◀
          </span>

          {pages.map((page, index) => (
            <button
              type="button"
              key={index}
              className={`btn ${styles.pages} ${
                currentPage === page ? "btn-primary " + styles.activePage : "btn-light"
              }`}
              onClick={() => typeof page === "number" && setCurrentPage(page)}
              disabled={page === "..."}
            >
              {page}
            </button>
          ))}

          <span
            className={`righticon pointer ${currentPage === totalPages ? styles.disabled : styles.pages}`}
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          >
            ▶
          </span>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default Pagination;
