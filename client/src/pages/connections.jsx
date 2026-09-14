import {
  Check,
  MessageCircle,
  Search,
  UserPlus,
  Users,
  UserCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  acceptConnectionRequest,
  getMyConnections,
  getPendingRequests,
  getSuggestions,
  rejectConnectionRequest,
  sendConnectionRequest,
} from "../services/connectionservice";
import { createConversation } from "../services/chatservice";

const Connections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("connections");
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        connectionsResponse,
        requestsResponse,
        suggestionsResponse,
      ] = await Promise.all([
        getMyConnections(),
        getPendingRequests(),
        getSuggestions(),
      ]);

      setConnections(
        connectionsResponse?.connections ||
          connectionsResponse?.data ||
          []
      );

      setRequests(
        requestsResponse?.requests ||
          requestsResponse?.data ||
          []
      );

      setSuggestions(
        suggestionsResponse?.suggestions ||
          suggestionsResponse?.data ||
          []
      );
    } catch (err) {
      console.error(
        "Failed to load connections:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load your network."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPersonFromConnection = (connection) => {
    if (!connection) return null;

    const requester =
      connection.requester || {};
    const recipient =
      connection.recipient || {};

    const currentUserId =
      String(user?._id || user?.id || "");

    const requesterId = String(
      requester?._id ||
        requester?.id ||
        requester
    );

    if (
      currentUserId &&
      requesterId === currentUserId
    ) {
      return recipient;
    }

    return requester;
  };

  const getRequestSender = (request) => {
    if (!request) return null;

    return (
      request.requester ||
      request.sender ||
      request.user ||
      {}
    );
  };

  const normalizePerson = (person) => {
    if (!person) return {};

    return {
      ...person,
      _id:
        person._id ||
        person.id ||
        person.userId ||
        "",
      name:
        person.name ||
        "Yugma member",
      headline:
        person.headline ||
        "Yugma member",
      profilePicture:
        person.profilePicture ||
        person.avatar ||
        "",
      location:
        person.location ||
        "",
      bio:
        person.bio ||
        "",
      skills:
        Array.isArray(person.skills)
          ? person.skills
          : [],
    };
  };

  const filteredConnections = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return connections;

    return connections.filter(
      (connection) => {
        const person = normalizePerson(
          getPersonFromConnection(
            connection
          )
        );

        return (
          person.name
            .toLowerCase()
            .includes(query) ||
          person.headline
            .toLowerCase()
            .includes(query) ||
          person.location
            .toLowerCase()
            .includes(query)
        );
      }
    );
  }, [connections, search]);

  const filteredSuggestions = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return suggestions;

    return suggestions.filter(
      (person) => {
        const normalized =
          normalizePerson(person);

        return (
          normalized.name
            .toLowerCase()
            .includes(query) ||
          normalized.headline
            .toLowerCase()
            .includes(query) ||
          normalized.location
            .toLowerCase()
            .includes(query)
        );
      }
    );
  }, [suggestions, search]);

  const filteredRequests = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return requests;

    return requests.filter(
      (request) => {
        const person =
          normalizePerson(
            getRequestSender(request)
          );

        return (
          person.name
            .toLowerCase()
            .includes(query) ||
          person.headline
            .toLowerCase()
            .includes(query)
        );
      }
    );
  }, [requests, search]);

  const setLoadingFor = (
    id,
    value
  ) => {
    setActionLoading((previous) => ({
      ...previous,
      [id]: value,
    }));
  };

  const showSuccess = (text) => {
    setSuccess(text);

    setTimeout(() => {
      setSuccess("");
    }, 2500);
  };

  const handleSendRequest = async (
    person
  ) => {
    const personId =
      person?._id || person?.id;

    if (!personId) return;

    try {
      setLoadingFor(
        `request-${personId}`,
        true
      );
      setError("");

      await sendConnectionRequest(
        personId
      );

      setSuggestions((previous) =>
        previous.filter(
          (item) =>
            String(
              item?._id ||
                item?.id
            ) !== String(personId)
        )
      );

      showSuccess(
        "Connection request sent."
      );
    } catch (err) {
      console.error(
        "Send connection request error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to send request."
      );
    } finally {
      setLoadingFor(
        `request-${personId}`,
        false
      );
    }
  };

  const handleAccept = async (
    request
  ) => {
    const requestId =
      request?._id ||
      request?.id ||
      request?.connectionId;

    if (!requestId) return;

    try {
      setLoadingFor(
        `accept-${requestId}`,
        true
      );
      setError("");

      await acceptConnectionRequest(
        requestId
      );

      const acceptedPerson =
        normalizePerson(
          getRequestSender(request)
        );

      setRequests((previous) =>
        previous.filter(
          (item) =>
            String(
              item?._id ||
                item?.id ||
                item?.connectionId
            ) !== String(requestId)
        )
      );

      if (acceptedPerson._id) {
        setConnections((previous) => [
          {
            _id: requestId,
            requester:
              request.requester,
            recipient:
              request.recipient,
          },
          ...previous,
        ]);
      }

      showSuccess(
        "Connection accepted."
      );
    } catch (err) {
      console.error(
        "Accept connection error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to accept request."
      );
    } finally {
      setLoadingFor(
        `accept-${requestId}`,
        false
      );
    }
  };

  const handleReject = async (
    request
  ) => {
    const requestId =
      request?._id ||
      request?.id ||
      request?.connectionId;

    if (!requestId) return;

    try {
      setLoadingFor(
        `reject-${requestId}`,
        true
      );
      setError("");

      await rejectConnectionRequest(
        requestId
      );

      setRequests((previous) =>
        previous.filter(
          (item) =>
            String(
              item?._id ||
                item?.id ||
                item?.connectionId
            ) !== String(requestId)
        )
      );

      showSuccess(
        "Connection request declined."
      );
    } catch (err) {
      console.error(
        "Reject connection error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to reject request."
      );
    } finally {
      setLoadingFor(
        `reject-${requestId}`,
        false
      );
    }
  };

  const handleMessage = async (
    person
  ) => {
    const personId =
      person?._id || person?.id;

    if (!personId) return;

    try {
      setLoadingFor(
        `message-${personId}`,
        true
      );

      const response =
        await createConversation(
          personId
        );

      const conversation =
        response?.conversation ||
        response?.data ||
        response;

      const conversationId =
        conversation?._id ||
        conversation?.id;

      if (conversationId) {
        navigate(
          `/chat?conversation=${conversationId}`
        );
      } else {
        navigate("/chat");
      }
    } catch (err) {
      console.error(
        "Create conversation error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start conversation."
      );
    } finally {
      setLoadingFor(
        `message-${personId}`,
        false
      );
    }
  };

  const renderAvatar = (
    person,
    size = "normal"
  ) => {
    const normalized =
      normalizePerson(person);

    const className =
      size === "large"
        ? "connection-avatar connection-avatar-large"
        : "connection-avatar";

    if (normalized.profilePicture) {
      return (
        <img
          src={normalized.profilePicture}
          alt={normalized.name}
          className={className}
        />
      );
    }

    return (
      <div className={`${className} avatar-fallback`}>
        {normalized.name
          .charAt(0)
          .toUpperCase()}
      </div>
    );
  };

  const renderConnectionCard = (
    connection
  ) => {
    const person = normalizePerson(
      getPersonFromConnection(
        connection
      )
    );

    const personId = person._id;

    return (
      <article
        className="connection-card"
        key={
          connection?._id ||
          personId
        }
      >
        <Link
          to={
            personId
              ? `/profile/${personId}`
              : "/profile"
          }
          className="connection-person"
        >
          {renderAvatar(person)}

          <div className="connection-person-info">
            <h3>{person.name}</h3>

            <p>
              {person.headline}
            </p>

            {person.location && (
              <span>
                {person.location}
              </span>
            )}
          </div>
        </Link>

        <div className="connection-card-actions">
          <button
            type="button"
            className="connection-message-button"
            onClick={() =>
              handleMessage(person)
            }
            disabled={
              actionLoading[
                `message-${personId}`
              ]
            }
          >
            <MessageCircle size={16} />

            {actionLoading[
              `message-${personId}`
            ]
              ? "Opening..."
              : "Message"}
          </button>
        </div>
      </article>
    );
  };

  const renderSuggestionCard = (
    personData
  ) => {
    const person =
      normalizePerson(personData);

    const personId = person._id;

    return (
      <article
        className="suggestion-card"
        key={personId}
      >
        <Link
          to={
            personId
              ? `/profile/${personId}`
              : "/profile"
          }
          className="suggestion-profile-link"
        >
          {renderAvatar(
            person,
            "large"
          )}

          <h3>{person.name}</h3>

          <p>
            {person.headline}
          </p>

          {person.location && (
            <span className="suggestion-location">
              {person.location}
            </span>
          )}
        </Link>

        {person.skills.length > 0 && (
          <div className="suggestion-skills">
            {person.skills
              .slice(0, 3)
              .map(
                (skill, index) => (
                  <span
                    key={index}
                  >
                    {typeof skill ===
                    "string"
                      ? skill
                      : skill.name ||
                        "Skill"}
                  </span>
                )
              )}
          </div>
        )}

        <button
          type="button"
          className="connect-button"
          onClick={() =>
            handleSendRequest(
              person
            )
          }
          disabled={
            actionLoading[
              `request-${personId}`
            ]
          }
        >
          <UserPlus size={16} />

          {actionLoading[
            `request-${personId}`
          ]
            ? "Sending..."
            : "Connect"}
        </button>
      </article>
    );
  };

  const renderRequestCard = (
    request
  ) => {
    const person =
      normalizePerson(
        getRequestSender(request)
      );

    const requestId =
      request?._id ||
      request?.id ||
      request?.connectionId;

    return (
      <article
        className="request-card"
        key={requestId}
      >
        <Link
          to={
            person._id
              ? `/profile/${person._id}`
              : "/profile"
          }
          className="request-person"
        >
          {renderAvatar(person)}

          <div className="request-person-info">
            <h3>{person.name}</h3>

            <p>
              {person.headline}
            </p>

            {person.location && (
              <span>
                {person.location}
              </span>
            )}
          </div>
        </Link>

        <div className="request-actions">
          <button
            type="button"
            className="accept-request-button"
            onClick={() =>
              handleAccept(request)
            }
            disabled={
              actionLoading[
                `accept-${requestId}`
              ] ||
              actionLoading[
                `reject-${requestId}`
              ]
            }
          >
            <Check size={16} />

            {actionLoading[
              `accept-${requestId}`
            ]
              ? "Accepting..."
              : "Accept"}
          </button>

          <button
            type="button"
            className="reject-request-button"
            onClick={() =>
              handleReject(request)
            }
            disabled={
              actionLoading[
                `accept-${requestId}`
              ] ||
              actionLoading[
                `reject-${requestId}`
              ]
            }
          >
            <X size={16} />

            {actionLoading[
              `reject-${requestId}`
            ]
              ? "Declining..."
              : "Decline"}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="connections-page">
      {/* ================= TOP BAR ================= */}

      <header className="connections-topbar">
        <div className="connections-brand">
          <Link to="/dashboard">
            <span className="brand-mark">
              Y
            </span>

            <span className="brand-name">
              Yugma
            </span>
          </Link>
        </div>

        <div className="connections-search">
          <Search size={18} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search your network..."
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="connections-user">
          <Link to="/profile">
            {renderAvatar(user)}
          </Link>

          <div>
            <strong>
              {user?.name ||
                "Yugma member"}
            </strong>
            <span>
              Your network
            </span>
          </div>
        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <main className="connections-content">
        <div className="connections-heading">
          <div>
            <span className="section-eyebrow">
              YOUR NETWORK
            </span>

            <h1>Connections</h1>

            <p>
              Build meaningful professional
              relationships on Yugma.
            </p>
          </div>

          <Link
            to="/explore"
            className="discover-people-button"
          >
            <UserPlus size={17} />
            Discover people
          </Link>
        </div>

        {/* Stats */}

        <section className="network-stats">
          <div className="network-stat-card">
            <div className="network-stat-icon">
              <Users size={20} />
            </div>

            <div>
              <strong>
                {connections.length}
              </strong>
              <span>
                Connections
              </span>
            </div>
          </div>

          <div className="network-stat-card">
            <div className="network-stat-icon">
              <UserPlus size={20} />
            </div>

            <div>
              <strong>
                {requests.length}
              </strong>
              <span>
                Pending requests
              </span>
            </div>
          </div>

          <div className="network-stat-card">
            <div className="network-stat-icon">
              <UserCheck size={20} />
            </div>

            <div>
              <strong>
                {suggestions.length}
              </strong>
              <span>
                People to discover
              </span>
            </div>
          </div>
        </section>

        {success && (
          <div className="connections-success">
            <Check size={18} />
            {success}
          </div>
        )}

        {error && (
          <div className="connections-error">
            <X size={18} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tabs */}

        <div className="connections-tabs">
          <button
            type="button"
            className={
              activeTab ===
              "connections"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "connections"
              )
            }
          >
            My connections
            <span>
              {connections.length}
            </span>
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "requests"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("requests")
            }
          >
            Requests

            {requests.length > 0 && (
              <span className="tab-notification">
                {requests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "suggestions"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "suggestions"
              )
            }
          >
            People you may know
            <span>
              {suggestions.length}
            </span>
          </button>
        </div>

        {/* ================= BODY ================= */}

        {loading ? (
          <div className="connections-loading">
            <div className="loader"></div>
            <p>
              Building your network...
            </p>
          </div>
        ) : (
          <>
            {/* CONNECTIONS */}

            {activeTab ===
              "connections" && (
              <section className="connections-section">
                <div className="section-header-row">
                  <div>
                    <h2>
                      My connections
                    </h2>

                    <p>
                      People you're connected
                      with on Yugma.
                    </p>
                  </div>

                  <span className="result-count">
                    {filteredConnections.length}{" "}
                    people
                  </span>
                </div>

                {filteredConnections.length ===
                0 ? (
                  <div className="connections-empty">
                    <div className="empty-icon">
                      <Users size={30} />
                    </div>

                    <h3>
                      {search
                        ? "No connections found"
                        : "Your network is waiting"}
                    </h3>

                    <p>
                      {search
                        ? "Try a different name or keyword."
                        : "Start connecting with people who share your interests and goals."}
                    </p>

                    {!search && (
                      <Link
                        to="/explore"
                        className="empty-action"
                      >
                        Discover people
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="connections-list">
                    {filteredConnections.map(
                      (
                        connection
                      ) =>
                        renderConnectionCard(
                          connection
                        )
                    )}
                  </div>
                )}
              </section>
            )}

            {/* REQUESTS */}

            {activeTab ===
              "requests" && (
              <section className="connections-section">
                <div className="section-header-row">
                  <div>
                    <h2>
                      Connection requests
                    </h2>

                    <p>
                      Manage people who want
                      to join your network.
                    </p>
                  </div>

                  <span className="result-count">
                    {filteredRequests.length}{" "}
                    pending
                  </span>
                </div>

                {filteredRequests.length ===
                0 ? (
                  <div className="connections-empty">
                    <div className="empty-icon">
                      <UserPlus size={30} />
                    </div>

                    <h3>
                      No pending requests
                    </h3>

                    <p>
                      New connection requests
                      will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="requests-list">
                    {filteredRequests.map(
                      (request) =>
                        renderRequestCard(
                          request
                        )
                    )}
                  </div>
                )}
              </section>
            )}

            {/* SUGGESTIONS */}

            {activeTab ===
              "suggestions" && (
              <section className="connections-section">
                <div className="section-header-row">
                  <div>
                    <h2>
                      People you may know
                    </h2>

                    <p>
                      Discover professionals
                      you might want to connect
                      with.
                    </p>
                  </div>

                  <span className="result-count">
                    {
                      filteredSuggestions.length
                    }{" "}
                    people
                  </span>
                </div>

                {filteredSuggestions.length ===
                0 ? (
                  <div className="connections-empty">
                    <div className="empty-icon">
                      <UserCheck size={30} />
                    </div>

                    <h3>
                      No suggestions right now
                    </h3>

                    <p>
                      Check back later for new
                      people to connect with.
                    </p>
                  </div>
                ) : (
                  <div className="suggestions-grid">
                    {filteredSuggestions.map(
                      (
                        person
                      ) =>
                        renderSuggestionCard(
                          person
                        )
                    )}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Connections;