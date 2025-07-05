import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function scorePlayers() {
  // Fetch all players
  const snapshot = await getDocs(collection(db, "players"));
  const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Build a quick lookup of playerId => role
  const roleMap = {};
  players.forEach(p => {
    roleMap[p.id] = p.role;
  });

  // For collecting ratings received per player
  const ratingsReceived = {};
  players.forEach(p => {
    ratingsReceived[p.id] = [];
  });

  // Count correct guesses for each voter
  const scoreUpdates = [];

  players.forEach(voter => {
    if (!voter.votes || voter.role === "host") {
      scoreUpdates.push(updateDoc(doc(db, "players", voter.id), {
        score: 0
      }));
      return;
    }

    let correct = 0;

    Object.entries(voter.votes).forEach(([targetId, vote]) => {
      // Count role guess correctness
      if (vote.roleGuess && roleMap[targetId] && vote.roleGuess === roleMap[targetId]) {
        correct += 1;
      }

      // Accumulate rating for the target
      if (vote.rating && ratingsReceived[targetId]) {
        ratingsReceived[targetId].push(vote.rating);
      }
    });

    // Store voter's score
    scoreUpdates.push(updateDoc(doc(db, "players", voter.id), {
      score: correct
    }));
  });

  // Store ratings received + average for each player
  players.forEach(player => {
    const received = ratingsReceived[player.id] || [];
    const avg = received.length
      ? parseFloat((received.reduce((a, b) => a + b, 0) / received.length).toFixed(2))
      : 0;

    scoreUpdates.push(updateDoc(doc(db, "players", player.id), {
      receivedRatings: received,
      averageRating: avg
    }));
  });

  // Wait for all updates
  await Promise.all(scoreUpdates);

  // OPTIONAL: Find top 4 guessers and top 4 storytellers
  const nonHosts = players.filter(p => p.role !== "host");

  // Load latest scores
  const updatedSnapshot = await getDocs(collection(db, "players"));
  const updatedPlayers = updatedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const bestGuessers = updatedPlayers
    .filter(p => p.role !== "host")
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const bestStorytellers = updatedPlayers
    .filter(p => p.role !== "host" && p.averageRating >= 5)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 4);

  // Optionally write to /game/results in Firestore
  await updateDoc(doc(db, "game", "results"), {
    bestGuessers: bestGuessers.map(p => ({ id: p.id, name: p.name, score: p.score })),
    bestStorytellers: bestStorytellers.map(p => ({ id: p.id, name: p.name, averageRating: p.averageRating }))
  });

  alert("✅ Scoring complete! Check Firestore /game/results for top players.");
}
