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

        <div className="selection-options">
          <button className="selection-card easy" onClick={() => selectMode("easy")}>
            <div className="card-icon">🍌</div>
            <h2>Easy Mode</h2>
            <p>60s timer • 3 Lives</p>
            <span className="play-hint">Select</span>
          </button>

          <button className="selection-card hard" onClick={() => selectMode("hard")}>
            <div className="card-icon">🔥</div>
            <h2>Hard Mode</h2>
            <p>20s timer • 2 Lives</p>
            <span className="play-hint">Select</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameSelection;
