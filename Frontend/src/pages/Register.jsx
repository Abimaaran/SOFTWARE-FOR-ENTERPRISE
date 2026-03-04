import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {

    try {

      await axios.post("http://localhost:5000/auth/register", {
        username,
        email,
        password
      });

      alert("Registration Successful ✅");

      navigate("/");

    } catch (error) {

      alert("Registration Failed ❌");

    }

  };

  return (
    <div>

      <h2>Register</h2>

      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>
        Register
      </button>

      <p>Already have an account?</p>

      <button onClick={() => navigate("/")}>
        Back to Login
      </button>

    </div>
  );

}

export default Register;