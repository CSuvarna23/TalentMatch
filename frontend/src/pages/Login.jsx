import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  loginUser,
  getCurrentUser,
} from "../services/authService";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginUser(
        formData.email,
        formData.password
      );

      const userData = await getCurrentUser();

      login(userData);

      if (userData.role === "hr") {
  navigate("/hr/dashboard");
} else if (userData.role === "candidate") {
  navigate("/candidate/dashboard");
}

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form
        className="auth-card"
        onSubmit={handleSubmit}
      >
        <h1> Recruitment Portal</h1>

        <h2>Login</h2>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <label>Email</label>

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button
          className="button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;