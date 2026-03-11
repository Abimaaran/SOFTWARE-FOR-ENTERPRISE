import { Link } from "react-router-dom";
import "./UserActivity.css";

function UserActivity() {
  const easyScore = Number(localStorage.getItem("highScoreEasy")) || 0;
  const mediumScore = Number(localStorage.getItem("highScoreMedium")) || 0;
  const hardScore = Number(localStorage.getItem("highScoreHard")) || 0;
  const username = localStorage.getItem("username") || "Player";

  const totalScore = easyScore + mediumScore + hardScore;

  const achievements = [
    { id: 1, title: "Peeling Rookie", description: "Score 50+ in any mode", icon: "🌱", unlocked: easyScore >= 50 || mediumScore >= 50 || hardScore >= 50 },
    { id: 2, title: "Monkey Business", description: "Score 100+ in Medium mode", icon: "🐒", unlocked: mediumScore >= 100 },
    { id: 3, title: "Banana King", description: "Total score of 300+", icon: "👑", unlocked: totalScore >= 300 },
    { id: 4, title: "Fire Walker", description: "Score 50+ in Hard mode", icon: "🔥", unlocked: hardScore >= 50 },
  ];

  return (
    <div className="page activity-page">
      <div className="activity-wrap">
        <header className="activity-header">
          <div className="user-icon-large">👤</div>
          <h1 className="activity-title">{username}'s Dashboard</h1>
          <p className="activity-subtitle">Track your performance and achievements 🍌</p>
        </header>

        <section className="stats-grid three-col">
          <div className="stat-card premium-card easy">
            <div className="card-badge">EASY</div>
            <span className="stat-icon">🍌</span>
            <div className="stat-info">
              <h3>High Score</h3>
              <div className="stat-value">{easyScore}</div>
              <p>Top Peeling Speed</p>
            </div>
          </div>

          <div className="stat-card premium-card medium">
            <div className="card-badge">MEDIUM</div>
            <span className="stat-icon">🐒</span>
            <div className="stat-info">
              <h3>High Score</h3>
              <div className="stat-value">{mediumScore}</div>
              <p>Expert Peeler</p>
            </div>
          </div>

          <div className="stat-card premium-card hard">
            <div className="card-badge">HARD</div>
            <span className="stat-icon">🦍</span>
            <div className="stat-info">
              <h3>High Score</h3>
              <div className="stat-value">{hardScore}</div>
              <p>Pro Peeler Status</p>
            </div>
          </div>
        </section>

        <div className="achievement-section">
          <h3>🏆 Your Achievements</h3>
          <div className="achievements-list">
            {achievements.map(ach => (
              <div key={ach.id} className={`achievement-badge ${ach.unlocked ? 'unlocked' : 'locked'}`}>
                <span className="badge-icon">{ach.unlocked ? ach.icon : "🔒"}</span>
                <div className="badge-details">
                  <h4>{ach.title}</h4>
                  <p>{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
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
