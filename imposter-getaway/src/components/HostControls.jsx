import React from "react";
import { assignRoles } from "../utils/assignRoles";

export default function HostControls() {
  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={assignRoles} style={{ padding: "10px 20px", fontSize: 16 }}>
        Start Game & Assign Roles
      </button>
    </div>
  );
}
