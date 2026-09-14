import {
  ArrowLeft,
  Image as ImageIcon,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
      setError("");
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim() && !image) {
      setError("Write something or add an image.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/posts", {
        content: content.trim(),
        image,
      });

      navigate("/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to publish your post."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar-inner">
          <button
            className="topbar-icon-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={19} />
          </button>

          <div className="yugma-logo">
            <span className="yugma-logo-mark">
              Y
            </span>
            Yugma
          </div>
        </div>
      </header>

      <main className="create-post-layout">
        <form
          className="create-post-editor"
          onSubmit={handleSubmit}
        >
          <h1>Create a post</h1>

          <p>
            Share an idea, achievement, project or
            something interesting with your network.
          </p>

          <div className="post-header">
            <img
              className="post-avatar"
              src={
                user?.profilePicture ||
                "https://ui-avatars.com/api/?name=Yugma&background=635bff&color=fff"
              }
              alt={user?.name || "You"}
            />

            <div className="post-author">
              <strong>
                {user?.name || "You"}
              </strong>

              <span>
                {user?.headline ||
                  "Yugma member"}
              </span>
            </div>
          </div>

          <textarea
            className="create-post-textarea"
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            placeholder="What would you like to share?"
            maxLength={5000}
          />

          {image && (
            <div style={{ marginTop: 15, position: "relative" }}>
              <img
                src={image}
                alt="Post preview"
                style={{
                  width: "100%",
                  maxHeight: 420,
                  objectFit: "cover",
                  borderRadius: 14,
                }}
              />

              <button
                type="button"
                onClick={() => setImage("")}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 34,
                  height: 34,
                  border: 0,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,.7)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {error && (
            <div className="auth-error" style={{ marginTop: 15 }}>
              {error}
            </div>
          )}

          <div className="create-post-editor-actions">
            <label className="secondary-button">
              <ImageIcon
                size={15}
                style={{
                  verticalAlign: "middle",
                  marginRight: 6,
                }}
              />
              Add image

              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                hidden
              />
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              <Send
                size={15}
                style={{
                  verticalAlign: "middle",
                  marginRight: 6,
                }}
              />

              {loading
                ? "Publishing..."
                : "Publish post"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreatePost;