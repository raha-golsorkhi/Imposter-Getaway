import { useState, useEffect, useRef } from "react";
import { collection, getDocs, updateDoc, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

export default function VotingPanel({ playerId, isHost }) {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [votes, setVotes] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [votingStartTime, setVotingStartTime] = useState(null);
  const [votingDuration, setVotingDuration] = useState(60);

  const votesRef = useRef(votes);

  // Keep votesRef in sync with votes state
  useEffect(() => {
    votesRef.current = votes;
  }, [votes]);

  useEffect(() => {
    // Real-time listener for players
    const unsub = onSnapshot(collection(db, "players"), (snapshot) => {
      const others = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.id !== playerId);
      setPlayers(others);
    });
  
    // Check if this player already submitted votes
    const checkIfSubmitted = async () => {
      const playerRef = doc(db, "players", playerId);
      const playerSnap = await getDoc(playerRef);
      if (playerSnap.exists() && playerSnap.data().hasVoted) {
        setSubmitted(true);
        setVotes(playerSnap.data().votes || {});
      }
    };
  
    checkIfSubmitted();
  
    return unsub;
  }, [playerId]);
  

  // ✅ Listen for voting start time and duration
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "game", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVotingStartTime(data.votingStartTime);
        setVotingDuration(data.votingDuration || 60);
      }
    });
    return unsub;
  }, []);

  // ✅ Countdown timer
  useEffect(() => {
    if (!votingStartTime || submitted) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const end = votingStartTime.toDate().getTime() + votingDuration * 1000;
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        clearInterval(interval);
        submitVotes(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [votingStartTime, votingDuration, submitted]);

  // ✅ Unified submission (manual or auto)
  const submitVotes = async (isAuto = false) => {
    if (submitted) return;

    try {
      // Use *latest* votes from ref
      const votesToSubmit = votesRef.current;

      await updateDoc(doc(db, "players", playerId), {
        votes: votesToSubmit,
        hasVoted: true,
      });
      setSubmitted(true);

      if (isAuto) {
        alert("⏰ Time is up! Your votes were auto-submitted.");
      } else {
        alert("✅ Your votes have been submitted!");
      }

      // ✅ Only host moves phase forward on auto-submit
      if (isAuto && isHost) {
        await updateDoc(doc(db, "game", "settings"), {
          phase: "score"
        });
      }

    } catch (error) {
      console.error("Error submitting votes:", error);
      alert("❌ Failed to submit votes. Try again.");
    }
  };

  // ✅ Vote handlers
  const handleRoleVote = (targetId, roleGuess) => {
    if (submitted) return;
    setVotes(prev => ({
      ...prev,
      [targetId]: {
        ...(prev[targetId] || {}),
        roleGuess,
      },
    }));
  };

  const handleRating = (targetId, rating) => {
    if (submitted) return;
    setVotes(prev => ({
      ...prev,
      [targetId]: {
        ...(prev[targetId] || {}),
        rating,
      },
    }));
  };

  // ✅ Filtered search
  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Render
  return (
    <div style={{ marginTop: 30 }}>
      <h3>🗳️ Vote While You Chat</h3>
      <p>⏰ Time Left: {timeLeft}s</p>

      {!submitted && (
        <>
          <input
            type="text"
            placeholder="Search player name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 8, width: "100%", marginBottom: 10 }}
          />

          <ul style={{ listStyle: "none", padding: 0 }}>
            {filtered.map(p => (
              <li key={p.id} style={{ marginBottom: 20, borderBottom: "1px solid #ddd", paddingBottom: 10 }}>
                <strong>{p.name}</strong>
                <div style={{ marginTop: 5 }}>
                <button
                  onClick={() => handleRoleVote(p.id, "imposter")}
                  disabled={votes[p.id]?.roleGuess === "imposter"}
                  style={{
                    marginRight: 5,
                    backgroundColor: votes[p.id]?.roleGuess === "imposter" ? "#dc2626" : "#9ca3af", // Dark red if selected, dark grey default
                    color: "white",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: 4,
                    cursor: votes[p.id]?.roleGuess === "imposter" ? "default" : "pointer",
                    fontWeight: "bold",
                     }}
                    >
                  Imposter
                </button>
<button
  onClick={() => handleRoleVote(p.id, "civilian")}
  disabled={votes[p.id]?.roleGuess === "civilian"}
  style={{
    backgroundColor: votes[p.id]?.roleGuess === "civilian" ? "#2563eb" : "#9ca3af", // Blue if selected, dark grey default
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: 4,
    cursor: votes[p.id]?.roleGuess === "civilian" ? "default" : "pointer",
    fontWeight: "bold",
  }}
>
  Civilian
</button>

                </div>
                <div style={{ marginTop: 8 }}>
                  <label>⭐ Rate Story Quality:</label>
                  <select
                    value={votes[p.id]?.rating || ""}
                    onChange={e => handleRating(p.id, parseInt(e.target.value))}
                    disabled={submitted}
                    style={{ marginLeft: 5 }}
                  >
                    <option value="">Select</option>
                    {[1, 2, 3, 4, 5].map(star => (
                      <option key={star} value={star}>{star} ⭐</option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={() => submitVotes(false)}
            style={{
              marginTop: 20,
              backgroundColor: "#4ade80",
              color: "white",
              padding: "10px 20px",
              borderRadius: 5,
              border: "none",
              fontSize: 16,
            }}
          >
            ✅ Submit Votes
          </button>
        </>
      )}

      {submitted && (
        <div style={{ marginTop: 20, color: "#16a34a" }}>
          <strong>✅ Your votes have been submitted!</strong>
          <h4 style={{ marginTop: 10 }}>🧾 Your Votes:</h4>
          <ul>
            {Object.entries(votes).map(([id, vote]) => {
              const name = players.find(p => p.id === id)?.name || "Unknown";
              return (
                <li key={id}>
                  {name} → {vote.roleGuess} (⭐ {vote.rating})
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
