import { useState, useEffect } from "react";
import axios from "axios";
import "./Leaderboard.css";

function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [difficulty, setDifficulty] = useState("easy");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/auth/leaderboard?difficulty=${difficulty}`, {
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
  }, [difficulty]);

  if (loading) return <div className="leaderboard-page">Loading Leaderboard...</div>;

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-wrap">
        <h1 className="leaderboard-title">🏆 Banana Peelers 🏆</h1>

        <div className="difficulty-selector">
          <button
            className={`diff-btn ${difficulty === 'easy' ? 'active' : ''}`}
            onClick={() => setDifficulty('easy')}
          >
            👶 Easy
          </button>
          <button
            className={`diff-btn ${difficulty === 'medium' ? 'active' : ''}`}
            onClick={() => setDifficulty('medium')}
          >
            🐒 Medium
          </button>
          <button
            className={`diff-btn ${difficulty === 'hard' ? 'active' : ''}`}
            onClick={() => setDifficulty('hard')}
          >
            🦍 Hard
          </button>
        </div>

        {error && <p className="error-msg">{error}</p>}
        <div className="leaderboard-list">
          <div className="leaderboard-header">
            <span>Rank</span>
            <span>Player</span>
            <span>High Score</span>
          </div>
          {players.map((player, index) => {
            const rank = index + 1;
            const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
            let rankClass = "";
            if (rank === 1) rankClass = "gold-rank";
            else if (rank === 2) rankClass = "silver-rank";
            else if (rank === 3) rankClass = "bronze-rank";

            return (
              <div key={player._id} className={`leaderboard-item ${rankClass}`}>
                <span className="rank-badge">{rankEmoji}</span>
                <span className="username">{player.username}</span>
                <span className="score">{player.highScore}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
