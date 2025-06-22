import { useState } from "react";
import JoinForm from "./components/JoinForm";
import WaitingRoom from "./components/WaitingRoom";
import HostControls from "./components/HostControls";

function App() {
  const [player, setPlayer] = useState(null);
  const isHost = player?.name === "Raha"; // replace with your host logic

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
          <WaitingRoom player={player} />
          {isHost && <HostControls />}
        </>
      )}
    </div>
  );
}

export default App;
