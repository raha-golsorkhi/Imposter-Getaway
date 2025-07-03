import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

export default function VotingPanel({ playerId }) {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [votes, setVotes] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // Fetch all players except self
  useEffect(() => {
    const fetchPlayers = async () => {
      const snapshot = await getDocs(collection(db, "players"));
      const all = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.id !== playerId);
      setPlayers(all);
    };

    const checkIfSubmitted = async () => {
      const docRef = doc(db, "players", playerId);
      const playerDoc = await getDoc(docRef);
      if (playerDoc.exists() && playerDoc.data().hasVoted) {
        setSubmitted(true);
        setVotes(playerDoc.data().votes || {});
      }
    };

    fetchPlayers();
    checkIfSubmitted();
  }, [playerId]);

  // Countdown timer
  useEffect(() => {
    if (submitted) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [submitted]);

  // Handle role vote
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

  // Handle rating vote
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

  // Manual submit
  const handleSubmitVotes = async () => {
    if (submitted) return;
    const completedVotes = fillMissingVotes();
    await updateDoc(doc(db, "players", playerId), {
      votes: completedVotes,
      hasVoted: true,
    });
    setVotes(completedVotes);
    setSubmitted(true);
    alert("✅ Your votes have been submitted!");
  };

  // Auto-submit on timer end
  const handleAutoSubmit = async () => {
    if (submitted) return;
    const completedVotes = fillMissingVotes();
    await updateDoc(doc(db, "players", playerId), {
      votes: completedVotes,
      hasVoted: true,
    });
    setVotes(completedVotes);
    setSubmitted(true);
    alert("⏰ Time is up! Your votes were auto-submitted.");
  };

  // Fill missing votes with defaults
  const fillMissingVotes = () => {
    const completed = { ...votes };
    players.forEach(p => {
      if (!completed[p.id]) {
        completed[p.id] = {
          roleGuess: "civilian",
          rating: 3,
        };
      } else {
        if (!completed[p.id].roleGuess) {
          completed[p.id].roleGuess = "civilian";
        }
        if (!completed[p.id].rating) {
          completed[p.id].rating = 3;
        }
      }
    });
    return completed;
  };

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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
                      backgroundColor: votes[p.id]?.roleGuess === "imposter" ? "#f87171" : "#eee",
                    }}
                  >
                    Imposter
                  </button>
                  <button
                    onClick={() => handleRoleVote(p.id, "civilian")}
                    disabled={votes[p.id]?.roleGuess === "civilian"}
                    style={{
                      backgroundColor: votes[p.id]?.roleGuess === "civilian" ? "#60a5fa" : "#eee",
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
            onClick={handleSubmitVotes}
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
