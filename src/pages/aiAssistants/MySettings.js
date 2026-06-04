import React, { useEffect, useState } from "react";
import { Mail, CheckCircle2, Unlink, TriangleAlert, Briefcase, Building2, Send, Save } from "lucide-react";
import { SiGmail } from "react-icons/si";
import { PiMicrosoftOutlookLogoFill } from "react-icons/pi";
import { useAuth } from "../../authContext";
import { axiosApi } from "../../components";
import { toast } from "react-toastify";
import EmailInput from "../companymanagement/EmailInput";
import GmailCredentials, { Skeleton } from "./GmailCredentials";

const BASE_URL = "https://recruiter-ai-agents-config-api-v1-305451280005.us-east1.run.app/";

function EmailIntegrationCard({ data, refresh, setEmailConfData, setConnectEmail }) {
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  let adminEmail = user?.email;

  const emailConnection = data?.connection || {};
  const email = emailConnection?.connected_email;
  const provider = emailConnection?.provider;
  const isConnected = emailConnection?.is_connected;

  const disconnectEmail = () => {
    const payload = {
      action: "unlink_integration",
      requesting_user_email: adminEmail,
    };

    setLoading(true);

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        toast.success(res?.data?.message);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Failed to disconnect email");
      })
      .finally(() => {
        refresh();
        setLoading(false);
      });
  };

  const connectEmail = (provider) => {
    setEmailConfData({ oauth2_config: provider });
    setConnectEmail(true);
  };

  return (
    <div className="rounded-lg shadow-[0_1px_2px_0_rgb(0_0_0_/_0.05)] ring-2 ring-[#ede9fe] bg-gradient-to-br from-[#f5f3ff80] to-[#faf5ff80]">
      <div className="p-3 pb-2 space-y-1.5">
        <h3 className="text-2xl font-semibold flex items-center gap-2 text-[#6D28D9]">
          <Mail className="h-5 w-5" />
          Email Integration
        </h3>
        <p className="text-sm text-[#6B7280]">
          Connect your email account to enable AI agents. This uses the same OAuth flow as your company email
          configuration.
        </p>
      </div>

      <div className="p-3 pt-0 space-y-4">
        {isConnected ? (
          <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-[#059669]" />
              </div>

              <div>
                <p className="text-sm font-medium text-[#065F46]">Connected Successfully</p>
                <p className="text-sm text-[#047857]">{email}</p>
              </div>

              <span className="ml-2 inline-flex items-center rounded-md border border-[#6EE7B7] px-2.5 py-0.5 text-xs font-semibold text-[#047857] capitalize">
                {provider}
              </span>
            </div>

            <button
              onClick={disconnectEmail}
              disabled={loading}
              className="inline-flex items-center h-10 px-3 py-2 rounded-[10px] ring-1 ring-[#fecaca] text-sm font-medium bg-white text-[#DC2626] hover:!bg-[#FEF2F2] disabled:opacity-50"
            >
              <Unlink className="h-4 w-4 mr-2" />
              {loading ? "Disconnecting…" : "Disconnect"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[#fffbeb] border border-[#fde68a]">
              <div className="flex items-start gap-3">
                <TriangleAlert className="h-5 w-5 text-[#D97706] mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#92400E] mb-0">Connection Required</p>
                  <p className="text-sm text-[#B45309] mt-0">
                    You need to connect an email account before enabling AI agents. Choose your provider below.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                disabled={loading}
                onClick={() => {
                  connectEmail("microsoft");
                }}
                className="h-auto bg-[#fff] py-4 flex flex-col items-center gap-2 ring-2 ring-[#e7e7ef] rounded-md hover:ring-[#60A5FA] hover:bg-[#EFF6FF]"
              >
                <PiMicrosoftOutlookLogoFill size={20} />

                <span className="font-medium">Connect Outlook</span>
                <span className="text-xs text-[#6B7280]">Microsoft 365 / Outlook</span>
              </button>

              <button
                disabled={loading}
                onClick={() => {
                  connectEmail("google");
                }}
                className="h-auto bg-[#fff] py-4 flex flex-col items-center gap-2 ring-2 ring-[#e7e7ef] rounded-md hover:ring-[#F87171] hover:bg-[#FEF2F2]"
              >
                <SiGmail size={20} className="text-danger" />

                <span className="font-medium">Connect Gmail</span>
                <span className="text-xs text-[#6B7280]">Google Workspace</span>
              </button>
            </div>

            <p className="text-xs text-[#6B7280] text-center">
              You'll be redirected to authenticate with your email provider. This uses the same secure OAuth flow as
              your company email settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AIAgentsGrid({ data, setemailConfigs, isPopView, recruiter_email }) {
  const [jobAgentEnabled, setJobAgentEnabled] = useState(false);
  const [vendorAgentEnabled, setVendorAgentEnabled] = useState(false);
  const [confirmAutoSendFor, setConfirmAutoSendFor] = useState(null);

  const [jobConfig, setJobConfig] = useState({
    submissionMode: "review",
    threshold: 70,
    maxCandidates: 3,
    lookbackDays: 6,
    sendFromCandidate: false,
  });

  const [vendorConfig, setVendorConfig] = useState({
    submissionMode: "review",
    threshold: 60,
    maxPerCompany: 4,
    discovery: false,
    sendFromCandidate: false,
  });

  const configData = data?.config || {};

  const emailConnection = data?.connection || {};
  const emailConnected = emailConnection?.is_connected;

  useEffect(() => {
    setemailConfigs({
      job: { ...jobConfig, jobAgentEnabled: jobAgentEnabled },
      vendor: { ...vendorConfig, vendorAgentEnabled: vendorAgentEnabled },
    });
  }, [JSON.stringify(vendorConfig), JSON.stringify(jobConfig), jobAgentEnabled, vendorAgentEnabled]);

  useEffect(() => {
    if (emailConnected) {
      setVendorConfig({
        submissionMode: configData?.vendor_outreach_mode || "review",
        threshold: configData?.vendor_match_threshold || 60,
        maxPerCompany: configData?.vendor_max_per_company || 3,
        discovery: configData?.vendor_discovery_enabled,
        sendFromCandidate: configData?.send_from_candidate_vendor_outreach,
      });
      setJobConfig({
        submissionMode: configData?.job_matching_mode || "review",
        threshold: configData?.job_match_threshold || 60,
        maxCandidates: configData?.job_max_candidates_per_job || 3,
        lookbackDays: configData?.job_lookback_days || 6,
        sendFromCandidate: configData?.send_from_candidate_job_matching,
      });
      setVendorAgentEnabled(!!configData?.vendor_outreach_enabled);
      setJobAgentEnabled(!!configData?.job_matching_enabled);
    }
  }, [JSON.stringify(configData)]);

  const toggleJobAgent = () => {
    if (!emailConnected) return;
    setJobAgentEnabled(!jobAgentEnabled);
  };

  const toggleVendorAgent = () => {
    if (!emailConnected) return;
    setVendorAgentEnabled(!vendorAgentEnabled);
  };

  const renderEmailConfigView = () => {
    if (!jobConfig?.sendFromCandidate && !vendorConfig?.sendFromCandidate) {
      return;
    }

    return (
      <div className="my-4">
        <GmailCredentials recruiter_email={recruiter_email} jobConfig={jobConfig} vendorConfig={vendorConfig} />
      </div>
    );
  };

  const renderInnerView = (enabled, config, setConfig, type) => {
    if (!enabled) return <></>;

    return (
      <div className="p-6 pt-0 space-y-4">
        <div className="space-y-3">
          <p className="text-sm font-medium">Submission Mode</p>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm pointer fw-medium">
              <input
                type="radio"
                checked={config.submissionMode === "review"}
                onChange={() => setConfig({ ...config, submissionMode: "review" })}
              />
              Review first
            </label>

            <label className="flex items-center gap-2 text-sm pointer fw-medium">
              <input
                type="radio"
                checked={config.submissionMode === "auto"}
                onChange={() => setConfirmAutoSendFor(type)}
              />
              Auto-send
              <TriangleAlert className="h-3 w-3 text-[#F59E0B]" />
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">
            Match Threshold: <strong>{config.threshold}%</strong>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={config.threshold}
            onChange={(e) => setConfig({ ...config, threshold: Number(e.target.value) })}
            className="w-full accent-[#7c3bed]"
          />
        </div>

        {"maxPerCompany" in config && (
          <div>
            <label className="text-xs font-medium">Max per Company</label>

            <div>
              <input
                type="number"
                min="1"
                max="10"
                value={config.maxPerCompany}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    maxPerCompany: Number(e.target.value),
                  })
                }
                className="bigHoverInput form-control max-w-[120px]"
              />
            </div>
          </div>
        )}

        {"discovery" in config && !isPopView && (
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Vendor Discovery</label>

            <button
              onClick={() =>
                setConfig({
                  ...config,
                  discovery: !config.discovery,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                config.discovery ? "bg-[#7c3bed]" : "bg-[#E5E7EB]"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  config.discovery ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        )}

        {"lookbackDays" in config || "maxCandidates" in config ? (
          <div className="grid grid-cols-2 gap-3">
            {"maxCandidates" in config && (
              <div>
                <label className="fw-semibold mb-1">Max Candidates</label>
                <div>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.maxCandidates}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        maxCandidates: Number(e.target.value),
                      })
                    }
                    className="bigHoverInput form-control"
                    placeholder="Max Candidates"
                  />
                </div>
              </div>
            )}

            {"lookbackDays" in config && (
              <div>
                <label className="fw-semibold mb-1">Lookback Days</label>
                <div className="w-100">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={config.lookbackDays}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        lookbackDays: Number(e.target.value),
                      })
                    }
                    className="bigHoverInput form-control"
                    placeholder="Lookback Days"
                  />{" "}
                </div>
              </div>
            )}
          </div>
        ) : (
          <></>
        )}

        <div className="pt-3 border-t border-[#dbeafe] shadow-[0_-1px_0_0_#dbeafe] flex items-center justify-between">
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              <Send className="h-4 w-4 text-[#2563EB]" />
              Send from candidate email
            </p>
            <p className="text-xs text-[#6B7280]">Emails are sent from candidate Gmail if configured</p>
          </div>

          <button
            onClick={() =>
              setConfig({
                ...config,
                sendFromCandidate: !config.sendFromCandidate,
              })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              config.sendFromCandidate ? "bg-[#3B82F6]" : "bg-[#E5E7EB]"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                config.sendFromCandidate ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`grid grid-cols-1 ${isPopView ? "" : "lg:grid-cols-2"} gap-6`}>
        <div
          className={`rounded-lg ring-2 transition-all ${
            emailConnected
              ? jobAgentEnabled
                ? "ring-[#bfdbfe] bg-[#eff6ff4d]"
                : "ring-[#f3f4f6] bg-white"
              : "ring-[#f3f4f6]"
          }`}
        >
          <div className="p-4 pb-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold flex items-center gap-2 text-[#1D4ED8]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBEAFE]">
                  <Briefcase className="h-5 w-5 text-[#2563EB]" />
                </div>
                Job Matching Agent
              </h3>

              <button
                onClick={toggleJobAgent}
                disabled={!emailConnected}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  jobAgentEnabled ? "bg-[#3B82F6]" : "bg-[#E5E7EB]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    jobAgentEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <p className="text-sm text-[#6B7280]">
              Scans your inbox for job requirements and matches candidates automatically.
            </p>
          </div>

          {renderInnerView(jobAgentEnabled, jobConfig, setJobConfig, "job")}
        </div>

        <div
          className={`rounded-lg ring-2 transition-all ${
            emailConnected
              ? vendorAgentEnabled
                ? "ring-[#a7f3d0] bg-[#ecfdf54d]"
                : "ring-[#f3f4f6] bg-white"
              : "ring-[#f3f4f6]"
          }`}
        >
          <div className="p-6 pb-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold flex items-center gap-2 text-[#047857]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D1FAE5]">
                  <Building2 className="h-5 w-5 text-[#059669]" />
                </div>
                Vendor Outreach Agent
              </h3>

              <button
                onClick={toggleVendorAgent}
                disabled={!emailConnected}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  vendorAgentEnabled ? "bg-[#10B981]" : "bg-[#E5E7EB]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    vendorAgentEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <p className="text-sm text-[#6B7280]">Searches jobs database and reaches out to vendor contacts.</p>
          </div>

          {renderInnerView(vendorAgentEnabled, vendorConfig, setVendorConfig, "vendor")}
        </div>
      </div>
      {confirmAutoSendFor && (
        <>
          <div className="fixed inset-0 z-50 bg-black/25" />

          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-6 shadow-lg">
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TriangleAlert className="h-5 w-5 text-yellow-500" />
                Enable Auto-send?
              </h2>
              <p className="text-sm text-muted-foreground text-left">
                Auto-send will immediately send emails without your review. Are you sure?
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 align-center gap-2">
              <button
                className="sm:mt-0 h-10 px-4 py-2 border rounded-md bg-transparent hover:!bg-[#3c83f6] hover:!text-[#fff]"
                onClick={() => setConfirmAutoSendFor(null)}
              >
                Cancel
              </button>

              <button
                className="h-10 px-4 py-2 rounded-md bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                onClick={() => {
                  if (confirmAutoSendFor === "job") {
                    setJobConfig({
                      ...jobConfig,
                      submissionMode: "auto",
                    });
                  }

                  if (confirmAutoSendFor === "vendor") {
                    setVendorConfig({
                      ...vendorConfig,
                      submissionMode: "auto",
                    });
                  }

                  setConfirmAutoSendFor(null);
                }}
              >
                Enable
              </button>
            </div>
          </div>
        </>
      )}
      {renderEmailConfigView()}
    </>
  );
}

