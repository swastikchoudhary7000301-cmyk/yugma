import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageCircle,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

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

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page yugma-auth-page">
      <section className="auth-visual-panel">
        <Link to="/login" className="auth-brand">
          <span className="auth-brand-mark">Y</span>
          <span className="auth-brand-name">Yugma</span>
        </Link>

        <div className="auth-visual-content">
          <span className="auth-eyebrow">YOUR PROFESSIONAL COMMUNITY</span>
          <h1>Where professionals<br />connect and grow.</h1>
          <p>
            Share ideas, discover people, build meaningful connections
            and have better professional conversations.
          </p>

          <div className="auth-benefits">
            <div className="auth-benefit">
              <div className="auth-benefit-icon"><Users size={19} /></div>
              <div><strong>Build your network</strong><span>Find people who share your interests and goals.</span></div>
            </div>
            <div className="auth-benefit">
              <div className="auth-benefit-icon"><MessageCircle size={19} /></div>
              <div><strong>Real-time conversations</strong><span>Message your connections without leaving Yugma.</span></div>
            </div>
            <div className="auth-benefit">
              <div className="auth-benefit-icon"><Zap size={19} /></div>
              <div><strong>Share what matters</strong><span>Post projects, ideas, achievements and questions.</span></div>
            </div>
          </div>
        </div>

        <div className="auth-visual-footer">
          <span>© 2026 Yugma</span>
          <span>Connect. Share. Grow.</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-brand">
            <Link to="/login" className="auth-brand">
              <span className="auth-brand-mark">Y</span>
              <span className="auth-brand-name">Yugma</span>
            </Link>
          </div>

          <div className="auth-heading">
            <span className="auth-mobile-eyebrow">WELCOME BACK</span>
            <h2>Sign in to Yugma</h2>
            <p>Continue the conversations and communities that matter to you.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
              </div>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="auth-error" role="alert">{error}</div>}

            <button type="submit" className="auth-submit-button" disabled={loading}>
              {loading ? "Signing in..." : <><span>Sign in</span><ArrowRight size={17} /></>}
            </button>
          </form>

          <div className="auth-security-note">
            <ShieldCheck size={17} />
            <span>Your session is protected with secure authentication.</span>
          </div>

          <p className="auth-switch">
            New to Yugma? <Link to="/signup">Create an account</Link>
          </p>

          <p className="auth-legal">
            By continuing, you agree to Yugma's community guidelines and terms.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
