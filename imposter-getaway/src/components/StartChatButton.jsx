import { doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

export default function StartChatButton() {
  const handleStartChat = async () => {
    await updateDoc(doc(db, "game", "settings"), {
      phase: "chatting",
      chatStarted: true,
    });
    
  };

  return (
    <button
      onClick={handleStartChat}
      style={{
        marginTop: 20,
        padding: "10px 20px",
        backgroundColor: "#10b981",
        color: "white",
        border: "none",
        borderRadius: 5,
        fontSize: 16,
      }}
    >
      🗣️ Start Chatting
    </button>
  );
}
