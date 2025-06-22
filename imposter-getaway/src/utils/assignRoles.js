import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function assignRoles() {
  const snapshot = await getDocs(collection(db, "players"));
  const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Identify host and exclude them from role assignment
  const hostName = "Raha"; // change if needed
  const host = players.find(p => p.name === hostName);
  const nonHosts = players.filter(p => p.name !== hostName);

  if (nonHosts.length < 3) {
    alert("Not enough non-host players to assign roles.");
    return;
  }

  // Shuffle the non-host players
  const shuffled = [...nonHosts].sort(() => 0.5 - Math.random());

  // Calculate correct number of imposters (round down)
  const imposterCount = Math.floor(nonHosts.length / 3);

  const updates = [];

  // Assign roles to non-hosts
  shuffled.forEach((player, index) => {
    const role = index < imposterCount ? "imposter" : "civilian";
    updates.push(updateDoc(doc(db, "players", player.id), { role }));
  });

  // Make sure host has "host" role
  if (host) {
    updates.push(updateDoc(doc(db, "players", host.id), { role: "host" }));
  }

  await Promise.all(updates);
  alert(`Assigned ${imposterCount} imposters out of ${nonHosts.length} players`);
}
