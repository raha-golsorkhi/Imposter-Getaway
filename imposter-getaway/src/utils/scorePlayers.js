import { collection, getDocs, setDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function scorePlayers() {
  console.log("⚡️ Scoring starting...");

  // 1️⃣ Fetch all players
  const snapshot = await getDocs(collection(db, "players"));
  const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // 2️⃣ Build lookup of playerId => role
  const roleMap = {};
  players.forEach(p => {
    roleMap[p.id] = p.role;
  });

  console.log("✅ Built role map:", roleMap);

  // 3️⃣ Collect ratings *received* for each target
  const ratingsReceived = {};
  players.forEach(p => {
    ratingsReceived[p.id] = [];
  });

  // 4️⃣ Calculate correct guesses + collect ratings
  const scoreUpdates = [];

  players.forEach(voter => {
    if (voter.role === "host" || !voter.votes) {
      console.log(`⏩ Skipping voter: ${voter.name}`);
      scoreUpdates.push(updateDoc(doc(db, "players", voter.id), {
        score: 0
      }));
      return;
    }

    let correctGuesses = 0;

    for (const [targetId, vote] of Object.entries(voter.votes)) {
      const actualRole = roleMap[targetId];

      // Count correct role guesses
      if (vote.roleGuess && actualRole && vote.roleGuess === actualRole) {
        correctGuesses += 1;
      }

      // Add rating if given
      if (vote.rating && ratingsReceived[targetId]) {
        ratingsReceived[targetId].push(vote.rating);
      }
    }

    console.log(`✅ ${voter.name}: ${correctGuesses} correct guesses`);
    scoreUpdates.push(updateDoc(doc(db, "players", voter.id), {
      score: correctGuesses
    }));
  });

  // 5️⃣ Compute and store average ratings for each player
  players.forEach(player => {
    const ratings = ratingsReceived[player.id] || [];
    const average = ratings.length
      ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
      : 0;

    console.log(`⭐️ ${player.name}: average rating ${average}`);

    scoreUpdates.push(updateDoc(doc(db, "players", player.id), {
      receivedRatings: ratings,
      averageRating: average
    }));
  });

  // 6️⃣ Commit all updates
  await Promise.all(scoreUpdates);
  console.log("✅ Player scores and ratings updated!");

  // 7️⃣ Reload latest player data
  const updatedSnapshot = await getDocs(collection(db, "players"));
  const updatedPlayers = updatedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // ✅ Best 2 guessers with score > 0
  const bestGuessers = updatedPlayers
  .filter(p => p.role !== "host" && p.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 4);

  // ✅ Best 2 storytellers with avg rating > 0
  const bestStorytellers = updatedPlayers
  .filter(p => p.role !== "host" && p.averageRating > 0)
  .sort((a, b) => b.averageRating - a.averageRating)
  .slice(0, 4);

  console.log("🏆 Best Guessers:", bestGuessers.map(p => p.name));
  console.log("🌟 Best Storytellers:", bestStorytellers.map(p => p.name));

  // 9️⃣ Save results to Firestore
  await setDoc(doc(db, "game", "results"), {
    bestGuessers: bestGuessers.map(p => ({
      id: p.id,
      name: p.name,
      score: p.score
    })),
    bestStorytellers: bestStorytellers.map(p => ({
      id: p.id,
      name: p.name,
      averageRating: p.averageRating
    }))
  }, { merge: true });

  alert("✅ Scoring complete! Results saved to /game/results");
}
