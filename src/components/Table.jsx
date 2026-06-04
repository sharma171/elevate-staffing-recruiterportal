import React from "react";
import "../assets/styles/Table.css";
import Edit from "../assets/images/Edit.svg";
import Delete from "../assets/images/Delete.svg";

const Table = ({ headers, children }) => {
  return (
    <div className="table">
      <table className="v2-table">
        <thead>
          <tr className="v2-table-head">
            {headers?.map((value) => (
              <th key={value}>{value}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default Table;
