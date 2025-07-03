import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useEffect, useState } from "react";
import ChatUI from "./ChatUI";


export default function WaitingRoom({ player, role, setRole, isHost }) {
  const [phase, setPhase] = useState("waiting");
  const [chatStarted, setChatStarted] = useState(false);

  // Listen to player's role
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "players", player.id), (docSnap) => {
      if (docSnap.exists()) {
        setRole(docSnap.data().role);
      }
    });
    return unsub;
  }, [player.id, setRole]);  

  // Listen to game phase and chatStarted flag
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "game", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPhase(data.phase || "waiting");
        setChatStarted(data.chatStarted || false);
      }
    });
    return unsub;
  }, []);

  return (
    <div>
      <h2>Welcome, {player.name}</h2>
      {role ? (
        <p>
          <strong>Your Role:</strong>{" "}
          {role === "imposter"
            ? "🕵️ Imposter (Lie!)"
            : role === "civilian"
            ? "🧳 Civilian (Tell the Truth)"
            : role === "host"
            ? "⭐ Host"
            : role}
        </p>
      ) : (
        <p>Waiting for game to start...</p>
      )}

      {/* Show chat UI only when phase is chatting AND host has started it */}
      {phase === "chatting" && chatStarted && (
        <ChatUI playerId={player.id} isHost={isHost} />

      )}
    </div>
  );
}
