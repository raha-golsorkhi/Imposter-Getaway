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
            votingDuration: 480
          });
          alert("✅ Chat time is over! Game moved to Voting phase.");
        } catch (error) {
          console.error("❌ Failed to switch to voting phase:", error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isHost, phase, chatStarted]);

  // ✅ 5️⃣ Host: During voting, sync all players to voting phase
useEffect(() => {
  if (!isHost) return;
  if (phase !== "voting") return;

  console.log("[Host] Enforcing voting phase for late joiners");

  const unsubscribe = onSnapshot(collection(db, "players"), async (snapshot) => {
    const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const needsUpdate = players.filter(p =>
      p.phase !== "voting" &&
      p.name.trim().toLowerCase() !== "raha"
    );

    if (needsUpdate.length === 0) return;

    console.log("[Host] Found late joiners needing phase update:", needsUpdate.map(p => p.name));

    const updates = needsUpdate.map(player =>
      updateDoc(doc(db, "players", player.id), { phase: "voting" })
    );

    await Promise.all(updates);
  });

  return unsubscribe;
}, [isHost, phase]);

return (
  <div style={{
    maxWidth: 600,
    margin: '0 auto',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center'
  }}>
    <h2 style={{ fontSize: '1.8rem', marginBottom: 10 }}>👋 Welcome, {player.name}!</h2>

    <p style={{ fontSize: '1rem', color: '#555', marginBottom: 20 }}>
      Get ready for The Imposter Getaway! 
      You'll have <strong>8 minutes</strong> to chat in-person. 
      Share a <strong>short vacation story</strong> that fits your role. Civilians must tell the truth. Imposters must lie convincingly! 
      Listen carefully to others, because after the round you'll vote here on who you think is an Imposter or a Civilian. 
      When you're ready, make sure to complete all your votes before hitting <strong>Submit</strong>.
    </p>

    {role ? (
      <>
        <p style={{ fontSize: '1.2rem', marginBottom: 10 }}>
          <strong>Your Role:</strong>{" "}
          {role === "imposter"
            ? <span style={{ color: '#dc2626' }}>🕵️ Imposter (Lie! Convince them you're telling the truth!)</span>
            : role === "civilian"
            ? <span style={{ color: '#2563eb' }}>🧳 Civilian (Tell your true vacation story!)</span>
            : role === "host"
            ? <span style={{ color: '#f59e0b' }}>⭐ Host (Guide the game and assign roles!)</span>
            : role}
        </p>
      </>
    ) : (
      <p style={{ fontSize: '1.1rem', color: '#777' }}>⏳ Waiting for the host to assign roles and start the game...</p>
    )}

      {phase === "chatting" && chatStarted && (
        <ChatUI playerId={player.id} isHost={isHost} />
      )}
    </div>
  );
  
  
}
