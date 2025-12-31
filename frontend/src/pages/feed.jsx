import React, { useState, useRef, useEffect } from "react";
import "../styles/feed.css";
import TopBar from "../components/topBar";
import EmojiPicker from "emoji-picker-react";
import { useDropzone } from "react-dropzone";
import kaomojilib from "kaomojilib";

const posts = [
  { id: 1, username: "Anonymous User", content: "Lorem ipsum dolor sit amet.", date: "1d ago" },
  { id: 2, username: "Anonymous User", content: " In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. .", date: "2d ago" },
  {
    id: 3,
    username: "Anonymous User",
    content:
      "lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu",
    date: "3d ago",
  },
];

const kaomojiList = Object.values(kaomojilib?.library || {}).map(
  (item) => item.icon
);

function Feed() {
  const [activeTab, setActiveTab] = useState("recent");
  const [openReactionForPost, setOpenReactionForPost] = useState(null);
  const [openMenuForPost, setOpenMenuForPost] = useState(null);
  const [openCommentsForPost, setOpenCommentsForPost] = useState(null);

  const [commentText, setCommentText] = useState("");
  const [commentImages, setCommentImages] = useState([]);
  const [showCommentKaomoji, setShowCommentKaomoji] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  const reactionReference = useRef(null);
  const menuReference = useRef(null);
  const commentBoxReference = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        reactionReference.current &&
        !reactionReference.current.contains(event.target)
      ) {
        setOpenReactionForPost(null);
      }

      if (
        menuReference.current &&
        !menuReference.current.contains(event.target)
      ) {
        setOpenMenuForPost(null);
      }

      if (
        commentBoxReference.current &&
        !commentBoxReference.current.contains(event.target)
      ) {
        setIsAddingComment(false);
        setShowCommentKaomoji(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReactionClick = (postId) => {
    setOpenReactionForPost(
      openReactionForPost === postId ? null : postId
    );
  };

  const handleMenuClick = (postId) => {
    setOpenMenuForPost(openMenuForPost === postId ? null : postId);
  };

  const handleCommentToggle = (postId) => {
    if (openCommentsForPost === postId) {
      setOpenCommentsForPost(null);
      setIsAddingComment(false);
    } else {
      setOpenCommentsForPost(postId);
    }
  };

  const onCommentDrop = (acceptedFiles) => {
    const remainingSlots = 3 - commentImages.length;
    if (remainingSlots <= 0) return;

    const allowedFiles = acceptedFiles.slice(0, remainingSlots);
    const filesWithPreview = allowedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );

    setCommentImages((previous) => [...previous, ...filesWithPreview]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: onCommentDrop,
  });

  const addKaomojiToComment = (kaomoji) => {
    setCommentText((previous) =>
      previous ? previous + " " + kaomoji : kaomoji
    );
    setShowCommentKaomoji(false);
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim() && commentImages.length === 0) {
      setCommentFeedback("You submitted an empty comment (╯°□°）╯︵ ┻━┻");
      setTimeout(() => setCommentFeedback(""), 2000);
      return;
    }

    setCommentFeedback("Comment submitted successfully (๑˃̵ᴗ˂̵)و");
    setTimeout(() => setCommentFeedback(""), 2000);

    setCommentText("");
    setCommentImages([]);
    setIsAddingComment(false);
  };

  return (
    <div className="feed-container">
      <TopBar title="Stillspace" />

      <div className="toggle-row">
        <button
          className={`toggle-btn ${activeTab === "recent" ? "active" : ""}`}
          onClick={() => setActiveTab("recent")}
        >
          Recent
        </button>
        <button
          className={`toggle-btn ${activeTab === "trending" ? "active" : ""}`}
          onClick={() => setActiveTab("trending")}
        >
          Trending
        </button>
      </div>

      <div className="posts-list">
        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <div className="post-header">
              <span className="username">[ Anonymous User Post ]</span>

              <span
                className="dots-menu"
                onClick={() => handleMenuClick(post.id)}
              >
                ⋯
              </span>

              {openMenuForPost === post.id && (
                <div className="menu-popup" ref={menuReference}>
                  <button>Don’t show this post</button>
                  <button>Report post</button>
                  <button
                    className="cancel-menu"
                    onClick={() => setOpenMenuForPost(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <p className="content">{post.content}</p>

            <div className="post-actions">
              <span
                className="react-btn"
                onClick={() => handleReactionClick(post.id)}
              >
                •ᴗ•
              </span>

              {openReactionForPost === post.id && (
                <div className="reaction-picker" ref={reactionReference}>
                  <div
                    className="reaction-close"
                    onClick={() => setOpenReactionForPost(null)}
                  >
                    ×
                  </div>
                  <EmojiPicker
                    theme="dark"
                    skinTonesDisabled={true}
                    searchDisabled={true}
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}

              <span
                className="comment-btn"
                onClick={() => handleCommentToggle(post.id)}
              >
                ☰
              </span>
            </div>

            <span className="date">{post.date}</span>

            {openCommentsForPost === post.id && (
              <div className="comments-section">
                {!isAddingComment && (
                  <button
                    className="add-comment-btn"
                    onClick={() => setIsAddingComment(true)}
                  >
                    Add Comment
                  </button>
                )}

                {isAddingComment && (
                  <div className="comment-box" ref={commentBoxReference}>
                    <textarea
                      className="comment-input"
                      placeholder="Write something..."
                      value={commentText}
                      onChange={(event) =>
                        setCommentText(event.target.value)
                      }
                    />

                    <div className="comment-actions">
                      <button
                        className="comment-kaomoji"
                        type="button"
                        onClick={() =>
                          setShowCommentKaomoji(!showCommentKaomoji)
                        }
                      >
                        (≧▽≦)
                      </button>

                      <div className="comment-image" {...getRootProps()}>
                        ⬒
                        <input {...getInputProps()} />
                      </div>
                    </div>

                    {showCommentKaomoji && (
                      <div className="comment-kaomoji-popup">
                        {kaomojiList.slice(0, 120).map((icon, index) => (
                          <button
                            key={index}
                            type="button"
                            className="comment-kaomoji-item"
                            onClick={() => addKaomojiToComment(icon)}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    )}

                    {commentImages.length > 0 && (
                      <div className="comment-preview-row">
                        {commentImages.map((image, index) => (
                          <img
                            key={index}
                            src={image.preview}
                            alt="preview"
                            className="comment-preview-img"
                          />
                        ))}
                      </div>
                    )}

                    {commentFeedback && (
                      <div className="comment-feedback">
                        {commentFeedback}
                      </div>
                    )}

                    <div className="modal-buttons">
                      <button
                        className="close-comment"
                        type="button"
                        onClick={() => setIsAddingComment(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="submit-comment"
                        type="button"
                        onClick={handleCommentSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;
