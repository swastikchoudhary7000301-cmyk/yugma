import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const LoginForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const data = response.data;

      console.log("Login response:", data);

      /*
       * Expected backend response:
       * {
       *   success: true,
       *   message: "...",
       *   token: "...",
       *   user: {...}
       * }
       */

      const token = data.token;
      const user = data.user;

      if (!token) {
        throw new Error(
          "Login succeeded, but the server did not return a token."
        );
      }

      // Save JWT for all protected API requests.
      localStorage.setItem("token", token);

      // Save user information for the frontend.
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Notify AuthContext or other components that login occurred.
      window.dispatchEvent(new Event("auth-change"));

      // Go to dashboard.
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to log in. Please check your credentials.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <div className="auth-field">
        <label htmlFor="login-email">Email address</label>

        <div className="auth-input-wrapper">
          <Mail size={18} className="auth-input-icon" />

          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            disabled={loading}
          />
        </div>
      </div>

      <div className="auth-field">
        <div className="auth-label-row">
          <label htmlFor="login-password">Password</label>

          <Link to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <div className="auth-input-wrapper">
          <Lock size={18} className="auth-input-icon" />

          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            disabled={loading}
          />

          <button
            type="button"
            className="auth-password-toggle"
            onClick={() =>
              setShowPassword((previous) => !previous)
            }
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="auth-submit-button"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2
              size={18}
              className="auth-spinner"
            />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
};

export default LoginForm;