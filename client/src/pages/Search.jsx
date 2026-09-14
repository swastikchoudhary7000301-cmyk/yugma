import {
  Search as SearchIcon,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import {
  sendConnectionRequest,
} from "../services/connectionservice";

const Search = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(query);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const searchUsers = async (value) => {
    if (!value.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/users/search?q=${encodeURIComponent(
          value.trim()
        )}`
      );

      setUsers(
        response.data?.users ||
          response.data?.data ||
          []
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to search users."
      );
    } finally {
      setLoading(false);
    }
  };

  const connect = async (userId) => {
    try {
      await sendConnectionRequest(userId);

      setUsers((previous) =>
        previous.map((user) =>
          user._id === userId
            ? {
                ...user,
                requestSent: true,
              }
            : user
        )
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to send connection request."
      );
    }
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

      <main className="discovery-layout">
        <div className="discovery-header">
          <h1>Find people</h1>

          <p>
            Discover professionals and creators
            to grow your network.
          </p>
        </div>

        <div className="discovery-search">
          <SearchIcon size={19} />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search by name, email or headline..."
          />
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {loading && (
          <div className="page-message">
            Searching...
          </div>
        )}

        {!loading &&
          query &&
          users.length === 0 && (
            <div className="page-message">
              <Users
                size={25}
                style={{
                  marginBottom: 10,
                }}
              />

              <div>
                No people found for
                <strong> "{query}"</strong>.
              </div>
            </div>
          )}

        <div className="discovery-grid">
          {users.map((person) => (
            <div
              className="discovery-user-card"
              key={person._id}
            >
              <Link
                to={`/profile/${person._id}`}
              >
                <img
                  src={
                    person.profilePicture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      person.name || "User"
                    )}&background=635bff&color=fff`
                  }
                  alt={person.name}
                />
              </Link>

              <strong>
                {person.name}
              </strong>

              <span>
                {person.headline ||
                  "Yugma member"}
              </span>

              <button
                className="primary-button"
                disabled={person.requestSent}
                onClick={() =>
                  connect(person._id)
                }
              >
                <UserPlus
                  size={14}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 5,
                  }}
                />

                {person.requestSent
                  ? "Request sent"
                  : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Search;