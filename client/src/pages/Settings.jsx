import {
  Bell,
  Lock,
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="simple-page">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar-inner">
          <Link
            to="/dashboard"
            className="yugma-logo"
          >
            <span className="yugma-logo-mark">
              Y
            </span>
            Yugma
          </Link>
        </div>
      </header>

      <main className="settings-layout">
        <div className="simple-page-header">
          <h1>Settings</h1>

          <p>
            Manage your Yugma account and
            preferences.
          </p>
        </div>

        <section className="settings-section">
          <h2>Account</h2>

          <div className="settings-row">
            <div>
              <strong>Profile</strong>
              <span>
                Update your professional profile.
              </span>
            </div>

            <Link
              to="/edit-profile"
              className="secondary-button"
            >
              Edit
            </Link>
          </div>

          <div className="settings-row">
            <div>
              <strong>Email & password</strong>
              <span>
                Manage your account credentials.
              </span>
            </div>

            <Lock size={18} />
          </div>
        </section>

        <section className="settings-section">
          <h2>Preferences</h2>

          <div className="settings-row">
            <div>
              <strong>Notifications</strong>
              <span>
                Control how Yugma keeps you
                updated.
              </span>
            </div>

            <Bell size={18} />
          </div>

          <div className="settings-row">
            <div>
              <strong>Privacy</strong>
              <span>
                Manage your profile visibility
                and interactions.
              </span>
            </div>

            <Shield size={18} />
          </div>
        </section>

        <section className="settings-section">
          <h2>Session</h2>

          <div className="settings-row">
            <div>
              <strong>Sign out</strong>
              <span>
                Sign out from this Yugma account.
              </span>
            </div>

            <button
              className="danger-button"
              onClick={handleLogout}
            >
              <LogOut
                size={14}
                style={{
                  verticalAlign: "middle",
                  marginRight: 5,
                }}
              />
              Sign out
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;