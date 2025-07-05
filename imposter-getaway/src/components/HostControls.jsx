import React from "react";
import { assignRoles } from "../utils/assignRoles";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { scorePlayers } from "../utils/scorePlayers";

export default function HostControls() {
  const handleCalculateAndShowResults = async () => {
    const confirm = window.confirm(
      "This will calculate all scores and immediately reveal results to all players. Continue?"
    );
    if (!confirm) return;

    try {
      // 1️⃣ Run scoring
      await scorePlayers();

      // 2️⃣ Set game phase to 'results'
      await updateDoc(doc(db, "game", "settings"), {
        phase: "results"
      });

      alert("✅ Results calculated and revealed!");
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Failed to calculate and show results. Check console for details.");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <button
        onClick={assignRoles}
        style={{
          padding: "10px 20px",
          fontSize: 16,
          marginRight: 10,
          backgroundColor: "#10b981",
          color: "white",
          border: "none",
          borderRadius: 5,
        }}
      >
        🎯 Start Game & Assign Roles
      </button>
    </div>
  );
}
