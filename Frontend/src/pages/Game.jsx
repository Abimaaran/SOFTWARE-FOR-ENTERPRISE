import { useEffect, useState } from "react";
import axios from "axios";
import "./Game.css";

function Game() {
  const [imgUrl, setImgUrl] = useState("");
  const [solution, setSolution] = useState(null);
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("Quest is ready.");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);

  const loadQuestion = async () => {
    try {
      setMsg("Loading...");
      setAnswer("");
      setTimeLeft(60);

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
    if (lives <= 0) return;

    if (timeLeft === 0) {
      setLives((prev) => prev - 1);
      setMsg("⏰ Time up! Loading next...");
      loadQuestion();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, lives]);

  const submit = () => {
    if (lives <= 0) return;
    if (answer.trim() === "") return;

    const userAns = Number(answer);

    if (userAns === solution) {
      setScore((prev) => prev + 10);
      setMsg("✅ Correct! Loading next...");
      loadQuestion();
    } else {
      setLives((prev) => prev - 1);
      setMsg("❌ Wrong! Loading next...");
      loadQuestion();
    }
  };

  const restart = () => {
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setMsg("Quest is ready.");
    loadQuestion();
  };

  return (
    <div className="page">
      <div className="game-wrap">
        <h1 className="game-title">The Banana Game</h1>

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