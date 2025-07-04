import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./utils/firebaseConfig";
import JoinForm from "./components/JoinForm";
import WaitingRoom from "./components/WaitingRoom";
import HostControls from "./components/HostControls";
import StartChatButton from "./components/StartChatButton";
import StartVotingButton from "./components/StartVotingButton";

function App() {
  const USE_LOCAL_STORAGE = false;

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

  // ✅ Listen to game settings
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
      ) : (
        <>
          <WaitingRoom
            player={player}
            role={role}
            setRole={setRole}
            isHost={isHost}
          />

          {/* ✅ Host Controls: Assign Roles */}
          {isHost && (phase === "waiting" || phase === "chatting") && (
            <HostControls />
          )}

          {/* ✅ Host Start Chat button */}
          {isHost && phase === "waiting" && rolesAssigned && (
            <>
              <div>Roles assigned. Please start the chat.</div>
              <StartChatButton />
            </>
          )}

          {/* ✅ Host Start Voting button */}
          {isHost && phase === "chatting" && chatStarted && (
            <StartVotingButton />
          )}
        </>
      )}
    </div>
  );
}

export default App;
