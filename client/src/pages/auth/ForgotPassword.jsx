import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import api from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/forgot-password",
        {
          email: email.trim(),
        }
      );

      setMessage(
        response.data?.message ||
          "If an account exists with this email, password reset instructions have been sent."
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ================= LEFT PANEL ================= */}

      <section className="auth-visual-panel">
        <div className="auth-visual-content">
          <Link
            to="/login"
            className="auth-brand"
          >
            <span className="auth-brand-mark">
              Y
            </span>

            <span className="auth-brand-name">
              Yugma
            </span>
          </Link>

          <div className="auth-hero-content">
            <span className="auth-eyebrow">
              ACCOUNT SECURITY
            </span>

            <h1>
              Get back to
              <br />
              <span>your network.</span>
            </h1>

            <p>
              Don't worry. It happens to everyone.
              We'll help you get back into your
              Yugma account securely.
            </p>

            <div className="auth-benefits">
              <div className="auth-benefit">
                <div className="auth-benefit-icon">
                  <KeyRound size={19} />
                </div>

                <div>
                  <strong>
                    Reset your password
                  </strong>

                  <span>
                    Request secure instructions
                    using your registered email.
                  </span>
                </div>
              </div>

              <div className="auth-benefit">
                <div className="auth-benefit-icon">
                  <Mail size={19} />
                </div>

                <div>
                  <strong>
                    Check your inbox
                  </strong>

                  <span>
                    Follow the instructions sent
                    to your email address.
                  </span>
                </div>
              </div>

              <div className="auth-benefit">
                <div className="auth-benefit-icon">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <strong>
                    Stay protected
                  </strong>

                  <span>
                    Keep your account secure with
                    a strong password.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-visual-footer">
            <span>
              © 2026 Yugma
            </span>

            <span>
              Connect. Share. Grow.
            </span>
          </div>
        </div>

        <div className="auth-glow auth-glow-one" />
        <div className="auth-glow auth-glow-two" />
      </section>

      {/* ================= RIGHT PANEL ================= */}

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-brand">
            <Link
              to="/login"
              className="auth-brand"
            >
              <span className="auth-brand-mark">
                Y
              </span>

              <span className="auth-brand-name">
                Yugma
              </span>
            </Link>
          </div>

          <Link
            to="/login"
            className="auth-back-link"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>

          <div className="auth-heading">
            <span className="auth-mobile-eyebrow">
              RESET PASSWORD
            </span>

            <h2>
              Forgot your password?
            </h2>

            <p>
              Enter the email connected to your
              Yugma account and we'll help you
              reset your password.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="auth-field">
              <label htmlFor="forgot-email">
                Email address
              </label>

              <div className="auth-input-wrapper">
                <Mail
                  size={18}
                  className="auth-input-icon"
                />

                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {message && (
              <div className="auth-success">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? (
                <span>
                  Sending...
                </span>
              ) : (
                <>
                  <span>
                    Send reset instructions
                  </span>

                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch">
            <span>
              Remember your password?
            </span>

            <Link to="/login">
              Sign in
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="auth-legal">
            <p>
              Your account security matters.
              Never share your password or reset
              link with anyone.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;