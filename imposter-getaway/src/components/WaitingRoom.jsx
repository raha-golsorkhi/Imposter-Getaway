import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useEffect, useState } from "react";

export default function WaitingRoom({ player }) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "players", player.id), (docSnap) => {
      if (docSnap.exists()) {
        setRole(docSnap.data().role);
      }
    });
    return unsub;
  }, [player.id]);

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
      </div>
    );
}
