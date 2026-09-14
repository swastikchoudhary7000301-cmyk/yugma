import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const getId = (value) => value?._id || value?.id || value || null;

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/posts");
      const posts = response.data?.posts || response.data?.data || response.data || [];
      const found = posts.find((item) => String(item?._id || item?.id) === String(id));
      if (!found) {
        setError("This post could not be found.");
        return;
      }
      setPost(found);
    } catch (err) {
      console.error("Post detail error:", err);
      setError(err.response?.data?.message || "Unable to load this post.");
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = String(getId(user) || "");
  const author = post?.author || {};
  const comments = Array.isArray(post?.comments) ? post.comments : [];

  const liked = useMemo(() => {
    if (!Array.isArray(post?.likes)) return Boolean(post?.isLiked);
    return post.likes.some((like) => String(getId(like)) === currentUserId);
  }, [post, currentUserId]);

  const saved = useMemo(() => {
    if (!Array.isArray(post?.savedBy)) return Boolean(post?.isSaved);
    return post.savedBy.some((item) => String(getId(item)) === currentUserId);
  }, [post, currentUserId]);

  const formatTime = (date) => {
    if (!date) return "";
    const diff = Math.max(0, Date.now() - new Date(date).getTime());
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      const response = await api.put(`/posts/${post._id}/like`);
      if (response.data?.post) setPost(response.data.post);
      else await loadPost();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update vote.");
    }
  };

  const handleSave = async () => {
    if (!post) return;
    try {
      const response = await api.put(`/posts/${post._id}/save`);
      if (response.data?.post) setPost(response.data.post);
      else await loadPost();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save post.");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard?.writeText(window.location.href);
      setNotice("Post link copied.");
      setTimeout(() => setNotice(""), 1800);
    } catch {
      setError("Unable to copy the post link.");
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();
    const text = commentText.trim();
    if (!text || !post) return;

    try {
      setSending(true);
      setError("");
      const response = await api.post(`/posts/${post._id}/comments`, { text });
      const next = response.data?.post;
      if (next) setPost(next);
      setCommentText("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add your comment.");
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (event, commentId) => {
    event.preventDefault();
    const text = replyText.trim();
    if (!text || !post) return;

    try {
      setReplying(true);
      setError("");
      const response = await api.post(`/posts/${post._id}/replies`, {
        commentId,
        text,
      });
      const next = response.data?.post;
      if (next) setPost(next);
      setReplyText("");
      setReplyFor(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add your reply.");
    } finally {
      setReplying(false);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      const response = await api.put(`/posts/${post._id}/comment-like`, { commentId });
      if (response.data?.post) setPost(response.data.post);
      else await loadPost();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to like comment.");
    }
  };

  const commentLiked = (comment) =>
    Array.isArray(comment.likes) &&
    comment.likes.some((like) => String(getId(like)) === currentUserId);

  const renderAvatar = (person, className = "") => {
    if (person?.profilePicture) {
      return <img className={`post-discussion-avatar ${className}`} src={person.profilePicture} alt={person.name || "User"} />;
    }
    return <div className={`post-discussion-avatar fallback ${className}`}>{(person?.name || "Y").charAt(0).toUpperCase()}</div>;
  };

  if (loading) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-loading"><span className="discussion-spinner" /> Loading discussion...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-error">
          <h2>Post unavailable</h2>
          <p>{error || "This post is no longer available."}</p>
          <button onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <header className="discussion-topbar">
        <button className="discussion-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span>Back to feed</span>
        </button>
        <Link to="/dashboard" className="discussion-brand">
          <span>Y</span> Yugma
        </Link>
      </header>

      <main className="discussion-main">
        <div className="discussion-breadcrumb">HOME / DISCUSSION</div>
        {error && <div className="discussion-alert error">{error}</div>}
        {notice && <div className="discussion-alert success">{notice}</div>}

        <article className="discussion-post-card">
          <div className="discussion-post-head">
            <Link to={`/profile/${author._id || author.id}`} className="discussion-author">
              {renderAvatar(author)}
              <div>
                <strong>{author.name || "Yugma member"}</strong>
                <span>{author.headline || "Professional on Yugma"} · {formatTime(post.createdAt)}</span>
              </div>
            </Link>
            <button className="discussion-more" aria-label="More options"><MoreHorizontal size={20} /></button>
          </div>

          <div className="discussion-post-content">
            <p>{post.content}</p>
            {post.image && <img src={post.image} alt="Post" />}
          </div>

          <div className="discussion-post-stats">
            <span>{post.likes?.length || 0} votes</span>
            <span>{comments.length} comments</span>
          </div>

          <div className="discussion-actions">
            <button className={liked ? "active" : ""} onClick={handleLike}>
              <ArrowUp size={19} /><b>{post.likes?.length || 0}</b><ArrowDown size={19} />
            </button>
            <button className="active" onClick={() => document.getElementById("discussion-comment-input")?.focus()}>
              <MessageCircle size={18} /> Comments
            </button>
            <button onClick={handleShare}><Share2 size={18} /> Share</button>
            <button className={saved ? "active" : ""} onClick={handleSave}><Bookmark size={18} /> {saved ? "Saved" : "Save"}</button>
          </div>
        </article>

        <section className="discussion-comments-card">
          <div className="discussion-comments-header">
            <div>
              <span>DISCUSSION</span>
              <h1>{comments.length} {comments.length === 1 ? "Comment" : "Comments"}</h1>
            </div>
            <MessageCircle size={23} />
          </div>

          <form className="discussion-composer" onSubmit={handleComment}>
            {renderAvatar(user)}
            <div className="discussion-composer-box">
              <textarea
                id="discussion-comment-input"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Join the discussion..."
                maxLength={500}
                rows={3}
              />
              <div>
                <span>{commentText.length}/500</span>
                <button type="submit" disabled={sending || !commentText.trim()}>
                  <Send size={15} /> {sending ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          </form>

          <div className="discussion-comment-list">
            {comments.length === 0 ? (
              <div className="discussion-empty-comments">
                <MessageCircle size={32} />
                <strong>Start the conversation</strong>
                <span>Be the first person to share a thought.</span>
              </div>
            ) : (
              comments.map((comment) => {
                const replies = Array.isArray(comment.replies) ? comment.replies : [];
                return (
                  <article className="discussion-comment" key={comment._id}>
                    {renderAvatar(comment.user)}
                    <div className="discussion-comment-main">
                      <div className="discussion-comment-bubble">
                        <div className="discussion-comment-author">
                          <strong>{comment.user?.name || "Yugma member"}</strong>
                          <span>{formatTime(comment.createdAt)}</span>
                        </div>
                        <p>{comment.text}</p>
                      </div>

                      <div className="discussion-comment-tools">
                        <button className={commentLiked(comment) ? "liked" : ""} onClick={() => handleCommentLike(comment._id)}>
                          <Heart size={14} fill={commentLiked(comment) ? "currentColor" : "none"} /> {comment.likes?.length || 0}
                        </button>
                        <button onClick={() => { setReplyFor(replyFor === comment._id ? null : comment._id); setReplyText(""); }}>
                          Reply
                        </button>
                        {replies.length > 0 && <span>{replies.length} {replies.length === 1 ? "reply" : "replies"}</span>}
                      </div>

                      {replies.length > 0 && (
                        <div className="discussion-replies">
                          {replies.map((reply) => (
                            <div className="discussion-reply" key={reply._id}>
                              {renderAvatar(reply.user, "small")}
                              <div>
                                <div className="discussion-reply-head">
                                  <strong>{reply.user?.name || "Yugma member"}</strong>
                                  <span>{formatTime(reply.createdAt)}</span>
                                </div>
                                <p>{reply.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {replyFor === comment._id && (
                        <form className="discussion-reply-form" onSubmit={(event) => handleReply(event, comment._id)}>
                          {renderAvatar(user, "small")}
                          <input value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Write a reply..." maxLength={500} autoFocus />
                          <button disabled={replying || !replyText.trim()} type="submit">{replying ? "..." : <Send size={15} />}</button>
                        </form>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PostDetail;
