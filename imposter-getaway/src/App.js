import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./utils/firebaseConfig";
import JoinForm from "./components/JoinForm";
import WaitingRoom from "./components/WaitingRoom";
import HostControls from "./components/HostControls";
import StartChatButton from "./components/StartChatButton";
import HostScoringButton from "./components/HostScoringButton";
import ResultsScreen from "./components/ResultsScreen";
import VotingPanel from "./components/VotingPanel";

function App() {
  // ✅ Toggle this ON to use localStorage for returning players <<<<<<<-------
  const USE_LOCAL_STORAGE = true; 

  // ✅ Remember logged-in player from localStorage if present
  const [player, setPlayer] = useState(() => {
    if (USE_LOCAL_STORAGE) {
      const id = localStorage.getItem("playerId");
      const name = localStorage.getItem("playerName");
      return id && name ? { id, name } : null;
    }
    return null;
  });

  const [role, setRole] = useState(null);
  const [phase, setPhase] = useState("waiting");
  const [rolesAssigned, setRolesAssigned] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  const isHost = player?.name?.trim().toLowerCase() === "raha";

  // ✅ Listen in real time to global game settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "game", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPhase(data.phase || "waiting");
        setRolesAssigned(data.rolesAssigned || false);
        setChatStarted(data.chatStarted || false);
      }
    });
    return unsub;
  }, []);

  // ✅ Main render with phase-based routing
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        padding: "20px",
      }}
    >
      {!player ? (
        <JoinForm onJoin={setPlayer} />
      ) : phase === "results" ? (
        <ResultsScreen />
      ) : phase === "voting" ? (
        <VotingPanel playerId={player.id} isHost={isHost} />
      ) : (
        <>
          <WaitingRoom
            player={player}
            role={role}
            setRole={setRole}
            isHost={isHost}
          />

          {isHost && phase === "waiting" && <HostControls />}

          {isHost && phase === "waiting" && (
            <>
              <div>Roles assigned. Please start the chat.</div>
              <StartChatButton />
            </>
          )}

          {isHost && (phase === "score" || phase === "chatting") && (
            <HostScoringButton />
          )}
        </>
      )}
    </div>
  );
}

export default App;
