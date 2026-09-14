import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageCircle,
  User,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (name.length < 2) return setError("Please enter your full name.");
    if (!email) return setError("Please enter your email address.");
    if (password.length < 6) return setError("Password must contain at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    try {
      setLoading(true);
      await register({ name, email, password });
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page yugma-auth-page">
      <section className="auth-visual-panel signup-visual-panel">
        <Link to="/login" className="auth-brand">
          <span className="auth-brand-mark">Y</span>
          <span className="auth-brand-name">Yugma</span>
        </Link>

        <div className="auth-visual-content">
          <span className="auth-eyebrow">JOIN THE NETWORK</span>
          <h1>Your ideas deserve<br />a professional audience.</h1>
          <p>
            Create your Yugma profile and start building a network around
            the work, skills and ideas you care about.
          </p>

          <div className="auth-benefits">
            <div className="auth-benefit">
              <div className="auth-benefit-icon"><Users size={19} /></div>
              <div><strong>Meet your network</strong><span>Discover professionals, creators and builders.</span></div>
            </div>
            <div className="auth-benefit">
              <div className="auth-benefit-icon"><MessageCircle size={19} /></div>
              <div><strong>Talk directly</strong><span>Turn useful connections into real conversations.</span></div>
            </div>
            <div className="auth-benefit">
              <div className="auth-benefit-icon"><Zap size={19} /></div>
              <div><strong>Grow in public</strong><span>Share progress, projects and professional wins.</span></div>
            </div>
          </div>
        </div>

        <div className="auth-visual-footer">
          <span>© 2026 Yugma</span>
          <span>Connect. Share. Grow.</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container auth-signup-container">
          <div className="auth-mobile-brand">
            <Link to="/login" className="auth-brand">
              <span className="auth-brand-mark">Y</span>
              <span className="auth-brand-name">Yugma</span>
            </Link>
          </div>

          <div className="auth-heading">
            <span className="auth-mobile-eyebrow">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Join the professional conversation in a few seconds.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="signup-name">Full name</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input id="signup-name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Your full name" autoComplete="name" disabled={loading} />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input id="signup-email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" disabled={loading} />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input id="signup-password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="At least 6 characters" autoComplete="new-password" disabled={loading} />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)} disabled={loading} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-confirm-password">Confirm password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input id="signup-confirm-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" autoComplete="new-password" disabled={loading} />
                <button type="button" className="auth-password-toggle" onClick={() => setShowConfirmPassword((value) => !value)} disabled={loading} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="auth-error" role="alert">{error}</div>}

            <button type="submit" className="auth-submit-button" disabled={loading}>
              {loading ? "Creating account..." : <><span>Create account</span><ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <p className="auth-legal">
            By creating an account, you agree to Yugma's community guidelines and terms.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Signup;
