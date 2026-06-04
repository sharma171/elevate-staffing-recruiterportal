import { useEffect, useState } from "react";
import styles from "./TaxFormsAndDirectDeposit.module.css";
import { axiosApi, ThemeLoader } from "../../../components";
import { useAuth } from "../../../authContext";
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Info,
  Send,
  ShieldCheck,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { toast } from "react-toastify";
import FilePreview from "../../benchcandidate/FilePreview";
import { getDeviceData } from "../../../DeviceStore";
import sendEncryptedRequest from "../../../components/EncryptedRequest";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

const BASE_URL = "https://send-retrieve-employee-tax-forms-v1-305451280005.us-east1.run.app/";

const getFormTypeLabel = (formType, stateCode) => {
  if (formType === "w4_federal") return "W-4 Federal";
  if (formType === "state_withholding") return `${stateCode || "State"} Withholding`;
  return formType;
};

const formatDate = (input) => {
  if (!input) {
    return "-";
  }
  return moment(input).format("MMM DD, YYYY, h:mm A");
};

const getStatusBadge = (status, isVerified) => {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: 500,
    borderRadius: "999px",
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  const iconStyle = {
    width: "12px",
    height: "12px",
    marginRight: "4px",
  };

  if (isVerified) {
    return (
      <div style={{ ...baseStyle, backgroundColor: "#dcfce7", color: "#166534" }}>
        <ShieldCheck style={iconStyle} />
        Verified
      </div>
    );
  }

  switch (status) {
    case "sent":
      return (
        <div style={{ ...baseStyle, backgroundColor: "#dbeafe", color: "#1e40af" }}>
          <Send style={iconStyle} />
          Sent
        </div>
      );

    case "opened":
      return (
        <div style={{ ...baseStyle, backgroundColor: "#fef9c3", color: "#854d0e" }}>
          <Eye style={iconStyle} />
          Opened
        </div>
      );

    case "completed":
      return (
        <div style={{ ...baseStyle, backgroundColor: "#dcfce7", color: "#166534" }}>
          <CheckCircle2 style={iconStyle} />
          Completed
        </div>
      );

    case "voided":
      return (
        <div style={{ ...baseStyle, backgroundColor: "#f3f4f6", color: "#6b7280" }}>
          <XCircle style={iconStyle} />
          Voided
        </div>
      );

    case "not_started":
      return (
        <div style={{ ...baseStyle, backgroundColor: "#f3f4f6", color: "#374151" }}>
          <Clock style={iconStyle} />
          Not Started
        </div>
      );

    case "pending":
      return (
        <div style={{ ...baseStyle, backgroundColor: "#fef3c7", color: "#92400e" }}>
          <Clock style={iconStyle} />
          Pending
        </div>
      );

    default:
      return (
        <div style={{ ...baseStyle, backgroundColor: "#f3f4f6", color: "#374151" }}>
          <Clock style={iconStyle} />
          {status || "Pending"}
        </div>
      );
  }
};

