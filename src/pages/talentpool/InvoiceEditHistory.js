import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowRight, X, Calendar, FileEdit } from "lucide-react";
import { axiosApi } from "../../components";
import { useAuth } from "../../authContext";
import moment from "moment";

const PAYMENT_API_URL = "https://manage-vendor-payments-v3-305451280005.us-east1.run.app";

export function EditHistoryModal({ open = true, onOpenChange, data = {}, candidate }) {
  const [editHistory, setEditHistory] = useState([]);
  const [editSummary, setEditSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  let employeeEmail = candidate?.original_email;

  let invoiceId = data?.invoice_id;
  let invoiceNumber = data.invoice_number;
  const { user } = useAuth();
  let employerEmail = user?.email;

  useEffect(() => {
    if (open && invoiceId) {
      loadEditHistory();
    }
  }, [open, invoiceId]);

  const loadEditHistory = async () => {
    if (!invoiceId) return;

    setLoading(true);

    const payload = {
      task: "get_payment_history",
      invoice_id: invoiceId,
      employer_email: employerEmail,
      employee_email: employeeEmail,
      include_writeoffs: true,
    };

    axiosApi
      .post(PAYMENT_API_URL, payload)
      .then((res) => {
        setEditHistory(res?.data?.edit_history || []);
        setEditSummary(res?.data?.edit_summary || null);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleClose = () => {
    setEditHistory([]);
    setEditSummary(null);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="signatureContainer homepageFontfamily">
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

        <div className="relative z-50 w-full max-w-2xl mx-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-h-[80vh] flex flex-col">
            <div className="p-3 pb-2 border-b">
              <div className="d-flex align-items-center gap-2 justify-content-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit History</h2>
                <button onClick={handleClose} className="hidemodalclosebtn pdfcontrollButtonsPDF">
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>{" "}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Invoice {invoiceNumber}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 pt-2 space-y-4">
              {editSummary && editSummary.total_edits > 0 && (
                <div className="flex items-center gap-3 p-3 bg-[#eff6ff] ring-1 ring-[#bfdbfe] rounded-lg">
                  <div className="text-sm font-medium text-[#000]">{editSummary.total_edits} edits</div>
                  <div className="text-[#67677e]">
                    Last edited by {editSummary.last_edited_by} on{" "}
                    {moment(editSummary.last_edited_on).format("MMM DD, YYYY [at] h:mm A")}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border dark:border-gray-800 rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                      </div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : editHistory.length > 0 ? (
                <div className="space-y-4">
                  {editHistory.map((entry, index) => (
                    <div key={entry.id || index} className="border dark:border-gray-800 rounded-lg p-[12px] space-y-4">
                      {/* Entry Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Action Badge */}
                          <div
                            className={`px-2 py-1 rounded-full text-[12px] font-medium flex items-center gap-2 ${
                              entry.action === "DELETED"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                : entry.action === "EDITED"
                                  ? "bg-[#7c3bed] text-white"
                                  : "bg-gray-100 dark:bg-gray-800 text-[#000]"
                            }`}
                          >
                            {entry.action.replace(/_/g, " ")}
                          </div>

                          <span className="text-sm text-gray-600 dark:text-gray-400">by {entry.performed_by}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(entry.performed_at), "MMM dd, yyyy 'at' h:mm a")}
                        </div>
                      </div>

                      {/* Reason */}
                      {entry.details?.edit_reason && (
                        <div className="text-sm text-[#000]">
                          <span className="font-medium">Reason:</span>
                          <span className="ml-2">{entry.details.edit_reason}</span>
                        </div>
                      )}

                      {entry.details?.reason && (
                        <div className="text-sm text-[#000]">
                          <span className="font-medium">Reason:</span>
                          <span className="ml-2">{entry.details.reason}</span>
                        </div>
                      )}

                      {entry.action === "EDITED" && entry.details?.previous_values && entry.details?.new_values && (
                        <div className="border dark:border-[#e7e7ef] rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="!border-b border-[#e7e7ef] bg-gray-50">
                                  <th className="text-left p-3 text-xs font-medium text-gray-700">Field</th>
                                  <th className="text-left p-3 text-xs font-medium text-gray-700">Previous</th>
                                  <th className="text-left p-3 text-xs font-medium text-gray-700 w-8"></th>
                                  <th className="text-left p-3 text-xs font-medium text-[#000]">New</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(entry.details.new_values).map((field, index) => (
                                  <tr
                                    key={index}
                                    className="!border-b border-[#e7e7ef] last:border-0 hover:bg-[#f1f1f980]"
                                  >
                                    <td className="p-3 text-xs font-medium text-gray-700 capitalize">
                                      {field.replace(/_/g, " ")}
                                    </td>
                                    <td className="p-3 text-xs text-gray-600 dark:text-gray-400">
                                      {typeof entry.details.previous_values[field] === "number" &&
                                      (field.includes("amount") || field.includes("rate") || field.includes("balance"))
                                        ? formatCurrency(entry.details.previous_values[field])
                                        : entry.details.previous_values[field]}
                                    </td>
                                    <td className="p-3 text-center">
                                      <ArrowRight className="h-3 w-3 text-gray-400 dark:text-gray-500 mx-auto" />
                                    </td>
                                    <td className="p-3 text-xs font-medium text-[#000]">
                                      {typeof entry.details.new_values[field] === "number" &&
                                      (field.includes("amount") || field.includes("rate") || field.includes("balance"))
                                        ? formatCurrency(entry.details.new_values[field])
                                        : entry.details.new_values[field]}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Deleted Status */}
                      {entry.action === "DELETED" && entry.details?.previous_status && (
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Previous Status: </span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 rounded text-xs font-medium ml-2">
                            {entry.details.previous_status}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <FileEdit className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No edit history</h3>
                  <p className="text-gray-500 dark:text-gray-400">No edit history found for this invoice.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-3 border-t dark:border-gray-800">
              <button onClick={handleClose} className="border successoutlineButtonWhite successoutlineButton">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
