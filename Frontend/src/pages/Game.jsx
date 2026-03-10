import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./Game.css";

function Game() {
  const { difficulty } = useParams();
  const isHard = difficulty === "hard";

  const [imgUrl, setImgUrl] = useState("");
  const [solution, setSolution] = useState(null);
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("Quest is ready.");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem(isHard ? "highScoreHard" : "highScoreEasy")) || 0
  );
  const [lives, setLives] = useState(isHard ? 2 : 3);
  const [timeLeft, setTimeLeft] = useState(isHard ? 20 : 60);
  const [isPaused, setIsPaused] = useState(false);
  const [feedbackOverlay, setFeedbackOverlay] = useState(null); // 'correct' or 'wrong'

  // Audio References
  const [correctSfx] = useState(new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3")); // Clapping/Applause
  const [wrongSfx] = useState(new Audio("https://cdn.pixabay.com/audio/2022/03/24/audio_333068e4c7.mp3")); // "Awww" / Disappointment sound
  const [gameOverSfx] = useState(new Audio("https://assets.mixkit.co/active_storage/sfx/2689/2689-preview.mp3"));

  const playSfx = (audio) => {
    const soundOn = localStorage.getItem("soundOn") !== "false";
    if (soundOn) {
      audio.currentTime = 0;
      audio.play().catch(e => console.log("SFX play blocked"));
    }
  };

  useEffect(() => {
    const handleToggle = (e) => {
      setIsPaused(e.detail.isOpen);
    };
    window.addEventListener("help_overlay_toggle", handleToggle);
    return () => window.removeEventListener("help_overlay_toggle", handleToggle);
  }, []);

  const loadQuestion = async () => {
    try {
      setMsg("Loading...");
      setAnswer("");
      setTimeLeft(isHard ? 20 : 60);

      const res = await axios.get("http://localhost:5000/banana/question");
      setImgUrl(res.data.question);
      setSolution(res.data.solution);
      setMsg("Quest is ready.");
    } catch (e) {
      setMsg("❌ Failed to load question. Check backend.");
    }
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  useEffect(() => {
    if (lives <= 0 || isPaused) return;

    if (timeLeft === 0) {
      playSfx(wrongSfx);
      setLives((prev) => prev - 1);
      setMsg("⏰ Time up! Loading next...");
      loadQuestion();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, lives, isPaused]);

  useEffect(() => {
    if (lives <= 0) {
      handleGameOver();
    }
  }, [lives]);

  const handleGameOver = async () => {
    if (score > highScore) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.put(
          "http://localhost:5000/auth/highscore",
          { score, difficulty },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newHighScore = res.data.highScore;
        setHighScore(newHighScore);
        
        // Update local storage for the specific difficulty
        const storageKey = isHard ? "highScoreHard" : "highScoreEasy";
        localStorage.setItem(storageKey, newHighScore);
        localStorage.setItem("highScore", newHighScore); // backward compatibility
        
        setMsg("🏆 New High Score!");
      } catch (e) {
        console.error("Failed to update high score", e);
      }
    }
    playSfx(gameOverSfx);
  };

  const submit = () => {
    if (lives <= 0) return;
    if (answer.trim() === "") return;

    const userAns = Number(answer);

    if (userAns === solution) {
      playSfx(correctSfx);
      setFeedbackOverlay("correct");
      setScore((prev) => prev + 10);
      setMsg("✅ Correct! Loading next...");
      setTimeout(() => {
        setFeedbackOverlay(null);
        loadQuestion();
      }, 1500);
    } else {
      playSfx(wrongSfx);
      setFeedbackOverlay("wrong");
      setLives((prev) => prev - 1);
      setMsg("❌ Wrong! Loading next...");
      setTimeout(() => {
        setFeedbackOverlay(null);
        loadQuestion();
      }, 1500);
    }
  };

  const restart = () => {
    setScore(0);
    setLives(isHard ? 2 : 3);
    setTimeLeft(isHard ? 20 : 60);
    setMsg("Quest is ready.");
    loadQuestion();
  };

  return (
    <div className="page">
      {feedbackOverlay && (
        <div className={`feedback-popup-wrap ${feedbackOverlay}`}>
          <div className="feedback-popup-content">
            <div className="monkey-svg-container">
              <svg viewBox="0 0 100 100" className="monkey-animated-svg">
                {/* Monkey face */}
                <circle cx="50" cy="50" r="40" fill="#8B4513" />
                <circle cx="15" cy="40" r="12" fill="#8B4513" />
                <circle cx="85" cy="40" r="12" fill="#8B4513" />
                <ellipse cx="50" cy="62" rx="30" ry="20" fill="#F3E5AB" />
                <circle cx="38" cy="48" r="4" fill="black" />
                <circle cx="62" cy="48" r="4" fill="black" />
                <path d="M40 75 Q50 82 60 75" stroke="black" strokeWidth="2" fill="none" className="monkey-mouth-path" />
                {feedbackOverlay === "correct" && (
                  <path d="M70 20 Q80 20 85 35 Q80 40 70 35 Q65 30 70 20" fill="#FFE135" className="falling-banana-svg" />
                )}
              </svg>
            </div>
            <div className="feedback-info">
              <span className="feedback-badge">{feedbackOverlay === "correct" ? "EXCELLENT" : "OOPS!"}</span>
              <h3>{feedbackOverlay === "correct" ? "Very GOOD! 🍌" : "Wrong Answer! 😢"}</h3>
            </div>
          </div>
        </div>
      )}
      <div className="game-wrap">

        <div className="game-board">
          {imgUrl ? (
            <img className="banana-img" src={imgUrl} alt="Banana puzzle" />
          ) : (
            <p>Loading image...</p>
          )}
        </div>

        <p className="game-status">{msg}</p>

        <div className="game-hud">
          <span>Score: {score}</span>
          <span>High Score: {highScore}</span>
          <span>Lives: {lives}</span>
          <span className={timeLeft <= 10 ? 'timer-warning' : ''}>Time: {timeLeft}s</span>
        </div>

        {lives <= 0 ? (
          <div>
            <h2 className="game-over">Game Over 😢</h2>
            <p className="game-status">Final Score: {score}</p>
            <button className="game-btn" onClick={restart}>
              Restart
            </button>
          </div>
        ) : (
          <div className="answer-area">
            <div className="answer-label">Enter the missing digit:</div>

            <input
              className="answer-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              inputMode="numeric"
              maxLength={1}
              placeholder=""
            />

            <button className="game-btn" onClick={submit}>
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;