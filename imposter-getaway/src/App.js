import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./utils/firebaseConfig";
import JoinForm from "./components/JoinForm";
import WaitingRoom from "./components/WaitingRoom";
import HostControls from "./components/HostControls";
import StartChatButton from "./components/StartChatButton";

function App() {
  const [player, setPlayer] = useState(null);
  const [role, setRole] = useState(null);
  const [phase, setPhase] = useState("waiting");
  const [rolesAssigned, setRolesAssigned] = useState(false);
  
  const isHost = player?.name?.trim().toLowerCase() === "raha";

  

  // Listen to game settings for phase and rolesAssigned
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "game", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPhase(data.phase || "waiting");
        setRolesAssigned(data.rolesAssigned || false);
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
          <WaitingRoom player={player} role={role} setRole={setRole} isHost={isHost} />

          {/* Host controls shown only when user is host AND game is in waiting phase */}
          {isHost && phase === "waiting" && !rolesAssigned && (
            <HostControls />
          )}

          {isHost && phase === "waiting" && rolesAssigned && (
            <>
              <div>Roles assigned. Please start the chat.</div>
              <StartChatButton />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
