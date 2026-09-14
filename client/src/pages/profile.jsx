import {
  ArrowLeft,
  Briefcase,
  Edit3,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Users,
  UserPlus,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken")
    );
  };

  const currentUserId =
    user?._id ||
    user?.id ||
    "";

  const isOwnProfile =
    !id ||
    String(id) === String(currentUserId);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        const endpoint = isOwnProfile
          ? `${API_URL}/users/profile`
          : `${API_URL}/users/${id}`;

        console.log(
          "Loading profile:",
          endpoint
        );

        const response = await axios.get(
          endpoint,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const loadedProfile =
          response.data?.user ||
          response.data;

        setProfile(loadedProfile);
      } catch (err) {
        console.error(
          "Profile loading error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, isOwnProfile, navigate]);

  const currentProfile =
    profile || (isOwnProfile ? user : {}) || {};

  const name =
    currentProfile.name ||
    currentProfile.username ||
    "Yugma User";

  const email =
    currentProfile.email ||
    "No email available";

  const headline =
    currentProfile.headline ||
    currentProfile.bio ||
    "Professional on Yugma";

  const location =
    currentProfile.location ||
    "Location not added";

  const about =
    currentProfile.about ||
    currentProfile.bio ||
    "Tell your professional story and let people know what you are working on.";

  const profilePicture =
    currentProfile.profilePicture ||
    currentProfile.avatar ||
    currentProfile.photo ||
    "";

  const connections =
    currentProfile.connectionsCount ??
    currentProfile.connectionCount ??
    0;

  const skills =
    Array.isArray(currentProfile.skills)
      ? currentProfile.skills
      : [];

  const experience =
    Array.isArray(currentProfile.experience)
      ? currentProfile.experience
      : [];

  const education =
    Array.isArray(currentProfile.education)
      ? currentProfile.education
      : [];

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loader"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* ================= TOP BAR ================= */}

      <header className="profile-topbar">
        <Link
          to="/dashboard"
          className="profile-back-button"
        >
          <ArrowLeft size={19} />
          <span>Dashboard</span>
        </Link>

        <div className="profile-topbar-actions">
          <Link
            to="/chat"
            className="profile-topbar-button"
          >
            <MessageCircle size={18} />
            Messages
          </Link>

          <button
            type="button"
            className="profile-icon-button"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="profile-error">
          {error}
        </div>
      )}

      {/* ================= PROFILE CONTENT ================= */}

      <main className="profile-content">

        {/* ================= COVER ================= */}

        <section className="profile-cover">
          <div className="profile-cover-decoration decoration-one"></div>
          <div className="profile-cover-decoration decoration-two"></div>
          <div className="profile-cover-decoration decoration-three"></div>
        </section>

        {/* ================= PROFILE HEADER ================= */}

        <section className="profile-header-card">
          <div className="profile-header-main">

            <div className="profile-large-avatar">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={name}
                />
              ) : (
                <span>
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="profile-main-info">

              <div className="profile-name-row">

                <div>
                  <h1>{name}</h1>

                  <p className="profile-headline">
                    {headline}
                  </p>
                </div>

                <div className="profile-actions">

                  {isOwnProfile ? (
                    <Link
                      to="/edit-profile"
                      className="profile-edit-button"
                    >
                      <Edit3 size={17} />
                      Edit Profile
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="profile-edit-button"
                        onClick={() => {
                          console.log(
                            "Connect with:",
                            currentProfile._id ||
                              currentProfile.id
                          );
                        }}
                      >
                        <UserPlus size={17} />
                        Connect
                      </button>

                      <Link
                        to="/chat"
                        className="profile-edit-button"
                      >
                        <MessageCircle size={17} />
                        Message
                      </Link>
                    </>
                  )}

                  <button
                    type="button"
                    className="profile-more-button"
                  >
                    <MoreHorizontal size={19} />
                  </button>

                </div>
              </div>

              <div className="profile-meta">

                <span>
                  <MapPin size={16} />
                  {location}
                </span>

                <span>
                  <Mail size={16} />
                  {email}
                </span>

              </div>

              <div className="profile-network-stats">

                <div>
                  <strong>{connections}</strong>
                  <span>Connections</span>
                </div>

                <div>
                  <strong>
                    {currentProfile.followersCount || 0}
                  </strong>
                  <span>Followers</span>
                </div>

                <div>
                  <strong>
                    {currentProfile.followingCount || 0}
                  </strong>
                  <span>Following</span>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ================= TWO COLUMN ================= */}

        <div className="profile-grid">

          {/* ================= LEFT ================= */}

          <div className="profile-left">

            {/* ABOUT */}

            <section className="profile-card">

              <div className="profile-card-heading">

                <div>
                  <h2>About</h2>
                  <span>
                    Professional introduction
                  </span>
                </div>

                {isOwnProfile && (
                  <button
                    type="button"
                    className="profile-small-icon"
                  >
                    <Edit3 size={16} />
                  </button>
                )}

              </div>

              <p className="profile-about-text">
                {about}
              </p>

            </section>

            {/* EXPERIENCE */}

            <section className="profile-card">

              <div className="profile-card-heading">

                <div>
                  <h2>Experience</h2>
                  <span>
                    Professional journey
                  </span>
                </div>

                {isOwnProfile && (
                  <button
                    type="button"
                    className="profile-small-icon"
                  >
                    <Edit3 size={16} />
                  </button>
                )}

              </div>

              {experience.length === 0 ? (

                <div className="profile-empty-section">

                  <div className="profile-empty-icon">
                    <Briefcase size={22} />
                  </div>

                  <div>
                    <strong>
                      {isOwnProfile
                        ? "Add your experience"
                        : "No experience added"}
                    </strong>

                    <p>
                      {isOwnProfile
                        ? "Showcase your previous roles, companies and achievements."
                        : "This member has not added their experience yet."}
                    </p>
                  </div>

                </div>

              ) : (

                <div className="experience-list">

                  {experience.map(
                    (item, index) => (

                      <div
                        className="experience-item"
                        key={
                          item._id || index
                        }
                      >

                        <div className="experience-icon">
                          <Briefcase size={20} />
                        </div>

                        <div className="experience-info">

                          <h3>
                            {item.title ||
                              item.role ||
                              "Professional Role"}
                          </h3>

                          <strong>
                            {item.company ||
                              "Company"}
                          </strong>

                          <span>
                            {item.duration ||
                              item.startDate ||
                              ""}
                          </span>

                          {item.description && (
                            <p>
                              {item.description}
                            </p>
                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>

            {/* EDUCATION */}

            <section className="profile-card">

              <div className="profile-card-heading">

                <div>
                  <h2>Education</h2>
                  <span>
                    Academic background
                  </span>
                </div>

                {isOwnProfile && (
                  <button
                    type="button"
                    className="profile-small-icon"
                  >
                    <Edit3 size={16} />
                  </button>
                )}

              </div>

              {education.length === 0 ? (

                <div className="profile-empty-section">

                  <div className="profile-empty-icon">
                    <Users size={22} />
                  </div>

                  <div>
                    <strong>
                      {isOwnProfile
                        ? "Add your education"
                        : "No education added"}
                    </strong>

                    <p>
                      {isOwnProfile
                        ? "Add schools, degrees and qualifications to your profile."
                        : "This member has not added their education yet."}
                    </p>
                  </div>

                </div>

              ) : (

                <div className="education-list">

                  {education.map(
                    (item, index) => (

                      <div
                        className="education-item"
                        key={
                          item._id || index
                        }
                      >

                        <div className="education-icon">
                          <Users size={20} />
                        </div>

                        <div>

                          <h3>
                            {item.school ||
                              item.institution ||
                              "Institution"}
                          </h3>

                          <strong>
                            {item.degree ||
                              "Degree"}
                          </strong>

                          <span>
                            {item.field ||
                              item.duration ||
                              ""}
                          </span>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>

          </div>

          {/* ================= RIGHT ================= */}

          <aside className="profile-right">

            {/* SKILLS */}

            <section className="profile-card">

              <div className="profile-card-heading">

                <div>
                  <h2>Skills</h2>

                  <span>
                    Professional expertise
                  </span>
                </div>

                {isOwnProfile && (
                  <button
                    type="button"
                    className="profile-small-icon"
                  >
                    <Edit3 size={16} />
                  </button>
                )}

              </div>

              {skills.length === 0 ? (

                <div className="skills-empty">

                  <p>
                    {isOwnProfile
                      ? "Add skills to show your professional expertise."
                      : "No skills added yet."}
                  </p>

                </div>

              ) : (

                <div className="skills-list">

                  {skills.map(
                    (skill, index) => {

                      const skillName =
                        typeof skill ===
                        "string"
                          ? skill
                          : skill.name ||
                            skill.title ||
                            "Skill";

                      return (
                        <span
                          key={
                            skill._id ||
                            `${skillName}-${index}`
                          }
                          className="skill-tag"
                        >
                          {skillName}
                        </span>
                      );
                    }
                  )}

                </div>

              )}

            </section>

            {/* PROFILE STRENGTH */}

            {isOwnProfile && (
              <section className="profile-card profile-strength-card">

                <div className="profile-card-heading">

                  <div>
                    <h2>
                      Profile strength
                    </h2>

                    <span>
                      Make your profile stand out
                    </span>
                  </div>

                </div>

                <div className="profile-progress">

                  <div className="profile-progress-top">

                    <strong>
                      {calculateProfileStrength(
                        currentProfile
                      )}
                      %
                    </strong>

                    <span>
                      {calculateProfileStrength(
                        currentProfile
                      ) >= 80
                        ? "Excellent"
                        : "Keep improving"}
                    </span>

                  </div>

                  <div className="profile-progress-track">

                    <div
                      className="profile-progress-fill"
                      style={{
                        width: `${calculateProfileStrength(
                          currentProfile
                        )}%`,
                      }}
                    ></div>

                  </div>

                </div>

                <div className="profile-strength-tips">

                  <div>
                    <CheckCircle />
                    <span>
                      Add your professional headline
                    </span>
                  </div>

                  <div>
                    <CheckCircle />
                    <span>
                      Add your skills
                    </span>
                  </div>

                  <div>
                    <CheckCircle />
                    <span>
                      Complete your experience
                    </span>
                  </div>

                </div>

                <Link
                  to="/edit-profile"
                  className="profile-complete-button"
                >
                  Complete Profile
                  <Edit3 size={16} />
                </Link>

              </section>
            )}

            {/* NETWORK */}

            <section className="profile-network-card">

              <div className="profile-network-icon">
                <UserPlus size={21} />
              </div>

              <div>

                <h3>
                  {isOwnProfile
                    ? "Grow your network"
                    : "Connect on Yugma"}
                </h3>

                <p>
                  {isOwnProfile
                    ? "Connect with professionals and discover new opportunities."
                    : "Build your professional network and discover new opportunities."}
                </p>

                <Link to="/connections">
                  Explore connections
                </Link>

              </div>

            </section>

          </aside>

        </div>
      </main>
    </div>
  );
};

const CheckCircle = () => (
  <span className="profile-check">
    ✓
  </span>
);

const calculateProfileStrength = (
  profile
) => {
  if (!profile) return 0;

  let score = 0;

  if (profile.name) score += 20;

  if (profile.email) score += 15;

  if (profile.headline) score += 15;

  if (profile.bio || profile.about) {
    score += 15;
  }

  if (profile.location) score += 10;

  if (
    Array.isArray(profile.skills) &&
    profile.skills.length > 0
  ) {
    score += 10;
  }

  if (
    Array.isArray(profile.experience) &&
    profile.experience.length > 0
  ) {
    score += 10;
  }

  if (
    Array.isArray(profile.education) &&
    profile.education.length > 0
  ) {
    score += 5;
  }

  return Math.min(score, 100);
};

export default Profile;