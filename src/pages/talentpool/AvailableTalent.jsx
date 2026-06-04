import React from "react";
import ActiveTalent from "./ActiveTalent";

function AvailableTalent() {
  return (
    <div>
      <ActiveTalent
        isAvailebleTalent={true}
        heading="Talent Pool / Available Talent"
        extraPayload={{ project_status: "on_bench" }}
        candidateAnalysis
        contactInfo
      />
    </div>
  );
}

export default AvailableTalent;