const NO_STATE_TAX_STATES = ["AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY"];
const FEDERAL_COPYCAT_STATES = ["CO", "NM", "ND", "UT", "SC"];

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];
function SendTaxForms({ candidate, isActive, onClose }) {
  const [workState, setWorkState] = useState(candidate?.work_state || "NC");
  const [sending, setSending] = useState(false);
  const [ssnNumber, setSSNNumber] = useState();
  const [snnError, setSnnError] = useState("");

  const candidateEmail = candidate?.original_email;
  const candidateName = candidate?.name || `${candidate?.first_name || ""} ${candidate?.last_name || ""}`.trim();

  const candidateSNN = candidate?.ssn_number;

  let { keys, fingerprints } = getDeviceData();

  const { user } = useAuth();
  let adminEmail = user?.email;

  const candidateID = candidate?.id;

  const getFormsDescription = () => {
    if (NO_STATE_TAX_STATES.includes(workState)) {
      return "Federal W-4 only (no state income tax)";
    }
    if (FEDERAL_COPYCAT_STATES.includes(workState)) {
      return "Federal W-4 only (state uses federal data)";
    }
    if (workState === "PA") {
      return "Federal W-4 + PA flat rate (3.07%)";
    }
    return "Federal W-4 + State Form";
  };

  const handleSend = async () => {
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;

    if (!ssnNumber && !candidateSNN) {
      setSnnError("SSN is required");
      return;
    }

    if (ssnNumber && !ssnRegex.test(ssnNumber)) {
      setSnnError("Invalid SSN format (XXX-XX-XXXX)");
      return;
    }

    const payload = {
      action: "send-tax-forms",
      requesting_user_email: adminEmail,
      candidate_email: candidateEmail,
      candidate_name: candidateName,
      work_state: workState,
      ssn_number: ssnNumber || candidateSNN,
    };

    setSending(true);

    const formData = {
      emailid: adminEmail,
      modify: {
        columns: { ssn_number: ssnNumber },
        id: String(candidateID),
      },
    };

    if (ssnNumber && !candidateSNN) {
      let result = await sendEncryptedRequest(formData, keys, fingerprints);
      console.log(result, "ssssssss");
    }

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => res.data || res)
      .then((res) => {
        toast.success(res?.data?.message || "Tax forms sent successfully");
        onClose();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Something went wrong while sending tax forms");
      })
      .finally(() => {
        setSending(false);
      });
  };

  if (!isActive) return null;

  const renderSNNNumber = () => {
    if (candidateSNN) {
      return <></>;
    }

    return (
      <>
        <div
          role="alert"
          className="my-3"
          style={{
            position: "relative",
            width: "100%",
            borderRadius: "8px",
            border: "1px solid #bfdbfe",
            backgroundColor: "#eff6ff",
            padding: "16px",
            boxSizing: "border-box",
            fontFamily: "Arial, sans-serif",
            color: "#1e40af",
          }}
        >
          <Info
            size={16}
            strokeWidth={2}
            color="#1e40af"
            style={{
              position: "absolute",
              left: "16px",
              top: "16px",
            }}
          />

          <div
            style={{
              paddingLeft: "28px",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            <strong>SSN Required:</strong> This candidate does not have a Social Security Number on file. Add it below
            to proceed.
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Social Security Number</label>
          <input
            className="form-control bigHoverInput py-2"
            value={ssnNumber}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, ""); // allow only numbers
              value = value.substring(0, 9); // max 9 digits

              if (value.length > 5) {
                value = value.replace(/(\d{3})(\d{2})(\d{0,4})/, "$1-$2-$3");
              } else if (value.length > 3) {
                value = value.replace(/(\d{3})(\d{0,2})/, "$1-$2");
              }
              setSnnError("");
              setSSNNumber(value);
            }}
            placeholder="xxx-xx-xxxx"
          />
          {snnError ? <div className="text-danger text12 my-2">{snnError}</div> : <></>}

          <div className="text12 my-2">
            {" "}
            SSN will be saved to the candidate's profile and included with the tax forms.
          </div>
        </div>
      </>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          maxWidth: "700px",
          width: "100%",
          borderRadius: "8px",
          padding: "16px 20px 20px 20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <div>
          <div className="d-flex gap-2 align-items-center justify-content-between">
            <h5 className="mt-1">Send Tax Forms</h5>

            <button type="button" className="hidemodalclosebtn pdfcontrollButtonsPDF" onClick={() => onClose(false)}>
              <X size={22} />
            </button>
          </div>

          <div className="mb-3">
            Send tax withholding forms to <b>{candidateName}</b>
          </div>

          <div className="mb-3 signatureContainer">
            <SelectGroup>
              <SelectLabel className="text-[#343434] fw-semibold capitalize text-[13px]">Work State</SelectLabel>
              <Select onValueChange={(value) => setWorkState(value)} value={workState}>
                <SelectTrigger className="w-full !h-[42px]">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name} ({state.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SelectGroup>
          </div>

          <div className="my-3 p-3 rounded-3 fw-medium" style={{ background: "#f1f1f980", color: "#67677e" }}>
            <span className="fw-bold">Forms to send: </span>
            {getFormsDescription()}
          </div>

          {renderSNNNumber()}

          <div className="alert alert-warning bg-warning bg-opacity-10 my-3">
            <div className="d-flex align-items-center gap-2">
              <TriangleAlert size={18} />
              <span>
                <b>Warning:</b> Sending new forms will automatically void all pending forms for this candidate.
              </span>
            </div>
          </div>

          <div className="d-flex gap-2 mt-4 justify-content-end">
            <button type="button" className="btn btn-light" onClick={() => onClose(false)} disabled={sending}>
              Cancel
            </button>

            <button
              type="button"
              className="btn themePurpleBGHover text-white d-flex gap-2 align-items-center"
              onClick={handleSend}
              disabled={sending}
            >
              <Send size={14} />
              <span>Send Tax Forms </span>
            </button>
          </div>
          <ThemeLoader show={sending} fixed />
        </div>
      </div>
    </div>
  );
}

