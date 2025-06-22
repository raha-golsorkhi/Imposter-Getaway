export default function WaitingRoom({ player }) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl">Welcome, {player.name}!</h2>
        <p>Waiting for the game to start...</p>
      </div>
    );
  }
  