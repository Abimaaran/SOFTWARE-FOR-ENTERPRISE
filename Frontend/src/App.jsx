import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Game from "./pages/Game";



function App() {
  return (
    <div className="app-container">

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>

      


    </div>
  );
}

export default App;