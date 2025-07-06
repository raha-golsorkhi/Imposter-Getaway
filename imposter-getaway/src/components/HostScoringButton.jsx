import { scorePlayers } from "../utils/scorePlayers";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

export default function HostScoringButton() {
  const handleClick = async () => {
    const confirm = window.confirm("This will calculate scores and reveal results to all players. Continue?");
    if (!confirm) return;

    try {
      // 1️⃣ Run scoring
      await scorePlayers();

      // 2️⃣ Set game phase to 'results' so everyone sees ResultsScreen
      await updateDoc(doc(db, "game", "settings"), {
        phase: "results"
      });

      alert("✅ Results calculated and revealed!");

    } catch (error) {
      console.error("Error during scoring:", error);
      alert("❌ Failed to calculate and show results. Check console.");
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        marginTop: 20,
        padding: "10px 20px",
        backgroundColor: "#f59e0b",
        color: "white",
        border: "none",
        borderRadius: 5,
        fontSize: 16,
      }}
    >
      🧮 Calculate & Show Results
    </button>
  );
}
