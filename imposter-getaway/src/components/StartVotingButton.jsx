import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

export default function StartVotingButton() {
  const handleStartVoting = async () => {
    await updateDoc(doc(db, "game", "settings"), {
      phase: "voting",
    });
  };

  return (
    <button
      onClick={handleStartVoting}
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
      🗳️ Start Voting
    </button>
  );
}
