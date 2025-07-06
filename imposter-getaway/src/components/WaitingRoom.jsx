import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import ChatUI from "./ChatUI";

export default function WaitingRoom({ player, role, setRole, isHost }) {
  const [phase, setPhase] = useState("waiting");
  const [chatStarted, setChatStarted] = useState(false);

  // ✅ 1️⃣ Listen to this player's role
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "players", player.id), (docSnap) => {
      if (docSnap.exists()) {
        setRole(docSnap.data().role);
      }
    });
    return unsub;
  }, [player.id, setRole]);

  // ✅ 2️⃣ Listen to global game settings
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

  // ✅ 3️⃣ Host: Auto-assign roles for late joiners
  useEffect(() => {
    if (!isHost) return;
    if (phase !== "chatting" || !chatStarted) return;

    console.log("[Host] Watching for unassigned players...");

    const unsubscribe = onSnapshot(collection(db, "players"), async (snapshot) => {
      const allPlayers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Find players with no role
      const unassigned = allPlayers.filter(p => !p.role && p.name.trim().toLowerCase() !== "raha");
      if (unassigned.length === 0) return;

      console.log("[Host] Found unassigned players:", unassigned.map(p => p.name));

      // Count current imposters/civilians
      const imposters = allPlayers.filter(p => p.role === "imposter");
      const civilians = allPlayers.filter(p => p.role === "civilian");

      // Maintain ~1/3 imposter ratio
      const updates = [];
      const targetRatio = 1 / 3;

      unassigned.forEach((player) => {
        const totalAssigned = imposters.length + civilians.length;
        const currentRatio = totalAssigned === 0 ? 0 : imposters.length / totalAssigned;

        const assignAsImposter = currentRatio < targetRatio;
        const assignedRole = assignAsImposter ? "imposter" : "civilian";

        updates.push(updateDoc(doc(db, "players", player.id), { role: assignedRole }));
        if (assignAsImposter) imposters.push(player);
        else civilians.push(player);

        console.log(`[Host] Assigned ${player.name} as ${assignedRole}`);
      });

      await Promise.all(updates);
    });

    return () => unsubscribe();
  }, [isHost, phase, chatStarted]);

  // ✅ 4️⃣ Host: Chat-phase countdown → moves to Voting phase
  useEffect(() => {
    if (!isHost) return;
    if (phase !== "chatting" || !chatStarted) return;

    console.log("[Host Timer] Chatting timer started!");

    const CHAT_DURATION_SECONDS = 480; // 8 minutes

    const endTime = Date.now() + CHAT_DURATION_SECONDS * 1000;

    const interval = setInterval(async () => {
      const remaining = Math.floor((endTime - Date.now()) / 1000);

      if (remaining % 30 === 0) {
        console.log(`[Host Timer] ~${remaining}s left in chatting...`);
      }

      if (remaining <= 0) {
        clearInterval(interval);
        console.log("[Host Timer] Chatting over → Switching to voting!");

        try {
          await updateDoc(doc(db, "game", "settings"), {
            phase: "voting",
            votingStartTime: new Date(),
            votingDuration: 60
          });
          alert("✅ Chat time is over! Game moved to Voting phase.");
        } catch (error) {
          console.error("❌ Failed to switch to voting phase:", error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isHost, phase, chatStarted]);

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

      {phase === "chatting" && chatStarted && (
        <ChatUI playerId={player.id} isHost={isHost} />
      )}
    </div>
  );
}
