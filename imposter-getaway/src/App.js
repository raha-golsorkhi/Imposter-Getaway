import { useState } from "react";
import JoinForm from "./components/JoinForm";
import WaitingRoom from "./components/WaitingRoom";

function App() {
  const [player, setPlayer] = useState(null);

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" }}>
      {!player ? <JoinForm onJoin={setPlayer} /> : <WaitingRoom player={player} />}
    </div>
  );
}

export default App;
