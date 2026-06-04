import React, { useState } from "react";
import { getStatusConfig, formatDateSafe, getPetitionTypeLabel, formatCapStatus, calculateDaysSince } from "./petitionStatusConfig";
import { ApprovedDatesSection, PendingDatesSection, RFEDatesSection, DeniedDatesSection, WithdrawnDatesSection } from "./PetitionDatesSections";
import { PetitionActions } from "./PetitionActions";

// Helper functions for nested data access
const getBeneficiaryName = (p) => p.beneficiary_data?.name || p.beneficiary_name;
const getBeneficiaryANumber = (p) => p.beneficiary_data?.a_number || p.beneficiary_a_number;
const getBeneficiaryDOB = (p) => p.beneficiary_data?.dob || p.beneficiary_dob;
const getBeneficiaryCountry = (p) => p.beneficiary_data?.country_of_birth || p.beneficiary_country_of_birth;
const getI94Number = (p) => p.i94_data?.i94_number || p.i94_number;
const getI94Class = (p) => p.i94_data?.i94_class || p.i94_class;
const getI94Start = (p) => p.i94_data?.i94_validity_start || p.i94_validity_start;
const getI94End = (p) => p.i94_data?.i94_validity_end || p.i94_expiry;

const PETITION_TYPES = [
  { value: "initial", label: "Initial" },
  { value: "extension", label: "Extension" },
  { value: "amendment", label: "Amendment" },
  { value: "transfer", label: "Transfer" },
  { value: "concurrent", label: "Concurrent" },
];

const PETITION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rfe", label: "RFE" },
  { value: "denied", label: "Denied" },
  { value: "withdrawn", label: "Withdrawn" },
];

