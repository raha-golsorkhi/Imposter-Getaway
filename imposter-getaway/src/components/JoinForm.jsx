import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

export default function JoinForm({ onJoin }) {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const doc = await addDoc(collection(db, "players"), {
      name: name.trim(),
      role: null,
      hasVoted: false,
      score: 0,
    });
    onJoin({ id: doc.id, name });
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
