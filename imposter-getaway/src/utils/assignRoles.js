import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

export async function assignRoles() {
  const snapshot = await getDocs(collection(db, "players"));
  const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Identify host and exclude from role assignment
  const host = players.find(p => p.name.trim().toLowerCase() === "raha");
  const nonHosts = players.filter(p => p.name.trim().toLowerCase() !== "raha");


  if (nonHosts.length < 3) {
    alert("Not enough non-host players to assign roles.");
    return;
  }

  // Shuffle non-host players
  const shuffled = [...nonHosts].sort(() => 0.5 - Math.random());

  // Number of imposters (round down)
  const imposterCount = Math.floor(nonHosts.length / 3);

  const updates = [];

  // Assign roles
  shuffled.forEach((player, index) => {
    const role = index < imposterCount ? "imposter" : "civilian";
    updates.push(updateDoc(doc(db, "players", player.id), { role }));
  });

  // Assign host role
  if (host) {
    updates.push(updateDoc(doc(db, "players", host.id), { role: "host" }));
  }

  // Wait for all role updates to finish
  await Promise.all(updates);

  // Set rolesAssigned flag in game settings
  await updateDoc(doc(db, "game", "settings"), {
    rolesAssigned: true,
  });

  alert(`Assigned ${imposterCount} imposters out of ${nonHosts.length} players`);
}
