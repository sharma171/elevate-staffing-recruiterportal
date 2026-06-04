import React, { useEffect, useState } from "react";
import OverlayModal from "../../../components/OverlayModal";
import images from "../../../assets/images/new";
import api from "../../../networking/api";
import { useAuth } from "../../../authContext";
import { ThemeLoader } from "../../../components";

const { addAI } = images;

function AiModal({ show, setshow, callback }) {
  const [description, setDescription] = useState("");
  const [loader, setLoader] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!show) {
      setDescription("");
    }
  }, [show]);

  if (!show) return null;

  function mapApiResponseToFormData(apiResponse = {}) {
    const result = {};

    const monday = String(apiResponse?.daily_work?.monday ?? "").trim();
    if (monday) result.monday_work = monday;

    const tuesday = String(apiResponse?.daily_work?.tuesday ?? "").trim();
    if (tuesday) result.tuesday_work = tuesday;

    const wednesday = String(apiResponse?.daily_work?.wednesday ?? "").trim();
    if (wednesday) result.wednesday_work = wednesday;

    const thursday = String(apiResponse?.daily_work?.thursday ?? "").trim();
    if (thursday) result.thursday_work = thursday;

    const friday = String(apiResponse?.daily_work?.friday ?? "").trim();
    if (friday) result.friday_work = friday;

    const accomplishments = Array.isArray(apiResponse?.accomplishments)
      ? apiResponse.accomplishments.join(", ")
      : String(apiResponse?.accomplishments ?? "").trim();
    if (accomplishments) result.accomplishments = accomplishments;

    const plannedItems = Array.isArray(apiResponse?.planned_items)
      ? apiResponse.planned_items.join(", ")
      : String(apiResponse?.planned_items ?? "").trim();
    if (plannedItems) result.planned_items = plannedItems;

    const issues = String(apiResponse?.issues?.potential_blockers ?? apiResponse?.issues ?? "").trim();

    if (issues) result.issues = issues;

    return result;
  }

  const handleGenerate = () => {
    const payload = {
      primary_email: user.email,
      work_description: description,
    };

    if (show?.project_name) {
      payload.project_name = show?.project_name;
    }

    if (show?.project_role) {
      payload.project_role = show?.project_role;
    }

    if (show?.client_name) {
      payload.client_name = show?.client_name;
    }

    if (show?.week_start_date) {
      payload.week_start_date = show?.week_start_date;
    }

    if (show?.week_end_date) {
      payload.week_end_date = show?.week_end_date;
    }

    setLoader(true);
    api
      .weeklyaistatus(payload)
      .then((res) => {
        setLoader(false);
        let newRes = mapApiResponseToFormData(res?.suggestions);
        callback?.(newRes);
        setshow(false);
      })
      .catch((err) => {
        setLoader(false);
        console.error("API Error:", err);
      });
  };

  return (
    <OverlayModal
      isActive={show}
      onClose={() => setshow(false)}
      modalStyle={{ background: "white" }}
      style={{ maxWidth: "650px" }}
    >
      <div>
        <div className="mb-5">
          <div className="themeColor h4">AI Content Generator</div>
          <div className="fontgray fs-6">
            Describe the work for the week, and our AI will generate content for your report.
          </div>
        </div>

        <div>
          <div className="mb-2">
            <label className="form-label text-dark fs-6">Work Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="inputBorder form-control"
              placeholder="Describe the work you did this week (e.g., implemented new features, fixed bugs)"
              style={{ resize: "none", boxShadow: "unset", border: "1px solid #d5d5d5" }}
            />
          </div>
          <div className="fontgray fs-6">
            Provide details about your tasks, projects, and achievements to get better results.
          </div>
        </div>

        <div className="d-flex justify-content-end gap-3 my-3 mt-4">
          <div className="themeButtonoutline" onClick={() => setshow(false)}>
            <span className="material-symbols-outlined">close</span>
            <span>Cancel</span>
          </div>

          <div className="themeButton" onClick={handleGenerate}>
            <img src={addAI} style={{ height: "16px" }} alt="Generate" />
            <span>Generate Content</span>
          </div>
        </div>
      </div>
      <ThemeLoader show={loader} />
    </OverlayModal>
  );
}

export default AiModal;
