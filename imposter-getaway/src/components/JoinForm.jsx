import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

// ✅ Toggle this ON/OFF to control localStorage behavior
const USE_LOCAL_STORAGE = false;   // <-- set to true for production

export default function JoinForm({ onJoin }) {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Add new player to Firestore
    const docRef = await addDoc(collection(db, "players"), {
      name: trimmedName,
      role: null,
      hasVoted: false,
      score: 0,
    });

    // ✅ Save to localStorage *only if enabled*
    if (USE_LOCAL_STORAGE) {
      localStorage.setItem("playerId", docRef.id);
      localStorage.setItem("playerName", trimmedName);
    }

    // Notify parent component
    onJoin({ id: docRef.id, name: trimmedName });

    // Clear input field for next player on same device
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      <input
        className="border p-2 rounded"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Join Game
      </button>
    </form>
  );
}
