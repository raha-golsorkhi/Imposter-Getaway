import { scorePlayers } from "../utils/scorePlayers";

export default function HostScoringButton() {
  const handleClick = async () => {
    if (!window.confirm("Calculate scores and determine winners now?")) return;
    try {
      await scorePlayers();
      alert("✅ Scoring complete! Results saved.");
    } catch (error) {
      console.error("Error during scoring:", error);
      alert("❌ Scoring failed. Check console for details.");
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        marginTop: 20,
        padding: "10px 20px",
        backgroundColor: "#9333ea",
        color: "white",
        border: "none",
        borderRadius: 5,
        fontSize: 16,
      }}
    >
      🧮 Calculate Results
    </button>
  );
}
