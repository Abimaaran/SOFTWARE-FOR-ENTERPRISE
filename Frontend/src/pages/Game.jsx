import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./Game.css";

function Game() {
  const { difficulty } = useParams();
  const isHard = difficulty === "hard";
  const isMedium = difficulty === "medium";
  const isEasy = difficulty === "easy";

  const getInitialLives = () => {
    if (isHard) return 2;
    if (isMedium) return 3;
    return 5; // Easy
  };

  const getInitialTime = () => {
    if (isHard) return 20;
    if (isMedium) return 50;
    return 999; // Placeholder for Easy (timer will be ignored)
  };

  const getHighScoreKey = () => {
    if (isHard) return "highScoreHard";
    if (isMedium) return "highScoreMedium";
    return "highScoreEasy";
  };

  const [imgUrl, setImgUrl] = useState("");
  const [solution, setSolution] = useState(null);
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("Quest is ready.");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem(getHighScoreKey())) || 0
  );
  const [lives, setLives] = useState(getInitialLives());
  const [timeLeft, setTimeLeft] = useState(getInitialTime());
  const [isPaused, setIsPaused] = useState(false);
  const [feedbackOverlay, setFeedbackOverlay] = useState(null); // 'correct' or 'wrong'
  const [bananaCount, setBananaCount] = useState(
    Number(localStorage.getItem("bananaCount")) || 20
  );
  const [consecutiveWins, setConsecutiveWins] = useState(0);

  // Power-up States
  const [isTimeBreakActive, setIsTimeBreakActive] = useState(false);
  const [isDoubleScoreActive, setIsDoubleScoreActive] = useState(false);
  const [timeBreakCooldown, setTimeBreakCooldown] = useState(false);
  const [extraLifeCooldown, setExtraLifeCooldown] = useState(false);
  const [doubleScoreCooldown, setDoubleScoreCooldown] = useState(false);

  // Per-power inventory counts
  const [timeBreakPowers, setTimeBreakPowers] = useState(
    Number(localStorage.getItem("timeBreakPowers")) || 1
  );
  const [extraLifePowers, setExtraLifePowers] = useState(
    Number(localStorage.getItem("extraLifePowers")) || 1
  );
  const [doubleScorePowers, setDoubleScorePowers] = useState(
    Number(localStorage.getItem("doubleScorePowers")) || 1
  );

  // Listen for shop purchase events to update power counts live
  useEffect(() => {
    const handleShopUpdate = () => {
      setTimeBreakPowers(Number(localStorage.getItem("timeBreakPowers")) || 0);
      setExtraLifePowers(Number(localStorage.getItem("extraLifePowers")) || 0);
      setDoubleScorePowers(Number(localStorage.getItem("doubleScorePowers")) || 0);
      setBananaCount(Number(localStorage.getItem("bananaCount")) || 0);
    };
    window.addEventListener("shop_purchase", handleShopUpdate);
    return () => window.removeEventListener("shop_purchase", handleShopUpdate);
  }, []);

  // Sync localStorage with DB on mount
  useEffect(() => {
    const syncFromDB = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://localhost:5000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const d = res.data;
        localStorage.setItem("bananaCount", d.bananaCount);
        localStorage.setItem("timeBreakPowers", d.timeBreakPowers);
        localStorage.setItem("extraLifePowers", d.extraLifePowers);
        localStorage.setItem("doubleScorePowers", d.doubleScorePowers);
        localStorage.setItem("highScoreEasy", d.highScoreEasy);
        localStorage.setItem("highScoreMedium", d.highScoreMedium);
        localStorage.setItem("highScoreHard", d.highScoreHard);
        setBananaCount(d.bananaCount);
        setTimeBreakPowers(d.timeBreakPowers);
        setExtraLifePowers(d.extraLifePowers);
        setDoubleScorePowers(d.doubleScorePowers);
        setHighScore(d[getHighScoreKey()] || 0);
      } catch (err) {
        console.error("Failed to sync from DB", err);
      }
    };
    syncFromDB();
  }, []);

  const updateBananasInDB = async (amount) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.put(
        "http://localhost:5000/auth/update-bananas",
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to update bananas", error);
    }
  };

  const usePowerInDB = async (powerType) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.put(
        "http://localhost:5000/auth/use-power",
        { powerType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to use power", error);
    }
  };

  // Audio References
  const [correctSfx] = useState(new Audio("/sound/correct.wav")); // Clapping/Applause
  const [wrongSfx] = useState(new Audio("/sound/wrong.wav")); // "Awww" / Disappointment sound
  const [gameOverSfx] = useState(new Audio("/sound/gameover.wav"));

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
      setTimeLeft(getInitialTime());

      // Reset powerup effects and cooldowns for the next question so time is normal
      setIsTimeBreakActive(false);
      setTimeBreakCooldown(false);
      setExtraLifeCooldown(false);
      setDoubleScoreCooldown(false);

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
    if (lives <= 0 || isPaused || isEasy || isTimeBreakActive) return;

    if (timeLeft === 0) {
      playSfx(wrongSfx);
      setFeedbackOverlay("timeup");
      setConsecutiveWins(0);
      setMsg("⏰ Time up!...");

      setTimeout(() => {
        const newLives = lives - 1;
        setLives(newLives);

        if (newLives <= 0) {
          setFeedbackOverlay("gameover");
          handleGameOver();
        } else {
          setFeedbackOverlay(null);
          loadQuestion();
        }
      }, 1500);

      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, lives, isPaused, isEasy, isTimeBreakActive]);

  // Removed useEffect for lives <= 0, handled explicitly in timers

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
        localStorage.setItem(getHighScoreKey(), newHighScore);
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

      const pointsEarned = isDoubleScoreActive ? 20 : 10;
      setScore((prev) => prev + pointsEarned);
      if (isDoubleScoreActive) {
        setIsDoubleScoreActive(false);
      }

      const newStreak = consecutiveWins + 1;
      if (newStreak === 3) {
        setConsecutiveWins(0);
        setBananaCount((prev) => {
          const newCount = prev + 20;
          localStorage.setItem("bananaCount", newCount);
          return newCount;
        });
        setMsg("🔥 X3 Combo! Bananas Increased! Loading next...");
        updateBananasInDB(20);
      } else {
        setConsecutiveWins(newStreak);
        setMsg("✅ Correct! Loading next...");
      }

      setTimeout(() => {
        setFeedbackOverlay(null);
        loadQuestion();
      }, 1500);
    } else {
      playSfx(wrongSfx);
      setFeedbackOverlay("wrong");
      setConsecutiveWins(0);
      setMsg("❌ Wrong!...");

      setTimeout(() => {
        const newLives = lives - 1;
        setLives(newLives);

        if (newLives <= 0) {
          setFeedbackOverlay("gameover");
          handleGameOver();
        } else {
          setFeedbackOverlay(null);
          loadQuestion();
        }
      }, 1500);
    }
  };

  const handleTimeBreak = () => {
    if (timeBreakCooldown || isPaused || isTimeBreakActive || timeBreakPowers <= 0) return;
    setTimeBreakPowers((prev) => { const n = prev - 1; localStorage.setItem("timeBreakPowers", n); return n; });
    usePowerInDB("timeBreak");
    setIsTimeBreakActive(true);
    setTimeBreakCooldown(true);
    setMsg("⏳ Time Break Activated! (5s)");
    setTimeout(() => {
      setIsTimeBreakActive(false);
      setMsg("Quest is ready.");
    }, 5000);
  };

  const handleExtraLife = () => {
    if (extraLifeCooldown || lives <= 0 || extraLifePowers <= 0) return;
    setExtraLifePowers((prev) => { const n = prev - 1; localStorage.setItem("extraLifePowers", n); return n; });
    usePowerInDB("extraLife");
    setLives((prev) => prev + 1);
    setExtraLifeCooldown(true);
    setMsg("🛡️ Extra Life Added!");
    setTimeout(() => setMsg("Quest is ready."), 2000);
  };

  const handleDoubleScore = () => {
    if (doubleScoreCooldown || lives <= 0 || doubleScorePowers <= 0) return;
    setDoubleScorePowers((prev) => { const n = prev - 1; localStorage.setItem("doubleScorePowers", n); return n; });
    usePowerInDB("doubleScore");
    setIsDoubleScoreActive(true);
    setDoubleScoreCooldown(true);
    setMsg("⚡ Double Score Activated! (Next Answer)");
  };

  const restart = () => {
    setScore(0);
    setLives(getInitialLives());
    setTimeLeft(getInitialTime());
    setConsecutiveWins(0);
    setFeedbackOverlay(null);
    setTimeBreakCooldown(false);
    setExtraLifeCooldown(false);
    setDoubleScoreCooldown(false);
    setIsTimeBreakActive(false);
    setIsDoubleScoreActive(false);
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
              <span className="feedback-badge">
                {feedbackOverlay === "correct" ? "EXCELLENT" :
                  feedbackOverlay === "timeup" ? "TOO LATE" :
                    feedbackOverlay === "gameover" ? "GAME OVER" : "OOPS!"}
              </span>
              <h3>
                {feedbackOverlay === "correct" ? "Very GOOD! 🍌" :
                  feedbackOverlay === "timeup" ? "Too Late! ⏰" :
                    feedbackOverlay === "gameover" ? "Out of Lives! 💔" : "Wrong Answer! 😢"}
              </h3>
              {feedbackOverlay === "gameover" && (
                <div style={{ marginTop: '15px' }}>
                  <h2 style={{ color: '#8B4513', margin: '10px 0 15px 0' }}>Final Score: {score}</h2>
                  <button className="game-btn" onClick={() => window.location.reload()}>
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="game-wrap">

        <div className="game-content-row">
          <div className="game-board">
            {imgUrl ? (
              <img className="banana-img" src={imgUrl} alt="Banana puzzle" />
            ) : (
              <p>Loading image...</p>
            )}
          </div>

          <div className="powerups-container">
            <button
              className={`powerup-btn time-break-btn ${timeBreakCooldown ? 'used' : ''}`}
              onClick={handleTimeBreak}
              disabled={timeBreakCooldown || isTimeBreakActive || lives <= 0 || isEasy || timeBreakPowers <= 0}
            >
              <span className="powerup-icon">⏳</span>
              <span className="powerup-text">{timeBreakCooldown ? "Used" : "Time Break"}</span>
              <span className="powerup-count">{timeBreakPowers}</span>
            </button>
            <button
              className={`powerup-btn extra-life-btn ${extraLifeCooldown ? 'used' : ''}`}
              onClick={handleExtraLife}
              disabled={extraLifeCooldown || lives <= 0 || extraLifePowers <= 0}
            >
              <span className="powerup-icon">🛡️</span>
              <span className="powerup-text">{extraLifeCooldown ? "Used" : "+1 Life"}</span>
              <span className="powerup-count">{extraLifePowers}</span>
            </button>
            <button
              className={`powerup-btn double-score-btn ${doubleScoreCooldown ? 'used' : ''}`}
              onClick={handleDoubleScore}
              disabled={doubleScoreCooldown || lives <= 0 || doubleScorePowers <= 0}
            >
              <span className="powerup-icon">⚡</span>
              <span className="powerup-text">{doubleScoreCooldown ? "Used" : "2x Score"}</span>
              <span className="powerup-count">{doubleScorePowers}</span>
            </button>
          </div>
        </div>

        <p className="game-status">{msg}</p>

        <div className="game-hud">
          <span className="hud-score">Score: {score}</span>
          <span className="hud-highscore">High Score: {highScore}</span>
          <span className="hud-lives">Lives: {lives}</span>
          <span className="hud-bananas">Bananas: {bananaCount}</span>
          {consecutiveWins > 0 && <span className="hud-combo">Combo: {consecutiveWins}/3</span>}
          {!isEasy && (
            <span className={`hud-time ${timeLeft <= 10 ? 'timer-warning' : ''}`}>Time: {timeLeft}s</span>
          )}
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