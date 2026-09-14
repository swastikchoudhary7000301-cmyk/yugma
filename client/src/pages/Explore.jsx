import {
  Compass,
  TrendingUp,
  Users,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const Explore = () => {
  const topics = [
    "Technology",
    "Artificial Intelligence",
    "Web Development",
    "Startups",
    "Design",
    "Career Growth",
    "Product Management",
    "Entrepreneurship",
  ];

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
          <h1>
            <Compass
              size={28}
              style={{
                verticalAlign: "middle",
                marginRight: 8,
              }}
            />
            Explore Yugma
          </h1>

          <p>
            Discover conversations, people and
            topics worth following.
          </p>
        </div>

        <section className="dashboard-card side-card">
          <h2 className="side-card-title">
            Trending topics
          </h2>

          <div className="skills-list">
            {topics.map((topic) => (
              <span
                className="skill-pill"
                key={topic}
              >
                #{topic.replaceAll(" ", "")}
              </span>
            ))}
          </div>
        </section>

        <div className="discovery-grid">
          <div className="discovery-user-card">
            <TrendingUp
              size={28}
              color="#635bff"
            />

            <strong>
              Trending discussions
            </strong>

            <span>
              See what the Yugma community is
              talking about.
            </span>

            <Link
              to="/dashboard"
              className="primary-button"
            >
              Explore feed
            </Link>
          </div>

          <div className="discovery-user-card">
            <Users
              size={28}
              color="#635bff"
            />

            <strong>
              Grow your network
            </strong>

            <span>
              Find professionals and creators
              to connect with.
            </span>

            <Link
              to="/search"
              className="primary-button"
            >
              Find people
            </Link>
          </div>

          <div className="discovery-user-card">
            <MessageCircle
              size={28}
              color="#635bff"
            />

            <strong>
              Start conversations
            </strong>

            <span>
              Connect directly with people in
              your network.
            </span>

            <Link
              to="/chat"
              className="primary-button"
            >
              Open messages
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Explore;