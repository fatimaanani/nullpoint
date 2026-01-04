import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/topBar";
import "../styles/thoughtsHistory.css";
import kaomojilib from "kaomojilib";
import axios from "axios";

function buildKaomojiCategories() {
  const kaomojiLibrary = kaomojilib?.library || {};
  const allKaomojiItems = Object.values(kaomojiLibrary);

  const filterByKeywords = (keywords) => {
    const searchWords = Array.isArray(keywords) ? keywords : [keywords];
    return allKaomojiItems
      .filter((item) =>
        item.keywords?.some((keyword) =>
          searchWords.some((word) => keyword.toLowerCase().includes(word))
        )
      )
      .map((item) => item.icon);
  };

  return {
    happy: filterByKeywords("happy"),
    sad: filterByKeywords("sad"),
    love: filterByKeywords("love"),
    cute: filterByKeywords(["cute", "shy"]),
    angry: filterByKeywords("angry"),
    crying: filterByKeywords(["cry", "tears"]),
    random: allKaomojiItems.map((item) => item.icon),
  };
}

const kaomojiCategories = buildKaomojiCategories();

const kaomojiTabs = [
  { key: "happy", label: "happy" },
  { key: "sad", label: "sad" },
  { key: "love", label: "love" },
  { key: "cute", label: "cute/shy" },
  { key: "angry", label: "angry" },
  { key: "crying", label: "crying" },
  { key: "random", label: "random" },
];

