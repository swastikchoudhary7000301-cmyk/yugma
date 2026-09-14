import { Chrome } from "lucide-react";
import { useState } from "react";

const GoogleLogin = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    try {
      setLoading(true);

      const googleUrl =
        import.meta.env.VITE_GOOGLE_AUTH_URL ||
        "http://localhost:5000/api/auth/google";

      window.location.href = googleUrl;
    } catch (error) {
      console.error(
        "Google authentication error:",
        error
      );

      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="auth-google-button"
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      <span className="auth-google-icon">
        <Chrome size={18} />
      </span>

      <span>
        {loading
          ? "Connecting..."
          : "Continue with Google"}
      </span>
    </button>
  );
};

export default GoogleLogin;