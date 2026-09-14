import {
  Bell,
  Bookmark,
  ChevronRight,
  Compass,
  Edit3,
  Home,
  MessageCircle,
  Plus,
  Search,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  getSuggestions,
  sendConnectionRequest,
} from "../services/connectionservice";
import api from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] =
    useState([]);

  const [loadingPosts, setLoadingPosts] =
    useState(true);
  const [loadingSuggestions, setLoadingSuggestions] =
    useState(true);

  const [postText, setPostText] =
    useState("");

  const [posting, setPosting] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState({});

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    await Promise.all([
      loadPosts(),
      loadSuggestions(),
    ]);
  };

  const loadPosts = async () => {
    try {
      setLoadingPosts(true);

      const response =
        await api.get("/posts");

      setPosts(
        response.data?.posts ||
          response.data?.data ||
          response.data ||
          []
      );
    } catch (err) {
      console.error(
        "Failed to load posts:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load your feed."
      );
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true);

      const response =
        await getSuggestions();

      setSuggestions(
        response?.suggestions ||
          response?.data ||
          []
      );
    } catch (err) {
      console.error(
        "Failed to load suggestions:",
        err
      );
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const displayUser = user || {};

  const userName =
    displayUser.name ||
    "Yugma member";

  const userInitial =
    userName.charAt(0).toUpperCase();

  const profilePicture =
    displayUser.profilePicture ||
    displayUser.avatar ||
    "";

  const headline =
    displayUser.headline ||
    "Yugma member";

  const connectionCount =
    displayUser.connectionsCount ??
    displayUser.connectionCount ??
    0;

  const profileViews =
    displayUser.profileViews ??
    0;

  const formatDate = (date) => {
    if (!date) return "";

    const now = new Date();
    const postDate =
      new Date(date);

    const difference =
      now.getTime() -
      postDate.getTime();

    const minutes = Math.floor(
      difference / 60000
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours}h`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days}d`;
    }

    return postDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  const getAuthor = (post) => {
    if (!post) return {};

    return (
      post.author ||
      post.user ||
      {}
    );
  };

  const getAuthorName = (post) => {
    const author =
      getAuthor(post);

    return (
      author.name ||
      "Yugma member"
    );
  };

  const getAuthorAvatar = (post) => {
    const author =
      getAuthor(post);

    return (
      author.profilePicture ||
      author.avatar ||
      ""
    );
  };

  const getAuthorHeadline = (
    post
  ) => {
    const author =
      getAuthor(post);

    return (
      author.headline ||
      "Yugma member"
    );
  };

  const getPostId = (post) =>
    post?._id ||
    post?.id;

  const getLikeCount = (post) => {
    if (Array.isArray(post?.likes)) {
      return post.likes.length;
    }

    return (
      post?.likesCount ||
      post?.likeCount ||
      0
    );
  };

  const isLiked = (post) => {
    if (!Array.isArray(post?.likes)) {
      return Boolean(post?.isLiked);
    }

    const currentId =
      String(
        user?._id ||
          user?.id ||
          ""
      );

    return post.likes.some(
      (like) =>
        String(
          like?._id ||
            like?.id ||
            like
        ) === currentId
    );
  };

  const getCommentCount = (
    post
  ) => {
    if (
      Array.isArray(
        post?.comments
      )
    ) {
      return post.comments.length;
    }

    return (
      post?.commentsCount ||
      post?.commentCount ||
      0
    );
  };

  const handleCreatePost =
    async (event) => {
      event.preventDefault();

      const content =
        postText.trim();

      if (!content) return;

      try {
        setPosting(true);
        setError("");
        setSuccess("");

        const response =
          await api.post(
            "/posts",
            {
              content,
            }
          );

        const newPost =
          response.data?.post ||
          response.data?.data ||
          response.data;

        if (newPost) {
          setPosts(
            (previous) => [
              newPost,
              ...previous,
            ]
          );
        } else {
          await loadPosts();
        }

        setPostText("");

        setSuccess(
          "Your post was published."
        );

        setTimeout(() => {
          setSuccess("");
        }, 2500);
      } catch (err) {
        console.error(
          "Create post error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to publish your post."
        );
      } finally {
        setPosting(false);
      }
    };

  const handleLike = async (
    post
  ) => {
    const postId =
      getPostId(post);

    if (!postId) return;

    try {
      setActionLoading(
        (previous) => ({
          ...previous,
          [`like-${postId}`]:
            true,
        })
      );

      const response =
        await api.put(
          `/posts/${postId}/like`
        );

      const updatedPost =
        response.data?.post ||
        response.data?.data;

      if (updatedPost) {
        setPosts(
          (previous) =>
            previous.map(
              (item) =>
                getPostId(item) ===
                postId
                  ? updatedPost
                  : item
            )
        );
      } else {
        await loadPosts();
      }
    } catch (err) {
      console.error(
        "Like error:",
        err
      );

      setError(
        err.response?.data
          ?.message ||
          "Unable to update like."
      );
    } finally {
      setActionLoading(
        (previous) => ({
          ...previous,
          [`like-${postId}`]:
            false,
        })
      );
    }
  };

  const handleSave = async (
    post
  ) => {
    const postId =
      getPostId(post);

    if (!postId) return;

    try {
      setActionLoading(
        (previous) => ({
          ...previous,
          [`save-${postId}`]:
            true,
        })
      );

      const response =
        await api.put(
          `/posts/${postId}/save`
        );

      const updatedPost =
        response.data?.post ||
        response.data?.data;

      if (updatedPost) {
        setPosts(
          (previous) =>
            previous.map(
              (item) =>
                getPostId(item) ===
                postId
                  ? updatedPost
                  : item
            )
        );
      } else {
        await loadPosts();
      }
    } catch (err) {
      console.error(
        "Save error:",
        err
      );

      setError(
        err.response?.data
          ?.message ||
          "Unable to save post."
      );
    } finally {
      setActionLoading(
        (previous) => ({
          ...previous,
          [`save-${postId}`]:
            false,
        })
      );
    }
  };

  const handleConnect =
    async (person) => {
      const personId =
        person?._id ||
        person?.id;

      if (!personId) return;

      try {
        setActionLoading(
          (previous) => ({
            ...previous,
            [`connect-${personId}`]:
              true,
          })
        );

        await sendConnectionRequest(
          personId
        );

        setSuggestions(
          (previous) =>
            previous.filter(
              (item) =>
                String(
                  item?._id ||
                    item?.id
                ) !==
                String(personId)
            )
        );

        setSuccess(
          "Connection request sent."
        );

        setTimeout(() => {
          setSuccess("");
        }, 2500);
      } catch (err) {
        console.error(
          "Connection request error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to send connection request."
        );
      } finally {
        setActionLoading(
          (previous) => ({
            ...previous,
            [`connect-${personId}`]:
              false,
          })
        );
      }
    };

  const trendingTopics =
    useMemo(
      () => [
        {
          title:
            "Web Development",
          posts: "2.4K posts",
        },
        {
          title:
            "Artificial Intelligence",
          posts: "1.8K posts",
        },
        {
          title:
            "Career Growth",
          posts: "1.2K posts",
        },
        {
          title:
            "Startups",
          posts: "894 posts",
        },
      ],
      []
    );

  const renderAvatar = (
    image,
    name,
    className = ""
  ) => {
    if (image) {
      return (
        <img
          src={image}
          alt={name}
          className={`dashboard-avatar ${className}`}
        />
      );
    }

    return (
      <div
        className={`dashboard-avatar dashboard-avatar-fallback ${className}`}
      >
        {name
          ?.charAt(0)
          .toUpperCase() ||
          "Y"}
      </div>
    );
  };

  const renderPost = (
    post
  ) => {
    const postId =
      getPostId(post);

    const author =
      getAuthor(post);

    const authorName =
      getAuthorName(post);

    const authorAvatar =
      getAuthorAvatar(post);

    const liked =
      isLiked(post);

    const likeCount =
      getLikeCount(post);

    const commentCount =
      getCommentCount(post);

    return (
      <article
        className="dashboard-post"
        key={postId}
      >
        <div className="dashboard-post-header">
          <Link
            to={
              author?._id ||
              author?.id
                ? `/profile/${
                    author._id ||
                    author.id
                  }`
                : "/profile"
            }
          >
            {renderAvatar(
              authorAvatar,
              authorName
            )}
          </Link>

          <div className="dashboard-post-author">
            <Link
              to={
                author?._id ||
                author?.id
                  ? `/profile/${
                      author._id ||
                      author.id
                    }`
                  : "/profile"
              }
            >
              <strong>
                {authorName}
              </strong>
            </Link>

            <span>
              {getAuthorHeadline(
                post
              )}
            </span>

            <small>
              {formatDate(
                post.createdAt ||
                  post.updatedAt
              )}
            </small>
          </div>

          <button
            type="button"
            className="post-more-button"
          >
            •••
          </button>
        </div>

        <div className="dashboard-post-content">
          <p>
            {post.content}
          </p>

          {post.image && (
            <img
              src={post.image}
              alt="Post"
              className="dashboard-post-image"
            />
          )}
        </div>

        <div className="dashboard-post-meta">
          <span>
            {likeCount}{" "}
            {likeCount === 1
              ? "like"
              : "likes"}
          </span>

          <span>
            {commentCount}{" "}
            {commentCount === 1
              ? "comment"
              : "comments"}
          </span>
        </div>

        {post.comments?.length > 0 && (
          <div className="dashboard-comment-preview">
            {post.comments.slice(0, 2).map((comment, commentIndex) => (
              <div
                className="dashboard-comment"
                key={comment._id || `${postId}-comment-${commentIndex}`}
              >
                {renderAvatar(
                  comment.user?.profilePicture,
                  comment.user?.name || "Yugma member",
                  "dashboard-comment-avatar"
                )}

                <div className="dashboard-comment-body">
                  <strong>
                    {comment.user?.name || "Yugma member"}
                  </strong>
                  <p>{comment.text}</p>
                </div>
              </div>
            ))}

            {post.comments.length > 0 && (
              <button
                type="button"
                className="dashboard-view-comments"
                onClick={() => navigate(`/post/${postId}`)}
              >
                View all {post.comments.length} comments
              </button>
            )}
          </div>
        )}

        <div className="dashboard-post-actions">
          <button
            type="button"
            className={
              liked
                ? "post-action active"
                : "post-action"
            }
            onClick={() =>
              handleLike(post)
            }
            disabled={
              actionLoading[
                `like-${postId}`
              ]
            }
          >
            <TrendingUp size={18} />
            Like
          </button>

          <button
            type="button"
            className="post-action"
            onClick={() =>
              navigate(
                `/post/${postId}`
              )
            }
          >
            <MessageCircle
              size={18}
            />
            Comment {commentCount > 0 ? `(${commentCount})` : ""}
          </button>

          <button
            type="button"
            className="post-action"
            onClick={() =>
              handleSave(post)
            }
            disabled={
              actionLoading[
                `save-${postId}`
              ]
            }
          >
            <Bookmark size={18} />
            Save
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="dashboard-page">
      {/* ================= SIDEBAR ================= */}

      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <Link to="/dashboard">
            <span className="dashboard-logo-mark">
              Y
            </span>

            <span className="dashboard-logo-text">
              Yugma
            </span>
          </Link>
        </div>

        <nav className="dashboard-nav">
          <Link
            to="/dashboard"
            className="dashboard-nav-item active"
          >
            <Home size={19} />
            <span>Home</span>
          </Link>

          <Link
            to="/explore"
            className="dashboard-nav-item"
          >
            <Compass size={19} />
            <span>Explore</span>
          </Link>

          <Link
            to="/connections"
            className="dashboard-nav-item"
          >
            <Users size={19} />
            <span>My Network</span>

            {connectionCount >
              0 && (
              <small>
                {connectionCount}
              </small>
            )}
          </Link>

          <Link
            to="/notifications"
            className="dashboard-nav-item"
          >
            <Bell size={19} />
            <span>
              Notifications
            </span>
          </Link>

          <Link
            to="/chat"
            className="dashboard-nav-item"
          >
            <MessageCircle
              size={19}
            />
            <span>Messages</span>
          </Link>

          <Link
            to="/saved"
            className="dashboard-nav-item"
          >
            <Bookmark size={19} />
            <span>Saved</span>
          </Link>
        </nav>

        <div className="dashboard-sidebar-divider" />

        <nav className="dashboard-nav secondary">
          <Link
            to="/profile"
            className="dashboard-nav-item"
          >
            <Edit3 size={19} />
            <span>My Profile</span>
          </Link>

          <Link
            to="/settings"
            className="dashboard-nav-item"
          >
            <Settings size={19} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <Link
            to="/profile"
            className="dashboard-mini-profile"
          >
            {renderAvatar(
              profilePicture,
              userName
            )}

            <div>
              <strong>
                {userName}
              </strong>
              <span>
                View profile
              </span>
            </div>

            <ChevronRight
              size={17}
            />
          </Link>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="dashboard-main">
        {/* Topbar */}

        <header className="dashboard-topbar">
          <div className="dashboard-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search people, posts or topics..."
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  navigate(
                    `/search?q=${encodeURIComponent(
                      event.target.value
                    )}`
                  );
                }
              }}
            />
          </div>

          <div className="dashboard-top-actions">
            <button
              type="button"
              className="dashboard-mobile-search"
            >
              <Search size={20} />
            </button>

            <Link
              to="/notifications"
              className="dashboard-icon-button"
            >
              <Bell size={20} />
              <span />
            </Link>

            <Link
              to="/chat"
              className="dashboard-icon-button"
            >
              <MessageCircle
                size={20}
              />
            </Link>

            <Link
              to="/profile"
              className="dashboard-top-avatar"
            >
              {renderAvatar(
                profilePicture,
                userName
              )}
            </Link>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Welcome */}

          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">
                YOUR PROFESSIONAL SPACE
              </span>

              <h1>
                Welcome back,{" "}
                {userName.split(
                  " "
                )[0]}
                !
              </h1>

              <p>
                Connect with people,
                share ideas and grow
                your professional
                network.
              </p>
            </div>

            <Link
              to="/create-post"
              className="dashboard-create-button"
            >
              <Plus size={18} />
              Create post
            </Link>
          </section>

          {/* Stats */}

          <section className="dashboard-stats">
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon">
                <Users size={19} />
              </div>

              <div>
                <strong>
                  {connectionCount}
                </strong>

                <span>
                  Connections
                </span>
              </div>
            </div>

            <div className="dashboard-stat">
              <div className="dashboard-stat-icon">
                <TrendingUp
                  size={19}
                />
              </div>

              <div>
                <strong>
                  {profileViews}
                </strong>

                <span>
                  Profile views
                </span>
              </div>
            </div>

            <div className="dashboard-stat">
              <div className="dashboard-stat-icon">
                <MessageCircle
                  size={19}
                />
              </div>

              <div>
                <strong>
                  {posts.length}
                </strong>

                <span>
                  Feed posts
                </span>
              </div>
            </div>
          </section>

          {success && (
            <div className="dashboard-alert success">
              <span>
                {success}
              </span>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
              >
                <X size={16} />
              </button>
            </div>
          )}

          {error && (
            <div className="dashboard-alert error">
              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Dashboard columns */}

          <div className="dashboard-columns">
            {/* Feed */}

            <section className="dashboard-feed">
              {/* Create post */}

              <div className="dashboard-create-card">
                <div className="create-card-top">
                  {renderAvatar(
                    profilePicture,
                    userName
                  )}

                  <button
                    type="button"
                    className="create-placeholder"
                    onClick={() =>
                      navigate(
                        "/create-post"
                      )
                    }
                  >
                    Share something with
                    your network...
                  </button>
                </div>

                <form
                  onSubmit={
                    handleCreatePost
                  }
                  className="quick-post-form"
                >
                  <textarea
                    value={postText}
                    onChange={(event) =>
                      setPostText(
                        event.target
                          .value
                      )
                    }
                    placeholder="What would you like to share?"
                    maxLength={5000}
                  />

                  <div className="quick-post-bottom">
                    <span>
                      {postText.length}
                      /5000
                    </span>

                    <button
                      type="submit"
                      disabled={
                        posting ||
                        !postText.trim()
                      }
                    >
                      {posting
                        ? "Publishing..."
                        : "Post"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Feed heading */}

              <div className="feed-heading">
                <div>
                  <h2>
                    Your feed
                  </h2>

                  <p>
                    Updates from your
                    network
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    loadPosts
                  }
                >
                  Refresh
                </button>
              </div>

              {/* Posts */}

              {loadingPosts ? (
                <div className="dashboard-loading">
                  <div className="loader" />
                  <p>
                    Loading your feed...
                  </p>
                </div>
              ) : posts.length ===
                0 ? (
                <div className="dashboard-empty">
                  <div className="dashboard-empty-icon">
                    <MessageCircle
                      size={28}
                    />
                  </div>

                  <h3>
                    Your feed is
                    quiet
                  </h3>

                  <p>
                    Be the first to
                    share something
                    with your
                    network.
                  </p>

                  <Link
                    to="/create-post"
                  >
                    Create your
                    first post
                  </Link>
                </div>
              ) : (
                <div className="dashboard-posts">
                  {posts.map(
                    (
                      post
                    ) =>
                      renderPost(
                        post
                      )
                  )}
                </div>
              )}
            </section>

            {/* Right sidebar */}

            <aside className="dashboard-rightbar">
              {/* Profile card */}

              <section className="dashboard-profile-card">
                <div className="profile-card-cover" />

                <div className="profile-card-body">
                  <div className="profile-card-avatar">
                    {renderAvatar(
                      profilePicture,
                      userName
                    )}
                  </div>

                  <h3>
                    {userName}
                  </h3>

                  <p>
                    {headline}
                  </p>

                  <div className="profile-card-stats">
                    <div>
                      <strong>
                        {
                          connectionCount
                        }
                      </strong>
                      <span>
                        Connections
                      </span>
                    </div>

                    <div>
                      <strong>
                        {
                          profileViews
                        }
                      </strong>
                      <span>
                        Views
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="profile-card-link"
                  >
                    View profile
                  </Link>
                </div>
              </section>

              {/* Suggestions */}

              <section className="dashboard-side-card">
                <div className="side-card-heading">
                  <div>
                    <h2>
                      People you may
                      know
                    </h2>

                    <p>
                      Grow your
                      network
                    </p>
                  </div>

                  <Link to="/connections">
                    See all
                  </Link>
                </div>

                {loadingSuggestions ? (
                  <div className="side-loading">
                    <div className="loader small" />
                  </div>
                ) : suggestions.length ===
                  0 ? (
                  <div className="side-empty">
                    No new suggestions
                    right now.
                  </div>
                ) : (
                  <div className="suggested-users">
                    {suggestions
                      .slice(0, 4)
                      .map(
                        (
                          person
                        ) => {
                          const personId =
                            person?._id ||
                            person?.id;

                          const personName =
                            person?.name ||
                            "Yugma member";

                          const personAvatar =
                            person?.profilePicture ||
                            person?.avatar ||
                            "";

                          const personHeadline =
                            person?.headline ||
                            "Yugma member";

                          return (
                            <div
                              className="suggested-user"
                              key={
                                personId
                              }
                            >
                              <Link
                                to={
                                  personId
                                    ? `/profile/${personId}`
                                    : "/profile"
                                }
                              >
                                {renderAvatar(
                                  personAvatar,
                                  personName
                                )}
                              </Link>

                              <div className="suggested-user-info">
                                <Link
                                  to={
                                    personId
                                      ? `/profile/${personId}`
                                      : "/profile"
                                  }
                                >
                                  <strong>
                                    {
                                      personName
                                    }
                                  </strong>
                                </Link>

                                <span>
                                  {
                                    personHeadline
                                  }
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleConnect(
                                    person
                                  )
                                }
                                disabled={
                                  actionLoading[
                                    `connect-${personId}`
                                  ]
                                }
                                title="Connect"
                              >
                                <UserPlus
                                  size={
                                    16
                                  }
                                />
                              </button>
                            </div>
                          );
                        }
                      )}
                  </div>
                )}
              </section>

              {/* Trending */}

              <section className="dashboard-side-card">
                <div className="side-card-heading">
                  <div>
                    <h2>
                      Trending
                    </h2>

                    <p>
                      Explore popular
                      discussions
                    </p>
                  </div>

                  <TrendingUp
                    size={18}
                  />
                </div>

                <div className="trending-list">
                  {trendingTopics.map(
                    (
                      topic,
                      index
                    ) => (
                      <Link
                        to={`/search?q=${encodeURIComponent(
                          topic.title
                        )}`}
                        className="trending-item"
                        key={
                          topic.title
                        }
                      >
                        <div>
                          <small>
                            #{index + 1}
                          </small>

                          <strong>
                            {topic.title}
                          </strong>

                          <span>
                            {
                              topic.posts
                            }
                          </span>
                        </div>

                        <ChevronRight
                          size={16}
                        />
                      </Link>
                    )
                  )}
                </div>
              </section>

              {/* Grow network */}

              <section className="dashboard-grow-card">
                <div className="grow-card-icon">
                  <Users size={21} />
                </div>

                <div>
                  <h3>
                    Grow your network
                  </h3>

                  <p>
                    Connect with
                    professionals who
                    can help you learn
                    and grow.
                  </p>

                  <Link to="/connections">
                    Explore people
                    <ChevronRight
                      size={15}
                    />
                  </Link>
                </div>
              </section>

              <footer className="dashboard-footer">
                <span>
                  © 2026 Yugma
                </span>

                <Link to="/settings">
                  Privacy
                </Link>

                <Link to="/settings">
                  Settings
                </Link>
              </footer>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
