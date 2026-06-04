import React, { useState } from "react";
import  SmartUploadButton  from "./SmartUploadButton";

const formatDateSafe = (dateString) => {
  if (!dateString) return "—";
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('en-US');
  }
  return new Date(dateString).toLocaleDateString('en-US');
};

const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const match = expiryDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const expiry = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const EditField = ({ label, value, onChange, type = "text", placeholder, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
    <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="h-8 w-full text-sm rounded-md border border-gray-300 px-3" placeholder={placeholder || `Enter ${label.toLowerCase()}`} />
  </div>
);

export default function GreenCardSection({ APIData, candidateEmail, candidateId, onSaveGC, onDeleteGC, onRefreshData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

const greenCardData =   APIData?.immigration?.green_card_data;

  const rawData = greenCardData || {};
  const data = {
    ...rawData,
    resident_since: rawData.resident_since || rawData.gc_card_received_date,
    card_expiry_date: rawData.card_expiry_date || rawData.gc_card_expiry_date,
    category: rawData.category || rawData.gc_category,
  };

  const daysUntilExpiry = getDaysUntilExpiry(data.card_expiry_date);
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 180;
  const hasCardData = !!(data.card_number || data.a_number || data.resident_since || data.card_expiry_date);

  const handleStartEdit = () => { setEditedData({ ...data }); setIsEditing(true); };
  const handleCancelEdit = () => { setEditedData({}); setIsEditing(false); };
  const handleSaveEdit = async () => {
    setIsSaving(true);
    try { await onSaveGC(editedData); await onRefreshData(); setIsEditing(false); }
    catch (e) { console.error('Error saving GC data:', e); }
    finally { setIsSaving(false); }
  };
  const handleFieldChange = (field, value) => setEditedData(prev => ({ ...prev, [field]: value }));

  const hasNoData = !hasCardData;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">💳</span>
          <h3 className="font-medium">Permanent Resident Card</h3>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button className="h-7 px-3 text-xs rounded-md border border-gray-300 hover:bg-gray-50" onClick={handleCancelEdit} disabled={isSaving}>✕ Cancel</button>
              <button className="h-7 px-3 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleSaveEdit} disabled={isSaving}>{isSaving ? 'Saving...' : '💾 Save'}</button>
            </>
          ) : (
            <>
              {!hasNoData && <button className="h-7 px-3 text-xs rounded-md border border-gray-300 hover:bg-gray-50" onClick={handleStartEdit}>✏️ Edit</button>}
              <SmartUploadButton documentType="gc_card" label="Smart Upload" candidateEmail={candidateEmail} candidateId={candidateId} onDataExtracted={() => {}} onRawDataExtracted={(raw, fi) => onSaveGC(raw, fi)} onRefreshData={onRefreshData} variant="outline" size="sm" className="h-7 text-xs" />
            </>
          )}
        </div>
      </div>

      {hasNoData && !isEditing ? (
        <div className="border border-dashed rounded-lg p-8 text-center text-gray-500">
          <p className="text-4xl mb-3 opacity-40">💳</p>
          <p className="font-medium mb-1">No Green Card Data</p>
          <p className="text-sm mb-4">Upload a Green Card to extract and store card details</p>
          <SmartUploadButton documentType="gc_card" label="Smart Upload Green Card" candidateEmail={candidateEmail} candidateId={candidateId} onDataExtracted={() => {}} onRawDataExtracted={(raw, fi) => onSaveGC(raw, fi)} onRefreshData={onRefreshData} variant="default" />
        </div>
      ) : (
        <div className={`p-4 border rounded-lg ${isExpired ? 'border-red-300' : 'border-indigo-200 bg-indigo-50'}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{data.card_number || 'Green Card'}</span>
              {isExpired ? (
                <span className="inline-flex items-center rounded-full bg-red-100 text-red-800 px-2.5 py-0.5 text-xs font-semibold">Expired</span>
              ) : isExpiringSoon ? (
                <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-xs font-semibold">⚠️ Expires in {daysUntilExpiry} days</span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-semibold">✅ Active</span>
              )}
              {data.category && <span className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-semibold">{data.category}</span>}
              {data.is_conditional && <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-xs font-semibold">⚠️ Conditional</span>}
            </div>
            {onDeleteGC && <button className="h-7 w-7 text-red-600 hover:bg-red-50 rounded" onClick={() => setShowDeleteDialog(true)}>🗑️</button>}
          </div>

          {isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <EditField label="Card Number" value={editedData.card_number} onChange={(v) => handleFieldChange('card_number', v)} placeholder="USCXXXXXXX" />
              <EditField label="A-Number" value={editedData.a_number} onChange={(v) => handleFieldChange('a_number', v)} placeholder="A123456789" />
              <EditField label="Category" value={editedData.category} onChange={(v) => handleFieldChange('category', v)} placeholder="EB2, IR1, etc." />
              <EditField label="Country of Birth" value={editedData.country_of_birth} onChange={(v) => handleFieldChange('country_of_birth', v)} />
              <EditField label="Resident Since" value={editedData.resident_since} onChange={(v) => handleFieldChange('resident_since', v)} type="date" />
              <EditField label="Card Expires" value={editedData.card_expiry_date} onChange={(v) => handleFieldChange('card_expiry_date', v)} type="date" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {data.card_holder_name && <div><p className="text-xs text-gray-500">Card Holder</p><p className="font-medium">{data.card_holder_name}</p></div>}
              {data.a_number && <div><p className="text-xs text-gray-500">A-Number</p><p className="font-medium">{data.a_number}</p></div>}
              <div><p className="text-xs text-gray-500">Resident Since</p><p className="font-medium">{formatDateSafe(data.resident_since)}</p></div>
              <div><p className="text-xs text-gray-500">Card Expires</p><p className={`font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : ''}`}>{formatDateSafe(data.card_expiry_date)}</p></div>
              {data.country_of_birth && <div><p className="text-xs text-gray-500">Country of Birth</p><p className="font-medium">{data.country_of_birth}</p></div>}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Green Card Data</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this Green Card data? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50" onClick={() => setShowDeleteDialog(false)}>Cancel</button>
              <button className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700" onClick={async () => { if (onDeleteGC) { await onDeleteGC(); setShowDeleteDialog(false); } }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
