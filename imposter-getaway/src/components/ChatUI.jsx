import VotingPanel from "./VotingPanel";

export default function ChatUI({ playerId, isHost }) {
  return (
    <div style={{ marginTop: 30, maxWidth: 600 }}>
      <h2>🗣️ Chat Round In Progress</h2>
      <p>
        Mingle with people around you. Listen to their vacation stories.
        Your job: figure out who’s lying (imposters!) and who’s being honest.
      </p>

      {isHost && (
        <div style={{ marginTop: 20, color: "#f59e0b" }}>
          <strong>⭐ You're the Host</strong>
        </div>
      )}

      <VotingPanel playerId={playerId} />
    </div>
  );
}
