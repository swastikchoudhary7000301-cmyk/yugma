import {
  Bookmark,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

const Saved = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedPosts();
  }, []);

  const loadSavedPosts = async () => {
    try {
      const response = await api.get(
        "/posts/saved"
      );

      setPosts(
        response.data?.posts ||
          response.data?.data ||
          []
      );
    } catch (error) {
      console.error(
        "Unable to load saved posts:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-page">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar-inner">
          <Link
            to="/dashboard"
            className="topbar-icon-button"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="yugma-logo">
            <span className="yugma-logo-mark">
              Y
            </span>
            Yugma
          </div>
        </div>
      </header>

      <main className="simple-page-layout">
        <div className="simple-page-header">
          <h1>Saved posts</h1>

          <p>
            Keep useful ideas and posts for
            later.
          </p>
        </div>

        {loading && (
          <div className="page-message">
            Loading saved posts...
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="page-message">
            <Bookmark
              size={28}
              style={{
                marginBottom: 10,
              }}
            />

            <div>
              You haven't saved any posts yet.
            </div>
          </div>
        )}

        <div className="saved-post-list">
          {posts.map((post) => (
            <article
              className="post-card dashboard-card"
              key={post._id}
            >
              <div className="post-header">
                <img
                  className="post-avatar"
                  src={
                    post.author?.profilePicture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      post.author?.name ||
                        "User"
                    )}&background=635bff&color=fff`
                  }
                  alt={post.author?.name}
                />

                <div className="post-author">
                  <strong>
                    {post.author?.name ||
                      "Yugma member"}
                  </strong>

                  <span>
                    {post.author?.headline ||
                      "Yugma member"}
                  </span>
                </div>
              </div>

              <div className="post-content">
                {post.content}
              </div>

              {post.image && (
                <img
                  className="post-image"
                  src={post.image}
                  alt="Post"
                />
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Saved;