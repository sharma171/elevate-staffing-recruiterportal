import React, { useEffect, useState } from "react";
import { axiosApi, OverlayModal } from "../../components";
import { CheckCircle2, Info, Save, X } from "lucide-react";
import { useAuth } from "../../authContext";
import { toast } from "react-toastify";
import { Skeleton } from "./GmailCredentials";
import { AIAgentsGrid } from "./MySettings";

const BASE_URL = "https://recruiter-ai-agents-config-api-v1-305451280005.us-east1.run.app/";

function ConfigPopup({ onClose, open }) {
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({});
  const [emailConfigs, setemailConfigs] = useState({});

  const configData = open || {};
  const recruiter_email = configData?.recruiter_email;

  const { user } = useAuth();
  let adminEmail = user?.email;

  const emailConnection = allData?.connection || {};
  const isConnected = emailConnection?.is_connected;
  const settingsConfig = allData?.config || {};

  useEffect(() => {
    getCOnfigData();
  }, [recruiter_email]);

  const saveConfigData = () => {
    if (loading) {
      return;
    }

    const payload = {
      action: "update_my_config",
      requesting_user_email: adminEmail,
      target_recruiter_email: recruiter_email,
      config: {
        config_id: settingsConfig?.config_id,
        integration_id: settingsConfig?.integration_id,
        job_lookback_days: emailConfigs?.job?.lookbackDays,
        job_match_threshold: emailConfigs?.job?.threshold,
        job_matching_enabled: emailConfigs?.job?.jobAgentEnabled,
        job_matching_mode: emailConfigs?.job?.submissionMode,
        job_max_candidates_per_job: emailConfigs?.job?.maxCandidates,
        recruiter_email: adminEmail,
        send_from_candidate_job_matching: emailConfigs?.vendor?.sendFromCandidate,
        send_from_candidate_vendor_outreach: emailConfigs?.vendor?.sendFromCandidate,
        vendor_discovery_enabled: emailConfigs?.vendor?.discovery,
        vendor_match_threshold: emailConfigs?.vendor?.threshold,
        vendor_max_per_company: emailConfigs?.vendor?.maxPerCompany,
        vendor_outreach_enabled: emailConfigs?.vendor?.vendorAgentEnabled,
        vendor_outreach_mode: emailConfigs?.vendor?.submissionMode,
      },
    };
    setLoading(true);
    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        toast.success(res.data.message || "Updated successfully");
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.error || err?.response?.data?.message || "Something went wrong. Please try again.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getCOnfigData = () => {
    if (!recruiter_email) {
      return;
    }

    const payload = {
      action: "get_recruiter_config",
      requesting_user_email: adminEmail,
      target_recruiter_email: recruiter_email,
    };

    setLoading(true);

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        setAllData(res?.data);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Something went wrong");
        onClose?.();
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!open) {
    return;
  }

  const renderLoading = () => {
    if (!loading) {
      return;
    }
    return (
      <div>
        <Skeleton className="w-full h-20 mb-3" />
        <Skeleton className="w-full h-20 mb-3" />
        <Skeleton className="w-full h-20" />
      </div>
    );
  };

  const renderBodyContent = () => {
    if (loading) {
      return;
    }

    return (
      <div>
        <div className="space-y-4 mb-4">
          <div className="flex items-center gap-2 text-[12px] fw-bold">
            {emailConfigs?.connection?.is_connected || emailConfigs?.is_connected ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Connected as {emailConfigs?.connection?.connected_email || emailConfigs?.recruiter_email}
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 ring-1 ring-gray-200">
                Not Connected
              </span>
            )}
          </div>

          {/* Info banner for admins configuring team members - Not Connected State */}
          {!(emailConfigs?.connection?.is_connected || emailConfigs?.is_connected) && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-[16px] text-amber-800">Email Authentication Required</div>
                  <p className="text-sm text-amber-700 mt-1">
                    The initial email connection (Outlook/Gmail) must be completed by{" "}
                    <span className="fw-bold">{configData?.first_name}</span> themselves. Once connected, you can
                    configure agent settings, thresholds, and manage candidate Gmail credentials.
                  </p>
                </div>
              </div>
            </div>
          )}

          {(emailConfigs?.connection?.is_connected || emailConfigs?.is_connected) && (
            <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-violet-700">
                  <p>
                    As an admin, you can configure agent settings, thresholds, and manage "Send from Candidate" Gmail
                    credentials for this team member.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <AIAgentsGrid isPopView data={allData} setemailConfigs={setemailConfigs} recruiter_email={recruiter_email} />

        {isConnected ? (
          <div className="flex justify-end p-3 my-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
            <button
              disabled={loading}
              onClick={saveConfigData}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-primary/90 h-10 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
            >
              <Save size={18} className="shrink-0" /> <span>Save Settings</span>
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  };

  return (
    <OverlayModal
      isActive={open}
      onClose={() => onClose()}
      style={{ maxWidth: "750px" }}
      modalStyle={{ background: "#fff", padding: "20px" }}
    >
      <div className="signatureContainer homepageFontfamily">
        <div className="d-flex align-items-center gap-2 justify-content-between">
          <div className="text-[18px] fw-semibold">
            Configure {configData?.first_name} {configData?.last_name}
          </div>
          <button className="hidemodalclosebtn pdfcontrollButtonsPDF" onClick={() => onClose()}>
            <X size={20} />
          </button>
        </div>
        <div className="text-[#67677e] mb-3">{configData?.recruiter_email}</div>

        {renderLoading()}
        {renderBodyContent()}
      </div>
    </OverlayModal>
  );
}

export default ConfigPopup;