function ThoughtsHistory() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const [posts, setPosts] = useState([]);
  const [openReactionsPostId, setOpenReactionsPostId] = useState(null);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [isReplying, setIsReplying] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyImages, setReplyImages] = useState([]);
  const [replyFeedback, setReplyFeedback] = useState("");
  const [showKaomojiPopup, setShowKaomojiPopup] = useState(null);
  const [activeKaomojiCategory, setActiveKaomojiCategory] = useState("happy");

  const kaomojiRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/profile/thoughts-history/${userId}`)
      .then((res) => setPosts(res.data))
      .catch(() => setPosts([]));
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (kaomojiRef.current && !kaomojiRef.current.contains(e.target)) {
        setShowKaomojiPopup(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 3 - replyImages.length;
    if (remaining <= 0) return;

    const selected = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setReplyImages((prev) => [...prev, ...selected]);
    e.target.value = null;
  };

  const submitReply = async (comment, postId) => {
    if (!replyText.trim() && replyImages.length === 0) {
      setReplyFeedback("You submitted an empty reply (╯°□°）╯︵ ┻━┻");
      setTimeout(() => setReplyFeedback(""), 2000);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/comments/reply",
        {
          user_id: userId,
          post_id: postId,
          parent_comment_id: comment.comment_id,
          content: replyText,
        }
      );

      if (response.data.success) {
        setReplyText("");
        setReplyImages([]);
        setIsReplying(null);
        setShowKaomojiPopup(null);

        const updated = await axios.get(
          `http://localhost:5000/profile/thoughts-history/${userId}`
        );
        setPosts(updated.data);
      }
    } catch {
      setReplyFeedback("Something went wrong ＞︿＜");
      setTimeout(() => setReplyFeedback(""), 2000);
    }
  };

  return (
    <div className="thoughts-history-container">
      <TopBar title="Thoughts History" />

      <button className="back-btn" onClick={() => navigate("/profile")}>
        ← Back to profile
      </button>

      <div className="thoughts-history-list">
        {posts.length === 0 ? (
          <p className="empty-text">No thoughts yet ＞︿＜</p>
        ) : (
          posts.map((post) => (
            <div key={post.post_id}>
              <div className="thought-history-card">
                <p className="thought-history-date">
                  {new Date(post.creation_date).toLocaleDateString()}
                </p>

                <p className="thought-history-content">{post.content}</p>

                {post.images?.length > 0 && (
                  <div className="post-images">
                    {post.images.map((img, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000/uploads/${img}`}
                        alt="post"
                        className="post-image"
                      />
                    ))}
                  </div>
                )}

                <div className="thought-history-actions">
                  <button
                    className="icon-btn"
                    onClick={() => {
                      setOpenReactionsPostId(
                        openReactionsPostId === post.post_id
                          ? null
                          : post.post_id
                      );
                      setOpenCommentsPostId(null);
                    }}
                  >
                    •ᴗ•
                  </button>

                  <button
                    className="icon-btn"
                    onClick={() => {
                      setOpenCommentsPostId(
                        openCommentsPostId === post.post_id
                          ? null
                          : post.post_id
                      );
                      setOpenReactionsPostId(null);
                    }}
                  >
                    ☰
                  </button>
                </div>
              </div>

              {openReactionsPostId === post.post_id && (
                <div className="reaction-list">
                  {post.reactions.map((reaction, index) => (
                    <div key={index} className="reaction-item">
                      <span>{reaction.username}</span>
                      <span>{reaction.reaction_type}</span>
                    </div>
                  ))}
                </div>
              )}

              {openCommentsPostId === post.post_id && (
                <div className="comments-section">
                  {post.comments.map((comment) => (
                    <div key={comment.comment_id} className="comment-item">
                      <p className="comment-text">
                        <strong>{comment.username}</strong>:{" "}
                        {comment.content}
                      </p>

                      {comment.replies.map((reply) => (
                        <p
                          key={reply.reply_id}
                          className="comment-text"
                        >
                          ↳ <strong>{reply.username}</strong>:{" "}
                          {reply.content}
                        </p>
                      ))}

                      <div className="comment-actions">
                        <button
                          className="comment-btn"
                          onClick={() =>
                            setIsReplying(
                              isReplying === comment.comment_id
                                ? null
                                : comment.comment_id
                            )
                          }
                        >
                          Reply
                        </button>
                      </div>

                      {isReplying === comment.comment_id && (
                        <div className="reply-box">
                          <textarea
                            value={replyText}
                            onChange={(e) =>
                              setReplyText(e.target.value)
                            }
                            placeholder="Write a reply..."
                          />

                          <div className="reply-actions">
                            <button
                              onClick={() =>
                                setShowKaomojiPopup(
                                  showKaomojiPopup === comment.comment_id
                                    ? null
                                    : comment.comment_id
                                )
                              }
                            >
                              (≧▽≦)
                            </button>

                            <button
                              onClick={() =>
                                fileInputRef.current.click()
                              }
                            >
                              ⬒
                            </button>

                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              ref={fileInputRef}
                              style={{ display: "none" }}
                              onChange={handleImageAdd}
                            />

                            <button
                              onClick={() =>
                                submitReply(comment, post.post_id)
                              }
                            >
                              Submit
                            </button>
                          </div>

                          {showKaomojiPopup ===
                            comment.comment_id && (
                            <div
                              className="kaomoji-popup"
                              ref={kaomojiRef}
                            >
                              <div className="kaomoji-tabs">
                                {kaomojiTabs.map((tab) => (
                                  <button
                                    key={tab.key}
                                    className={
                                      activeKaomojiCategory === tab.key
                                        ? "kaomoji-tab active"
                                        : "kaomoji-tab"
                                    }
                                    onClick={() =>
                                      setActiveKaomojiCategory(
                                        tab.key
                                      )
                                    }
                                  >
                                    {tab.label}
                                  </button>
                                ))}
                              </div>

                              <div className="kaomoji-list">
                                {kaomojiCategories[
                                  activeKaomojiCategory
                                ].map((icon, index) => (
                                  <button
                                    key={index}
                                    className="kaomoji-item"
                                    onClick={() =>
                                      setReplyText((prev) =>
                                        prev
                                          ? prev + " " + icon
                                          : icon
                                      )
                                    }
                                  >
                                    {icon}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ThoughtsHistory;
