import {
  Bell,
  Check,
  MessageCircle,
  UserPlus,
  Heart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

const Notifications = () => {
  const [notifications, setNotifications] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/notifications"
      );

      setNotifications(
        response.data?.notifications ||
          response.data?.data ||
          []
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    if (type === "connection") {
      return <UserPlus size={18} />;
    }

    if (type === "like") {
      return <Heart size={18} />;
    }

    if (type === "message") {
      return <MessageCircle size={18} />;
    }

    return <Bell size={18} />;
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

      <main className="simple-page-layout">
        <div className="simple-page-header">
          <h1>Notifications</h1>

          <p>
            Stay updated with everything
            happening in your network.
          </p>
        </div>

        {loading && (
          <div className="page-message">
            Loading notifications...
          </div>
        )}

        {error && (
          <div className="page-message page-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          notifications.length === 0 && (
            <div className="page-message">
              <Bell
                size={25}
                style={{
                  marginBottom: 10,
                }}
              />

              <div>
                You're all caught up.
              </div>
            </div>
          )}

        <div className="notification-list">
          {notifications.map(
            (notification) => (
              <div
                className="notification-item"
                key={notification._id}
              >
                <div className="notification-icon">
                  {getIcon(
                    notification.type
                  )}
                </div>

                <div>
                  <p>
                    {notification.message}
                  </p>

                  <span>
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </span>
                </div>

                {notification.read && (
                  <Check
                    size={15}
                    style={{
                      marginLeft: "auto",
                      color: "#19a974",
                    }}
                  />
                )}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;