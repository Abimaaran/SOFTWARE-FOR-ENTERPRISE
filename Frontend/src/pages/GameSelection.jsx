import { useNavigate } from "react-router-dom";
import "./GameSelection.css";

function GameSelection() {
  const navigate = useNavigate();

  const selectMode = (mode) => {
    navigate(`/game/${mode}`);
  };

  return (
    <div className="page selection-page">
      <div className="selection-wrap">
        <h1 className="selection-title">
          <span>🍌</span>
          Choose Your Mode
          <span>🍌</span>
        </h1>
        <p className="selection-subtitle">How ripe are your skills?</p>

        <div className="selection-grid">
          <button className="selection-card easy" onClick={() => selectMode("easy")}>
            <div className="card-icon">👶</div>
            <h2>Easy </h2>
            <p>No timer • 5 Lives</p>
            <span className="play-hint">Beginner</span>
          </button>

          <button className="selection-card medium" onClick={() => selectMode("medium")}>
            <div className="card-icon">🐒</div>
            <h2>Medium </h2>
            <p>50s timer • 3 Lives</p>
            <span className="play-hint">Skilled</span>
          </button>

          <button className="selection-card hard" onClick={() => selectMode("hard")}>
            <div className="card-icon">🦍</div>
            <h2>Hard </h2>
            <p>20s timer • 2 Lives</p>
            <span className="play-hint">Pro</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameSelection;