function TaxFormsAndDirectDeposit({ candidate, disabled }) {
  const [taxData, setTaxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendTaxForm, setsendTaxForm] = useState(false);
  const [viewDoc, setViewDoc] = useState(false);

  let taxFormVerified = String(taxData?.taxforms_verified).toLowerCase() == "yes";

  let candidateEmail = candidate?.original_email;
  const tableData = taxData?.forms || [];

  let currentRequestData = [];
  let previousRequestData = [];

  let isAllCompleted = true;

  tableData.forEach(function (item) {
    if (item.status === "voided") {
      previousRequestData.push(item);
    } else {
      if (item.status !== "completed") {
        isAllCompleted = false;
      }
      currentRequestData.push(item);
    }
  });

  if (!currentRequestData?.length) {
    isAllCompleted = false;
  }

  const { user } = useAuth();
  let adminEmail = user?.email;

  useEffect(() => {
    getData();
  }, [candidateEmail]);

  const downloadData = (form_id, isView) => {
    setLoading(true);

    const payload = {
      action: "download-tax-form",
      requesting_user_email: adminEmail,
      form_id: form_id,
    };

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        const base64Data = res?.data?.pdf_base64;
        const fileName = res?.data?.filename;

        if (isView) {
          setViewDoc(res?.data);
          return;
        }

        const link = document.createElement("a");
        link.href = "data:application/pdf;base64," + base64Data;
        link.download = fileName || "file.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        console.log(err, "ssssssssss");
      })
      .finally(() => setLoading(false));
  };

  const getData = () => {
    const payload = {
      action: "get-tax-form-status",
      requesting_user_email: adminEmail,
      candidate_email: candidateEmail,
    };

    setLoading(true);

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        let result = res?.data;
        setTaxData(result);
      })
      .catch((err) => {
        console.log(err, "ssssssssss");
      })
      .finally(() => setLoading(false));
  };

  const verifyTaxForms = () => {
    let payload = {
      action: "verify-tax-forms",
      requesting_user_email: adminEmail,
      candidate_email: candidateEmail,
    };

    setLoading(true);

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        toast.success(res?.data?.message || "Tax forms verified successfully");
        getData();
      })
      .catch((err) => {
        toast.success(err?.response?.data?.error || "Failed to verify Tax forms");
        console.log(err, "ssssssssss");
      })
      .finally(() => setLoading(false));
  };

  const renderbesicHeaderData = () => {
    return (
      <div>
        <div className="d-flex gap-2 align-items-center justify-content-between mb-2">
          <div className="d-flex gap-2 align-items-center">
            <div className="d-flex align-items-center gap-2 fw-medium">
              <FileText size={18} />
              Tax Forms
            </div>
            {taxFormVerified ? (
              <div className="d-flex align-items-center gap-1 badge rounded-pill border border-success text-success bg-success bg-opacity-10 pt-1 pe-2 font12 fw-semibold">
                <ShieldCheck size={14} />
                <span className={styles.status}>Verified</span>
              </div>
            ) : (
              <></>
            )}
          </div>

          {disabled ? (
            <></>
          ) : (
            <div className="d-flex gap-2">
              {!taxFormVerified && isAllCompleted ? (
                <button
                  className="py-1 border successButton"
                  type="button"
                  onClick={() => {
                    verifyTaxForms();
                  }}
                >
                  <ShieldCheck size={16} />
                  Verify Forms
                </button>
              ) : (
                <></>
              )}

              <button
                className="py-1 border successoutlineButton"
                type="button"
                onClick={() => {
                  setsendTaxForm(true);
                }}
              >
                <Send size={16} />
                {tableData.length ? "Resend Forms" : "Send Tax Forms"}
              </button>
            </div>
          )}
        </div>

        {taxData?.taxforms_verified_by && taxFormVerified ? (
          <div
            className="alert alert-success d-flex align-items-center bg-success bg-opacity-10 my-3 text-success border border-success"
            role="alert"
          >
            <div className="d-flex gap-2 align-items-center fw-normal font14">
              <ShieldCheck size={18} />
              <div>
                Verified by <b> {taxData?.taxforms_verified_by} </b>
                on <b> {moment(taxData?.taxforms_verified_at).format("MMM DD, YYYY, h:mm A")}</b>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  };

  const renderTableData = () => {
    if (!tableData?.length) {
      return (
        <div className="text-center p-4">
          No tax forms sent yet. Click "
          <b
            className="pointer"
            onClick={() => {
              if (!disabled) {
                setsendTaxForm(true);
              }
            }}
          >
            {" "}
            Send Tax Forms{" "}
          </b>
          " to get started.
        </div>
      );
    }

    const renderAction = (item, isdisabled) => {
      const status = item.status;

      if (isdisabled) {
        return <i style={{ fontStyle: "italic" }}>Superseded</i>;
      }

      if (status == "completed") {
        return (
          <div className="d-flex gap-2 align-items-center">
            <button
              className="px-2 py-1 successoutlineButton"
              type="button"
              onClick={() => {
                if (item?.form_id) {
                  downloadData(item?.form_id, true);
                }
              }}
              title="View Tax Form"
            >
              <Eye size={15} />
            </button>

            <button
              className="px-2 py-1 successoutlineButton"
              type="button"
              onClick={() => {
                if (item?.form_id) {
                  downloadData(item?.form_id);
                }
              }}
              title="Download Tax Form"
            >
              <Download size={15} />
            </button>
          </div>
        );
      }

      return <i style={{ fontStyle: "italic" }}>Awaiting</i>;
    };

    const renderTable = (renderData, isCurrent) => {
      if (!renderData?.length) {
        return <></>;
      }

      let sentAtDate = formatDate(renderData[0]?.sent_at);

      return (
        <div>
          {isCurrent ? (
            <div className="mb-2 mt-3 d-flex gap-1 align-items-center">
              <span className="themePurple fw-semibold ">Current Request</span>
              <span className="font12">{sentAtDate}</span>
            </div>
          ) : (
            <div className="text-muted fw-semibold mb-2 mt-3">Previous Requests </div>
          )}

          <div className="table-responsive">
            <table
              className="table table-hover  table-striped"
              style={
                isCurrent
                  ? { "--bs-table-striped-bg": "#f1f3f5" }
                  : {
                      "--bs-table-bg": "#fafafa",
                      "--bs-table-striped-bg": "#fafafa",
                      "--bs-table-hover-bg": "#fafafa",
                      color: "#9ca3af",
                    }
              }
            >
              <thead>
                <tr>
                  <th className="py-3 bg-light">Form</th>
                  <th className="py-3 bg-light">Status</th>
                  <th className="py-3 bg-light">{isCurrent ? "Opened" : "Sent"}</th>
                  <th className="py-3 bg-light">Completed</th>
                  <th className="py-3 bg-light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {renderData?.map((item, index) => {
                  let tableColorStyle = isCurrent ? {} : { color: "#9ca3af" };

                  return (
                    <tr key={index}>
                      <td style={tableColorStyle} className="py-3">
                        {getFormTypeLabel(item.form_type, item.state_code)}
                      </td>
                      <td style={tableColorStyle} className="py-3">
                        {item.status ? getStatusBadge(item.status) : "-"}
                      </td>
                      <td style={tableColorStyle} className="py-3">
                        {formatDate(isCurrent ? item.opened_at : item.sent_at)}
                      </td>
                      <td style={tableColorStyle} className="py-3">
                        {formatDate(item.completed_at)}
                      </td>
                      <td style={tableColorStyle} className="py-3">
                        {renderAction(item, !isCurrent)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    return (
      <div>
        <div>{renderTable(currentRequestData, true)}</div>
        <div>{renderTable(previousRequestData)}</div>
      </div>
    );
  };

  return (
    <div>
      {renderbesicHeaderData()}
      {renderTableData()}
      <SendTaxForms
        candidate={candidate}
        onClose={() => {
          getData();
          setsendTaxForm(false);
        }}
        isActive={sendTaxForm}
      />

      {viewDoc?.pdf_base64 ? (
        <FilePreview
          docObject={{ file_name: viewDoc?.filename }}
          base64File={viewDoc?.pdf_base64}
          setBase64File={() => setViewDoc(false)}
          fileType={viewDoc?.content_type}
          setFileType={() => {}}
        />
      ) : (
        <></>
      )}
      <ThemeLoader show={loading} fixed />
    </div>
  );
}

export default TaxFormsAndDirectDeposit;