function MySettings() {
  const [resData, setResData] = useState({});
  const [loading, setloading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [connectEmail, setConnectEmail] = useState(false);
  const [emailConfData, setEmailConfData] = useState({ oauth2_config: "google" });
  const [emailConfigs, setemailConfigs] = useState({});

  const { user } = useAuth();

  let adminEmail = user?.email;

  const emailConnection = resData?.connection || {};
  const isConnected = emailConnection?.is_connected;
  const settingsConfig = resData?.config || {};

  useEffect(() => {
    getData();
  }, [adminEmail]);

  const getData = () => {
    let payload = {
      action: "get_my_config",
      requesting_user_email: adminEmail,
    };

    setloading(true);

    axiosApi
      .post(BASE_URL, payload)
      .then((res) => {
        setResData(res?.data || {});
      })
      .catch((err) => {
        console.log(err, "ssssssss");
      })
      .finally(() => setloading(false));
  };

  const saveConfigData = () => {
    if (saveLoading) {
      return;
    }

    const payload = {
      action: "update_my_config",
      requesting_user_email: adminEmail,
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
    setSaveLoading(true);
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
        setSaveLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="space-y-4 py-3 px-1">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (connectEmail) {
    return (
      <EmailInput
        REDIRECT_URI_PATH="/auth/aiassistant"
        goBakc={() => setConnectEmail(false)}
        emailConfData={emailConfData}
      />
    );
  }

  return (
    <div className="py-3">
      <EmailIntegrationCard
        data={resData}
        refresh={getData}
        setEmailConfData={setEmailConfData}
        setConnectEmail={setConnectEmail}
      />

      <div className="mt-4">
        <AIAgentsGrid data={resData} refresh={getData} setemailConfigs={setemailConfigs} />

        {isConnected ? (
          <div className="flex justify-end p-3 my-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
            <button
              disabled={saveLoading}
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
    </div>
  );
}

export default MySettings;
