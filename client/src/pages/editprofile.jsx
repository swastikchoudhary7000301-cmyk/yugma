import {
  ArrowLeft,
  Camera,
  Check,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    headline: "",
    bio: "",
    location: "",
    profilePicture: "",
    skills: [],
  });

  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/profile");

        const profile =
          response.data?.user ||
          response.data ||
          user ||
          {};

        setForm({
          name: profile.name || "",
          headline: profile.headline || "",
          bio: profile.bio || profile.about || "",
          location: profile.location || "",
          profilePicture:
            profile.profilePicture ||
            profile.avatar ||
            "",
          skills: Array.isArray(profile.skills)
            ? profile.skills
            : [],
        });
      } catch (err) {
        console.error(
          "Failed to load profile:",
          err
        );

        if (user) {
          setForm({
            name: user.name || "",
            headline: user.headline || "",
            bio: user.bio || "",
            location: user.location || "",
            profilePicture:
              user.profilePicture || "",
            skills: Array.isArray(user.skills)
              ? user.skills
              : [],
          });
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load your profile."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    const exists = form.skills.some(
      (item) =>
        String(item).toLowerCase() ===
        skill.toLowerCase()
    );

    if (exists) {
      setSkillInput("");
      return;
    }

    setForm((previous) => ({
      ...previous,
      skills: [
        ...previous.skills,
        skill,
      ],
    }));

    setSkillInput("");
  };

  const removeSkill = (indexToRemove) => {
    setForm((previous) => ({
      ...previous,
      skills: previous.skills.filter(
        (_, index) =>
          index !== indexToRemove
      ),
    }));
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile image must be smaller than 5MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((previous) => ({
        ...previous,
        profilePicture: reader.result,
      }));

      setMessage("");
      setError("");
    };

    reader.onerror = () => {
      setError(
        "Unable to read the selected image."
      );
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm((previous) => ({
      ...previous,
      profilePicture: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (form.headline.length > 150) {
      setError(
        "Headline must be 150 characters or less."
      );
      return;
    }

    if (form.bio.length > 1000) {
      setError(
        "Bio must be 1000 characters or less."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await api.put(
        "/users/profile",
        {
          name: form.name.trim(),
          headline: form.headline.trim(),
          bio: form.bio.trim(),
          location: form.location.trim(),
          profilePicture:
            form.profilePicture || "",
          skills: form.skills,
        }
      );

      const updatedProfile =
        response.data?.user ||
        response.data;

      if (updatedProfile) {
        setForm((previous) => ({
          ...previous,
          name:
            updatedProfile.name ??
            previous.name,
          headline:
            updatedProfile.headline ??
            previous.headline,
          bio:
            updatedProfile.bio ??
            previous.bio,
          location:
            updatedProfile.location ??
            previous.location,
          profilePicture:
            updatedProfile.profilePicture ??
            previous.profilePicture,
          skills:
            Array.isArray(
              updatedProfile.skills
            )
              ? updatedProfile.skills
              : previous.skills,
        }));
      }

      setMessage(
        "Your profile has been updated successfully."
      );

      setTimeout(() => {
        navigate("/profile");
      }, 900);
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-profile-page">
        <div className="edit-profile-loading">
          <div className="loader"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-profile-page">
      {/* ================= TOP BAR ================= */}

      <header className="edit-profile-topbar">
        <Link
          to="/profile"
          className="edit-profile-back"
        >
          <ArrowLeft size={19} />
          <span>Back to profile</span>
        </Link>

        <div className="edit-profile-title">
          <h1>Edit Profile</h1>
          <p>
            Keep your professional profile
            up to date.
          </p>
        </div>

        <div className="edit-profile-top-actions">
          <Link
            to="/profile"
            className="edit-profile-cancel"
          >
            Cancel
          </Link>

          <button
            type="submit"
            form="edit-profile-form"
            className="edit-profile-save-top"
            disabled={saving}
          >
            <Save size={17} />

            {saving
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <main className="edit-profile-content">
        {message && (
          <div className="edit-profile-success">
            <Check size={18} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="edit-profile-error">
            <X size={18} />
            <span>{error}</span>
          </div>
        )}

        <form
          id="edit-profile-form"
          onSubmit={handleSubmit}
          className="edit-profile-grid"
        >
          {/* ================= LEFT ================= */}

          <div className="edit-profile-main">
            {/* Basic information */}

            <section className="edit-profile-card">
              <div className="edit-card-heading">
                <div>
                  <h2>Basic information</h2>
                  <p>
                    Tell people who you are
                    professionally.
                  </p>
                </div>
              </div>

              <div className="edit-profile-fields">
                <div className="edit-field">
                  <label htmlFor="name">
                    Full name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    maxLength={100}
                    required
                  />

                  <span className="field-hint">
                    This is the name people will
                    see on your profile.
                  </span>
                </div>

                <div className="edit-field">
                  <label htmlFor="headline">
                    Professional headline
                  </label>

                  <input
                    id="headline"
                    name="headline"
                    type="text"
                    value={form.headline}
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Developer | React | Node.js"
                    maxLength={150}
                  />

                  <div className="field-counter">
                    {form.headline.length}/150
                  </div>
                </div>

                <div className="edit-field">
                  <label htmlFor="location">
                    Location
                  </label>

                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Bhopal, India"
                    maxLength={100}
                  />
                </div>

                <div className="edit-field">
                  <label htmlFor="bio">
                    About
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Write a short introduction about yourself, your interests, experience and goals..."
                    rows={7}
                    maxLength={1000}
                  />

                  <div className="field-counter">
                    {form.bio.length}/1000
                  </div>
                </div>
              </div>
            </section>

            {/* Skills */}

            <section className="edit-profile-card">
              <div className="edit-card-heading">
                <div>
                  <h2>Skills</h2>
                  <p>
                    Add skills that represent your
                    professional expertise.
                  </p>
                </div>
              </div>

              <div className="skill-input-row">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(event) =>
                    setSkillInput(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleSkillKeyDown
                  }
                  placeholder="e.g. JavaScript"
                  maxLength={50}
                />

                <button
                  type="button"
                  onClick={addSkill}
                  className="add-skill-button"
                >
                  <Plus size={17} />
                  Add
                </button>
              </div>

              <div className="edit-skills-list">
                {form.skills.length === 0 ? (
                  <div className="skills-placeholder">
                    No skills added yet.
                  </div>
                ) : (
                  form.skills.map(
                    (skill, index) => {
                      const skillName =
                        typeof skill ===
                        "string"
                          ? skill
                          : skill.name ||
                            skill.title ||
                            "Skill";

                      return (
                        <div
                          className="edit-skill-tag"
                          key={`${skillName}-${index}`}
                        >
                          <span>
                            {skillName}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeSkill(
                                index
                              )
                            }
                            aria-label={`Remove ${skillName}`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    }
                  )
                )}
              </div>

              <p className="skills-help">
                Press Enter or click Add to add
                another skill.
              </p>
            </section>

            {/* Save section */}

            <section className="edit-profile-card edit-save-card">
              <div>
                <h2>Ready to save?</h2>
                <p>
                  Your changes will appear across
                  your Yugma profile.
                </p>
              </div>

              <div className="edit-save-actions">
                <Link
                  to="/profile"
                  className="edit-cancel-button"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="edit-save-button"
                  disabled={saving}
                >
                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : "Save profile"}
                </button>
              </div>
            </section>
          </div>

          {/* ================= RIGHT ================= */}

          <aside className="edit-profile-sidebar">
            {/* Profile photo */}

            <section className="edit-profile-card photo-card">
              <div className="edit-card-heading">
                <div>
                  <h2>Profile photo</h2>
                  <p>
                    Use a clear photo so people can
                    recognize you.
                  </p>
                </div>
              </div>

              <div className="profile-photo-editor">
                <div className="profile-photo-preview">
                  {form.profilePicture ? (
                    <img
                      src={form.profilePicture}
                      alt={form.name || "Profile"}
                    />
                  ) : (
                    <span>
                      {form.name
                        ? form.name
                            .charAt(0)
                            .toUpperCase()
                        : "Y"}
                    </span>
                  )}
                </div>

                <div className="photo-actions">
                  <label className="upload-photo-button">
                    <Camera size={17} />
                    Change photo

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleImageChange
                      }
                      hidden
                    />
                  </label>

                  {form.profilePicture && (
                    <button
                      type="button"
                      className="remove-photo-button"
                      onClick={removeImage}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <p className="photo-help">
                JPG, PNG or WEBP. Maximum size 5MB.
              </p>
            </section>

            {/* Preview */}

            <section className="edit-profile-card preview-card">
              <div className="edit-card-heading">
                <div>
                  <h2>Profile preview</h2>
                  <p>
                    This is how your profile starts
                    to look.
                  </p>
                </div>
              </div>

              <div className="mini-profile">
                <div className="mini-profile-avatar">
                  {form.profilePicture ? (
                    <img
                      src={form.profilePicture}
                      alt=""
                    />
                  ) : (
                    <span>
                      {form.name
                        ? form.name
                            .charAt(0)
                            .toUpperCase()
                        : "Y"}
                    </span>
                  )}
                </div>

                <div className="mini-profile-info">
                  <h3>
                    {form.name ||
                      "Your Name"}
                  </h3>

                  <p>
                    {form.headline ||
                      "Your professional headline"}
                  </p>

                  {form.location && (
                    <span>
                      {form.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="mini-profile-about">
                <strong>About</strong>

                <p>
                  {form.bio ||
                    "Your professional introduction will appear here."}
                </p>
              </div>

              {form.skills.length > 0 && (
                <div className="mini-profile-skills">
                  {form.skills
                    .slice(0, 4)
                    .map((skill, index) => (
                      <span
                        key={index}
                      >
                        {typeof skill ===
                        "string"
                          ? skill
                          : skill.name ||
                            "Skill"}
                      </span>
                    ))}

                  {form.skills.length >
                    4 && (
                    <span>
                      +
                      {form.skills.length -
                        4}
                    </span>
                  )}
                </div>
              )}
            </section>
          </aside>
        </form>
      </main>
    </div>
  );
};

export default EditProfile;