import React, { useEffect, useState } from "react";
import styles from "./css/FilterModal.module.css";
import "./css/filterModalNormalize.css";
import { SelectPicker } from "rsuite";
import { FaChevronDown } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../components/ui/select";

function FilterModal({
  result = () => {},
  show,
  filterKeys,
  recruiterData,
  filteredCandidatesdefault,
  filters,
  setFilters,
  initialFilters = {},
}) {
  const [modalFilters, setModalFilters] = useState(filters);
  const [isRecruiterOpen, setIsRecruiterOpen] = useState(false);

  const toSelectOption = (option) => {
    if (option && typeof option === "object") {
      const labelRaw = option.label ?? option.key ?? option.value ?? option.val ?? "";
      const valueRaw = option.value ?? option.val ?? option.label ?? option.key ?? "";
      return {
        label: String(labelRaw ?? ""),
        value: valueRaw,
      };
    }

    return {
      label: String(option ?? ""),
      value: option,
    };
  };

  const applyFilters = (filters) => {
    setModalFilters({ ...filters });
  };

  useEffect(() => {
    let timeout = setTimeout(() => {
      setModalFilters(filters);
    }, 100);

    return () => clearTimeout(timeout);
  }, [filters]);

  if (!show) {
    return <></>;
  }

  return (
    <div className={`normalizedOverlayNoOverflow ${styles.confirmOverlay}`}>
      <div className={styles.confirmModal}>
        <div className={`${styles.modalHeader} d-flex align-items-center justify-content-between`}>
          <div className="d-flex align-items-center gap-2">
            <span className="filter_icon" />
            <span>Filters</span>
          </div>
          <span onClick={() => result(false)} className="material-symbols-outlined pointer">
            close
          </span>
        </div>
        <div
          className={`d-flex flex-wrap align-items-center gap-3 justify-between mx-auto mt-3 mb-3 signatureContainer ${styles.modalBody}`}
        >
          {Object.keys(filterKeys).map((filterType, index) => {
            let isActive = modalFilters[filterKeys[filterType]?.key] !== "All";
            let filter = filterKeys[filterType];

            let filterData = filter.data
              ? filter.data
              : [...new Set(filteredCandidatesdefault.map((c) => c[filterKeys[filterType]?.key]))];
            const selectOptions = [{ label: `Filter by ${filterType}`, value: "All" }, ...filterData]
              .map((option) => toSelectOption(option))
              .filter((opt) => opt.value !== undefined && opt.value !== null && opt.value !== "");

            if (filterType === "Recruiter") {
              isActive = modalFilters.assigned_recruiter && modalFilters.assigned_recruiter !== "All";

              let dataToMap = [
                { details: [{ recruiter_name: "Filter by Recruiter" }], recruiter_alias_name: "All" },
                ...recruiterData,
              ].map((item) => {
                return { label: item?.details[0]?.recruiter_name || "", value: item.recruiter_alias_name };
              });

              return (
                <SelectPicker
                  key={index}
                  caretAs={() => <FaChevronDown style={{ color: "#9ca3af" }} />}
                  renderValue={(value, item) => {
                    return (
                      <div className="d-flex align-items-center gap-1 text-dark">
                        <span className={`${filter.icon} `} style={{ height: "16px" }} />
                        <span title={item?.label} className="text-truncate w-100">
                          {item?.label || "Filter by Recruiter"}
                        </span>
                      </div>
                    );
                  }}
                  open={isRecruiterOpen} // <--- ADD THIS
                  onOpen={() => setIsRecruiterOpen(true)} // <--- ADD THIS
                  onClose={() => setIsRecruiterOpen(false)}
                  className={`filterpl0 selectpickerNormaltransparent`}
                  menuClassName="selectpickerNormalitemsTransparent"
                  placement="autoVertical"
                  cleanable={false}
                  onChange={(value) => applyFilters({ ...modalFilters, assigned_recruiter: value })}
                  value={modalFilters.assigned_recruiter || "All"}
                  data={dataToMap}
                  placeholder="Select Recruiter"
                />
              );
            }

            const currentValue = String(modalFilters[filterKeys[filterType]?.key] || "All");
            const selectedOption = selectOptions.find((opt) => String(opt.value) === currentValue);
            const displayLabel = selectedOption?.label || `Filter by ${filterType}`;

            return (
              <div
                key={index}
                style={filterKeys[filterType]?.style || {}}
                className={`filter-select d-flex align-items-center ${styles.selectFilter}`}
              >
                <Select
                  value={currentValue}
                  onOpenChange={(isOpen) => {
                    if (isOpen) setIsRecruiterOpen(false);
                  }}
                  onValueChange={(value) => {
                    const selected = selectOptions.find((opt) => String(opt.value) === value);
                    applyFilters({
                      ...modalFilters,
                      [filterKeys[filterType]?.key]: selected ? selected.value : value,
                    });
                  }}
                >
                  <SelectTrigger
                    className={`h-9 w-full min-w-[190px] flex flex-row !border-none pl-[6px] pr-[32px] ${isActive ? "bg-blue-50 text-blue-600 border border-blue-100" : ""}`}
                    style={filterKeys[filterType]?.style || {}}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {filterKeys[filterType]?.googleIcon ? (
                        <span
                          style={{ fontSize: "18px" }}
                          className={`material-symbols-outlined ${styles.selectImage}`}
                        >
                          {filterKeys[filterType].icon}
                        </span>
                      ) : (
                        <img
                          className={styles.selectImage}
                          src={filterKeys[filterType].icon}
                          alt=""
                          width="18"
                          height="18"
                        />
                      )}
                      <span className="truncate">{displayLabel}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions.map((opt, idx) => (
                      <SelectItem key={`${filterType}-${idx}-${String(opt.value)}`} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
        <div className={`ms-auto mt-3 ${styles.buttonContainer}`}>
          <button
            onClick={() => {
              setFilters(initialFilters);
              result(false);
            }}
            className={`${styles.confirmButton} ${styles.confirmCancel}`}
          >
            Clear Filters
          </button>
          <button
            onClick={() => {
              setFilters(modalFilters);
              result(false);
            }}
            className={`${styles.confirmButton} ${styles.confirmYes}`}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
