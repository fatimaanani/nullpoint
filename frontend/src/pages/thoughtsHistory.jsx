import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/topBar";
import "../styles/thoughtsHistory.css";
import kaomojilib from "kaomojilib";

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

  const posts = [
    {
      id: 1,
      date: "2 days ago",
      content: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt.",
      reactions: [
        { user: "Fatima", emoji: "💔" },
        { user: "Emily", emoji: "❤️" },
        { user: "Anonymous User", emoji: "👍" }
      ],
      comments: [
        {
          id: 1,
          text: "Proud of you.",
          replies: []
        }
      ]
    }
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (kaomojiRef.current && !kaomojiRef.current.contains(e.target)) {
        setShowKaomojiPopup(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const submitReply = (comment) => {
    if (!replyText.trim() && replyImages.length === 0) {
      setReplyFeedback("You submitted an empty reply (╯°□°）╯︵ ┻━┻");
      setTimeout(() => setReplyFeedback(""), 2000);
      return;
    }

    comment.replies.push(replyText);

    setReplyFeedback("Reply submitted successfully (๑˃̵ᴗ˂̵)و");
    setTimeout(() => setReplyFeedback(""), 2000);

    setReplyText("");
    setReplyImages([]);
    setIsReplying(null);
    setShowKaomojiPopup(null);
  };

  return (
    <div className="thoughts-history-container">
      <TopBar title="Thoughts History" />

      <button className="back-btn" onClick={() => navigate("/profile")}>
        ← Back to profile
      </button>

      <div className="thoughts-history-list">
        {posts.map((post) => (
          <div key={post.id}>
            <div className="thought-history-card">
              <p className="thought-history-date">{post.date}</p>
              <p className="thought-history-content">{post.content}</p>

              <div className="thought-history-actions">
                <button
                  className="icon-btn"
                  onClick={() => {
                    setOpenReactionsPostId(
                      openReactionsPostId === post.id ? null : post.id
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
                      openCommentsPostId === post.id ? null : post.id
                    );
                    setOpenReactionsPostId(null);
                  }}
                >
                  ☰
                </button>
              </div>
            </div>

            {openReactionsPostId === post.id && (
              <div className="reaction-list">
                {post.reactions.map((reaction, index) => (
                  <div key={index} className="reaction-item">
                    <span>{reaction.user}</span>
                    <span>{reaction.emoji}</span>
                  </div>
                ))}
              </div>
            )}

            {openCommentsPostId === post.id && (
              <div className="comments-section">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <p className="comment-text">{comment.text}</p>

                    {comment.replies.map((reply, i) => (
                      <p key={i} className="comment-text">
                        ↳ {reply}
                      </p>
                    ))}

                    <div className="comment-actions">
                      <button
                        className="comment-btn"
                        onClick={() =>
                          setIsReplying(
                            isReplying === comment.id ? null : comment.id
                          )
                        }
                      >
                        Reply
                      </button>
                    </div>

                    {isReplying === comment.id && (
                      <div className="reply-box">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                        />

                        <div className="reply-actions">
                          <button
                            onClick={() =>
                              setShowKaomojiPopup(
                                showKaomojiPopup === comment.id
                                  ? null
                                  : comment.id
                              )
                            }
                          >
                            (≧▽≦)
                          </button>

                          <button onClick={() => fileInputRef.current.click()}>
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

                          <button onClick={() => submitReply(comment)}>
                            Submit
                          </button>
                        </div>

                        {replyImages.length > 0 && (
                          <div className="comment-preview-row">
                            {replyImages.map((img, index) => (
                              <img
                                key={index}
                                src={img.preview}
                                className="comment-preview-img"
                                alt="preview"
                              />
                            ))}
                          </div>
                        )}

                        {replyFeedback && (
                          <div className="reply-feedback">
                            {replyFeedback}
                          </div>
                        )}

                        {showKaomojiPopup === comment.id && (
                          <div className="kaomoji-popup" ref={kaomojiRef}>
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
                                    setActiveKaomojiCategory(tab.key)
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
                                      prev ? prev + " " + icon : icon
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
        ))}
      </div>
    </div>
  );
}

export default ThoughtsHistory;