const EditField = ({ label, value, onChange, type = "text", placeholder, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
    <input type={type} value={value?.toString() || ""} onChange={(e) => onChange(e.target.value)} className="h-8 w-full text-sm border rounded-md px-2" placeholder={placeholder} />
  </div>
);

const SelectField = ({ label, value, options, onChange, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
    <select value={value || "none"} onChange={(e) => onChange(e.target.value)} className="h-8 w-full text-sm border rounded-md px-2">
      <option value="none">Select...</option>
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

export function PetitionStatusCard({
  petition,
  isCurrent,
  currentPetition,
  linkedLCA,
  lcaHistory = [],
  isEditing = false,
  hasOtherPetitions = false,
  candidateEmail,
  candidateId,
  onAction,
  onI797DataExtracted,
  onSaveI797,
  onRefreshData,
  onPetitionChange,
  onLinkLCA,
}) {
  const statusConfig = getStatusConfig(petition.status);
  const isPending = petition.status === "pending";
  const isRFE = petition.status === "rfe";
  const isApproved = petition.status === "approved";
  const isDenied = petition.status === "denied";
  const isWithdrawn = petition.status === "withdrawn";
  const isInProgress = isPending || isRFE;
  const daysPending = calculateDaysSince(petition.filed_date);

  const [isLinking, setIsLinking] = useState(false);
  const [showLCADropdown, setShowLCADropdown] = useState(false);

  const useCurrentStyle = isCurrent && isApproved;
  const availableLCAs = lcaHistory.filter((lca) => lca.status === "certified");

  const handleLinkLCA = async (lcaId) => {
    if (!onLinkLCA || lcaId === "none") return;
    setIsLinking(true);
    try { await onLinkLCA(petition.id, lcaId); setShowLCADropdown(false); } finally { setIsLinking(false); }
  };

  const handleFieldChange = (field, value) => {
    if (onPetitionChange) onPetitionChange({ ...petition, [field]: value });
  };

  const handleBeneficiaryChange = (field, value) => {
    const beneficiary_data = { ...(petition.beneficiary_data || {}), [field]: value };
    handleFieldChange("beneficiary_data", beneficiary_data);
  };

  const handleI94Change = (field, value) => {
    const i94_data = { ...(petition.i94_data || {}), [field]: value };
    handleFieldChange("i94_data", i94_data);
  };

  // ─── EDIT MODE ───
  if (isEditing) {
    return (
      <div className={`border rounded-lg p-4 space-y-4 ${isCurrent ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-gray-50"}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {isCurrent ? <span className="inline-flex items-center rounded-full bg-indigo-600 text-white px-2 py-0.5 text-xs">CURRENT</span> : <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-gray-500">{petition.status?.toUpperCase() || "PETITION"}</span>}
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs">Edit Mode</span>
            {petition.premium_processing && <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 text-amber-700 px-2 py-0.5 text-xs">⚡ Premium</span>}
          </div>
          <PetitionActions petition={petition} isCurrent={isCurrent} isEditing={isEditing} hasOtherPetitions={hasOtherPetitions} candidateEmail={candidateEmail} candidateId={candidateId} onAction={onAction} onI797DataExtracted={onI797DataExtracted} onSaveI797={onSaveI797} onRefreshData={onRefreshData} />
        </div>

        {/* Core Fields */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EditField label="Receipt Number" value={petition.receipt_number} onChange={(v) => handleFieldChange("receipt_number", v)} />
          <SelectField label="Petition Type" value={petition.petition_type} options={PETITION_TYPES} onChange={(v) => handleFieldChange("petition_type", v)} />
          <SelectField label="Status" value={petition.status} options={PETITION_STATUSES} onChange={(v) => handleFieldChange("status", v)} />
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-2 h-8">
              <input type="checkbox" id={`premium-${petition.id}`} checked={petition.premium_processing || false} onChange={(e) => handleFieldChange("premium_processing", e.target.checked)} className="rounded" />
              <label htmlFor={`premium-${petition.id}`} className="text-sm">Premium Processing</label>
            </div>
          </div>
        </div>

        {/* Employer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <EditField label="Employer Name" value={petition.employer_name} onChange={(v) => handleFieldChange("employer_name", v)} className="col-span-2" />
          <EditField label="Employer FEIN" value={petition.employer_fein} onChange={(v) => handleFieldChange("employer_fein", v)} />
          <EditField label="Classification" value={petition.classification} onChange={(v) => handleFieldChange("classification", v)} />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <EditField label="Filed Date" value={petition.filed_date} type="date" onChange={(v) => handleFieldChange("filed_date", v)} />
          <EditField label="Notice Date" value={petition.notice_date} type="date" onChange={(v) => handleFieldChange("notice_date", v)} />
          <EditField label="Approval Date" value={petition.approval_date} type="date" onChange={(v) => handleFieldChange("approval_date", v)} />
          <EditField label="Valid From" value={petition.validity_start} type="date" onChange={(v) => handleFieldChange("validity_start", v)} />
          <EditField label="Valid To" value={petition.validity_end} type="date" onChange={(v) => handleFieldChange("validity_end", v)} />
        </div>

        {/* Beneficiary */}
        <div className="p-3 bg-white rounded-lg border space-y-3">
          <div className="flex items-center gap-2"><span className="text-gray-500">👤</span><span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Beneficiary</span></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <EditField label="Name" value={petition.beneficiary_data?.name || petition.beneficiary_name} onChange={(v) => handleBeneficiaryChange("name", v)} />
            <EditField label="A-Number" value={petition.beneficiary_data?.a_number || petition.beneficiary_a_number} onChange={(v) => handleBeneficiaryChange("a_number", v)} />
            <EditField label="Date of Birth" value={petition.beneficiary_data?.dob || petition.beneficiary_dob} type="date" onChange={(v) => handleBeneficiaryChange("dob", v)} />
            <EditField label="Country of Birth" value={petition.beneficiary_data?.country_of_birth || petition.beneficiary_country_of_birth} onChange={(v) => handleBeneficiaryChange("country_of_birth", v)} />
          </div>
        </div>

        {/* I-94 */}
        <div className="p-3 bg-white rounded-lg border space-y-3">
          <div className="flex items-center gap-2"><span className="text-gray-500">📄</span><span className="text-xs font-medium text-gray-500 uppercase tracking-wide">I-94 Information</span></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <EditField label="I-94 Number" value={petition.i94_data?.i94_number || petition.i94_number} onChange={(v) => handleI94Change("i94_number", v)} />
            <EditField label="Class of Admission" value={petition.i94_data?.i94_class || petition.i94_class} onChange={(v) => handleI94Change("i94_class", v)} />
            <EditField label="Valid From" value={petition.i94_data?.i94_validity_start || petition.i94_validity_start} type="date" onChange={(v) => handleI94Change("i94_validity_start", v)} />
            <EditField label="Valid To" value={petition.i94_data?.i94_validity_end || petition.i94_expiry} type="date" onChange={(v) => handleI94Change("i94_validity_end", v)} />
          </div>
        </div>

        {/* LCA Linking */}
        <div className="p-3 bg-white rounded-lg border space-y-3">
          <div className="flex items-center gap-2"><span className="text-gray-500">🔗</span><span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Linked LCA</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Select LCA</label>
              <select value={petition.lca_id || "none"} onChange={(e) => handleFieldChange("lca_id", e.target.value === "none" ? null : e.target.value)} className="h-8 w-full text-sm border rounded-md px-2">
                <option value="none">Not linked</option>
                {availableLCAs.map((lca) => <option key={lca.id} value={lca.id}>{lca.case_number} — {lca.job_title || "N/A"}</option>)}
              </select>
            </div>
            {linkedLCA && <div className="text-xs text-gray-500 pt-6">{linkedLCA.status} • Valid: {formatDateSafe(linkedLCA.validity_start)} → {formatDateSafe(linkedLCA.validity_end)}</div>}
          </div>
        </div>

        {/* Cap Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SelectField label="Cap Status" value={petition.cap_status || ""} options={[{ value: "cap_exempt", label: "Cap Exempt" }, { value: "cap_exempt_masters", label: "Cap Exempt (Masters)" }, { value: "cap_subject", label: "Cap Subject" }]} onChange={(v) => handleFieldChange("cap_status", v === "none" ? undefined : v)} />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
          <textarea value={petition.notes || ""} onChange={(e) => handleFieldChange("notes", e.target.value)} className="w-full text-sm min-h-[60px] border rounded-md px-3 py-2" placeholder="Add any notes..." />
        </div>
      </div>
    );
  }

  // ─── VIEW MODE ───
  const statusBg = useCurrentStyle ? "border-indigo-300 bg-indigo-50" : (statusConfig.headerBg || "");
  const headerBg = useCurrentStyle ? "" : (statusConfig.headerBg || "");

  return (
    <div className={`border rounded-lg overflow-hidden ${statusBg}`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${headerBg}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span>{statusConfig.icon || "📋"}</span>
          <span className="font-semibold text-sm">{isCurrent ? "CURRENT" : statusConfig.headerLabel}</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${statusConfig.badgeClass || "bg-gray-100"}`}>{statusConfig.label}</span>
          {petition.premium_processing && <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 text-amber-700 px-2 py-0.5 text-xs">⚡ Premium</span>}
          {isInProgress && daysPending !== null && <span className="text-xs text-gray-500 ml-2">⏱️ {daysPending} days since filing</span>}
        </div>
        <PetitionActions petition={petition} isCurrent={isCurrent} isEditing={isEditing} hasOtherPetitions={hasOtherPetitions} candidateEmail={candidateEmail} candidateId={candidateId} onAction={onAction} onI797DataExtracted={onI797DataExtracted} onSaveI797={onSaveI797} onRefreshData={onRefreshData} />
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 bg-white">
        {/* Core Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><span className="text-xs text-gray-500 block">Receipt Number</span><span className="font-mono font-semibold text-sm">{petition.receipt_number || "—"}</span></div>
          <div><span className="text-xs text-gray-500 block">Type / Classification</span><span className="text-sm capitalize">{getPetitionTypeLabel(petition.petition_type)} | {petition.classification || "H-1B"}</span></div>
          <div className="col-span-2">
            <span className="text-xs text-gray-500 block">Employer</span>
            <span className="text-sm font-medium">{petition.employer_name || "—"}</span>
            {petition.employer_fein && <span className="text-xs text-gray-500 ml-2">(FEIN: {petition.employer_fein})</span>}
            {petition.employer_address && <div className="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{petition.employer_address}</div>}
          </div>
        </div>

        {/* Status-specific dates */}
        {isApproved && <ApprovedDatesSection petition={petition} />}
        {isPending && <PendingDatesSection petition={petition} />}
        {isRFE && <RFEDatesSection petition={petition} />}
        {isDenied && <DeniedDatesSection petition={petition} />}
        {isWithdrawn && <WithdrawnDatesSection petition={petition} />}

        {/* In-Progress Available Info */}
        {isInProgress && (
          <div className="p-3 bg-gray-50 rounded-lg border space-y-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">What's Available</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-xs text-gray-500 flex items-center gap-1">🔗 LCA</span>
                {linkedLCA ? <span className="font-mono text-xs">{linkedLCA.case_number} ({linkedLCA.status})</span> : petition.linked_lca_number ? <span className="font-mono text-xs">{petition.linked_lca_number}</span> : <span className="text-xs text-gray-400 italic">⚠️ Not linked</span>}
              </div>
              {getBeneficiaryName(petition) && <div><span className="text-xs text-gray-500">Beneficiary</span><div className="text-xs">{getBeneficiaryName(petition)}{getBeneficiaryANumber(petition) && <span className="text-gray-500 ml-1">({getBeneficiaryANumber(petition)})</span>}</div></div>}
              {petition.job_title && <div><span className="text-xs text-gray-500">Position</span><div className="text-xs">{petition.job_title}{petition.soc_code && <span className="text-gray-500 ml-1">(SOC: {petition.soc_code})</span>}</div></div>}
            </div>
          </div>
        )}

        {/* Beneficiary Info (approved) */}
        {isApproved && getBeneficiaryName(petition) && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-1"><span className="text-gray-500">👤</span><span className="text-xs text-gray-500">Beneficiary</span></div>
            <div className="font-medium text-sm">{getBeneficiaryName(petition)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {getBeneficiaryANumber(petition) && <span>A# {getBeneficiaryANumber(petition)} • </span>}
              {getBeneficiaryDOB(petition) && <span>DOB: {formatDateSafe(getBeneficiaryDOB(petition))} • </span>}
              {getBeneficiaryCountry(petition)}
            </div>
          </div>
        )}

        {/* I-94 Info (approved) */}
        {isApproved && getI94Number(petition) && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-1"><span className="text-gray-500">📄</span><span className="text-xs text-gray-500">I-94 Information</span></div>
            <div className="font-mono text-sm font-medium">{getI94Number(petition)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {getI94Class(petition) && <span>Class: {getI94Class(petition)} • </span>}
              Valid: {formatDateSafe(getI94Start(petition))} → {formatDateSafe(getI94End(petition))}
            </div>
          </div>
        )}

        {/* Linked LCA Details */}
        {linkedLCA ? (
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2"><span className="text-indigo-600">🔗</span><span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Linked LCA</span></div>
              {onLinkLCA && <button className="text-xs text-indigo-600 hover:underline" onClick={() => setShowLCADropdown(true)}>Change</button>}
            </div>
            <div className="font-mono text-sm font-medium">{linkedLCA.case_number}</div>
            <div className="text-xs text-gray-500 mt-1">
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs mr-2 capitalize">{linkedLCA.status}</span>
              Valid: {formatDateSafe(linkedLCA.validity_start)} → {formatDateSafe(linkedLCA.validity_end)}
            </div>
            {(linkedLCA.job_title || linkedLCA.soc_code) && (
              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-indigo-100">
                <div><span className="text-xs text-gray-500 block">Job Title</span><div className="text-sm font-medium">{linkedLCA.job_title || "—"}</div></div>
                <div><span className="text-xs text-gray-500 block">SOC Code</span><div className="text-sm font-medium">{linkedLCA.soc_code || "—"}</div></div>
                <div><span className="text-xs text-gray-500 block">SOC Title</span><div className="text-sm font-medium">{linkedLCA.soc_title || "—"}</div></div>
              </div>
            )}
            {linkedLCA.worksites?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-indigo-100 space-y-2">
                <span className="text-xs text-gray-500 flex items-center gap-1">📍 Worksites ({linkedLCA.worksites.length})</span>
                {linkedLCA.worksites.map((ws, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs bg-white p-2 rounded">
                    <span className="text-gray-500 mt-0.5">🏢</span>
                    <div className="flex-1">
                      <div className="font-medium">{ws.worksite_name || "Worksite"}</div>
                      <div className="text-gray-500">{[ws.address_line1, ws.city, ws.state, ws.zip_code].filter(Boolean).join(", ")}</div>
                      {linkedLCA.actual_wage && (
                        <div className="text-gray-500 mt-1">💰 ${Number(linkedLCA.actual_wage).toLocaleString()}/{linkedLCA.wage_unit || "year"}
                          {linkedLCA.prevailing_wage && <span className="ml-2">• Prevailing: ${Number(linkedLCA.prevailing_wage).toLocaleString()}</span>}
                          {linkedLCA.wage_level && <span className="ml-2">• {linkedLCA.wage_level.replace("_", " ").replace("level", "Level")}</span>}
                        </div>
                      )}
                    </div>
                    {ws.is_primary && <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs">Primary</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : showLCADropdown || (!linkedLCA && availableLCAs.length > 0) ? (
          <div className="p-3 bg-gray-50 rounded-lg border border-dashed">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><span className="text-gray-500">🔗</span><span className="text-sm text-gray-500">LCA: Not linked</span></div>
              <select value="none" onChange={(e) => handleLinkLCA(e.target.value)} disabled={isLinking} className="w-[280px] h-8 text-sm border rounded-md px-2">
                <option value="none">{isLinking ? "Linking..." : "Link LCA..."}</option>
                {availableLCAs.map((lca) => <option key={lca.id} value={lca.id}>{lca.case_number} — {lca.job_title || "N/A"}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border border-dashed">
            <div className="flex items-center gap-2"><span className="text-gray-500">🔗</span><span className="text-sm text-gray-500">LCA: Not linked</span><span className="text-xs text-gray-400 italic">⚠️ No certified LCAs available</span></div>
          </div>
        )}

        {/* Cap Status */}
        {isApproved && petition.cap_status && (
          <div className="flex items-center gap-2 text-sm"><span className="text-gray-500">🎓</span><span className="text-xs text-gray-500">Cap Status:</span><span className="text-xs font-medium">{formatCapStatus(petition.cap_status)}</span></div>
        )}

        {/* Context Messages */}
        {isInProgress && currentPetition && currentPetition.id !== petition.id && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">ℹ️</span>
            <div className="text-sm text-blue-800">Current petition ({currentPetition.receipt_number}) remains active. Candidate can continue working under the approved petition.</div>
          </div>
        )}
        {isRFE && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
            <span className="text-orange-600 mt-0.5">⚠️</span>
            <div className="text-sm text-orange-800"><strong>RFE Received:</strong> USCIS has requested additional evidence. Typical RFE response deadline is 87 days.</div>
          </div>
        )}
        {isDenied && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="text-red-600 mt-0.5">⚠️</span>
            <div className="text-sm text-red-800">This petition was denied. Review denial notice for options (appeal, motion to reopen, new filing).</div>
          </div>
        )}

        {/* Notes */}
        {petition.notes && (
          <div className="pt-3 border-t"><span className="text-xs text-gray-500 block mb-1">Notes</span><p className="text-sm text-gray-500">{petition.notes}</p></div>
        )}
      </div>
    </div>
  );
}
