import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

export default function VotingPanel({ playerId }) {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [votes, setVotes] = useState({});
  const [submitted, setSubmitted] = useState(false);

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

  const handleVote = (targetId, roleGuess) => {
    if (submitted) return;
    setVotes(prev => ({
      ...prev,
      [targetId]: roleGuess,
    }));
  };

  const handleSubmitVotes = async () => {
    const docRef = doc(db, "players", playerId);
    await updateDoc(docRef, {
      votes,
      hasVoted: true,
    });
    setSubmitted(true);
    alert("✅ Your votes have been submitted!");
  };

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ marginTop: 30 }}>
      <h3>🗳️ Vote While You Chat</h3>

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
              <li key={p.id} style={{ marginBottom: 10 }}>
                <strong>{p.name}</strong>
                <div>
                  <button
                    onClick={() => handleVote(p.id, "imposter")}
                    disabled={votes[p.id] === "imposter"}
                    style={{
                      marginRight: 5,
                      backgroundColor: votes[p.id] === "imposter" ? "#f87171" : "#eee",
                    }}
                  >
                    Imposter
                  </button>
                  <button
                    onClick={() => handleVote(p.id, "civilian")}
                    disabled={votes[p.id] === "civilian"}
                    style={{
                      backgroundColor: votes[p.id] === "civilian" ? "#60a5fa" : "#eee",
                    }}
                  >
                    Civilian
                  </button>
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
            {Object.entries(votes).map(([id, guess]) => {
              const name = players.find(p => p.id === id)?.name || "Unknown";
              return (
                <li key={id}>
                  {name} → {guess}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
