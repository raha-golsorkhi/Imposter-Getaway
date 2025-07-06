import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

export default function ResultsScreen() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const docRef = doc(db, "game", "results");
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setResults(snapshot.data());
        } else {
          setResults(null);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return <div style={{ marginTop: 30 }}>Loading results...</div>;
  }

  if (!results) {
    return <div style={{ marginTop: 30, color: "red" }}>❌ No results found.</div>;
  }

  return (
    <div style={{ marginTop: 30, maxWidth: 600 }}>
      <h2>🏆 Game Results</h2>

      <section style={{ marginTop: 20 }}>
        <h3>🎯 Top 2 Best Guessers</h3>
        <ul style={{ padding: 0, listStyle: "none" }}>
          {results.bestGuessers?.length > 0 ? (
            results.bestGuessers.map((player, idx) => (
              <li
                key={player.id}
                style={{
                  background: "#ecfdf5",
                  marginBottom: 10,
                  padding: 10,
                  borderRadius: 5,
                }}
              >
                <strong>#{idx + 1}</strong> {player.name} — ✅ {player.score} correct guesses
              </li>
            ))
          ) : (
            <li>No guessers found.</li>
          )}
        </ul>
      </section>

      <section style={{ marginTop: 30 }}>
        <h3>🌟 Top 2 Best Storytellers</h3>
        <ul style={{ padding: 0, listStyle: "none" }}>
          {results.bestStorytellers?.length > 0 ? (
            results.bestStorytellers.map((player, idx) => (
              <li
                key={player.id}
                style={{
                  background: "#fef9c3",
                  marginBottom: 10,
                  padding: 10,
                  borderRadius: 5,
                }}
              >
                <strong>#{idx + 1}</strong> {player.name} — ⭐ Avg Rating: {player.averageRating}
              </li>
            ))
          ) : (
            <li>No storytellers found.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
