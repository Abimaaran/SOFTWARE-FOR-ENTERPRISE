import { useState, useEffect } from "react";
import axios from "axios";
import "./Leaderboard.css";

function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/auth/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlayers(res.data);
      } catch (err) {
        setError("Failed to load leaderboard 🍌");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div className="leaderboard-page">Loading Leaderboard...</div>;

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-wrap">
        <h1 className="leaderboard-title">🏆 Banana Peelers 🏆</h1>
        {error && <p className="error-msg">{error}</p>}
        <div className="leaderboard-list">
          <div className="leaderboard-header">
            <span>Rank</span>
            <span>Player</span>
            <span>High Score</span>
          </div>
          {players.map((player, index) => (
            <div key={player._id} className="leaderboard-item">
              <span className="rank">{index + 1}</span>
              <span className="username">{player.username}</span>
              <span className="score">{player.highScore}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
