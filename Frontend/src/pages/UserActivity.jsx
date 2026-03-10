import { Link } from "react-router-dom";
import "./UserActivity.css";

function UserActivity() {
  const easyScore = localStorage.getItem("highScoreEasy") || "0";
  const hardScore = localStorage.getItem("highScoreHard") || "0";
  const username = localStorage.getItem("username") || "Player";

  return (
    <div className="page activity-page">
      <div className="activity-wrap">
        <header className="activity-header">
          <div className="user-icon-large">👤</div>
          <h1 className="activity-title">{username}'s Dashboard</h1>
          <p className="activity-subtitle">Track your performance and achievements 🍌</p>
        </header>

        <section className="stats-grid">
          <div className="stat-card premium-card easy">
            <div className="card-badge">EASY</div>
            <span className="stat-icon">🍌</span>
            <div className="stat-info">
              <h3>High Score</h3>
              <div className="stat-value">{easyScore}</div>
              <p>Top Peeling Speed</p>
            </div>
          </div>

          <div className="stat-card premium-card hard">
            <div className="card-badge">HARD</div>
            <span className="stat-icon">🔥</span>
            <div className="stat-info">
              <h3>High Score</h3>
              <div className="stat-value">{hardScore}</div>
              <p>Pro Peeler Status</p>
            </div>
          </div>
        </section>

        <div className="achievement-section placeholder">
          <h3>🏆 Achievements</h3>
          <p>More stats coming soon! Keep playing to unlock badges.</p>
        </div>

        <footer className="activity-footer">
          <div className="rank-info">
            <p>Competitive Spirit? Check your global rank!</p>
            <Link to="/leaderboard" className="view-rankings-btn">
              <span>🏆</span> View Leaderboard
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default UserActivity;
