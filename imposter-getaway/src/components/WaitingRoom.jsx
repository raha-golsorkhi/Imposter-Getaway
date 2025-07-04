import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useEffect, useState } from "react";
import ChatUI from "./ChatUI";
import { collection, getDocs, updateDoc } from "firebase/firestore";


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

  useEffect(() => {
    if (!isHost) return;
    if (phase !== "chatting" || !chatStarted) return;
  
    console.log("Host is watching for unassigned players...");
  
    const unsubscribe = onSnapshot(collection(db, "players"), async (snapshot) => {
      const allPlayers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      // Find players with no role
      const unassigned = allPlayers.filter(p => !p.role && p.name.trim().toLowerCase() !== "raha");
  
      if (unassigned.length === 0) return; // Nothing to do
  
      console.log("Found unassigned players:", unassigned.map(p => p.name));
  
      // Count already assigned imposters and civilians
      const imposters = allPlayers.filter(p => p.role === "imposter");
      const civilians = allPlayers.filter(p => p.role === "civilian");
  
      // Assign roles to unassigned players one by one to maintain ~1/3 ratio
      const updates = [];
      const targetRatio = 1 / 3;
  
      unassigned.forEach((player) => {
        const totalAssigned = imposters.length + civilians.length;
        const currentRatio = totalAssigned === 0 ? 0 : imposters.length / totalAssigned;
  
        let assignAsImposter = currentRatio < targetRatio;
        const role = assignAsImposter ? "imposter" : "civilian";
  
        updates.push(updateDoc(doc(db, "players", player.id), { role }));
  
        if (assignAsImposter) imposters.push(player);
        else civilians.push(player);
  
        console.log(`Assigned ${player.name} as ${role}`);
      });
  
      await Promise.all(updates);
  
    });
  
    return () => unsubscribe();
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

      {/* Show chat UI only when phase is chatting AND host has started it */}
      {phase === "chatting" && chatStarted && (
        <ChatUI playerId={player.id} isHost={isHost} />

      )}
    </div>
  );
}
