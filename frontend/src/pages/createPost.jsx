import React, { useState, useRef, useEffect } from "react";
import "../styles/createPost.css";
import TopBar from "../components/topBar";

import EmojiPicker from "emoji-picker-react";
import { useDropzone } from "react-dropzone";
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

function CreatePost() {
  const [postText, setPostText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showKaomojiPopup, setShowKaomojiPopup] = useState(false);
  const [activeKaomojiCategory, setActiveKaomojiCategory] = useState("happy");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isAnonymousPost, setIsAnonymousPost] = useState(false);

  const emojiRef = useRef(null);
  const kaomojiRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    const remainingSlots = 3 - uploadedImages.length;
    if (remainingSlots <= 0) return;

    const allowedFiles = acceptedFiles.slice(0, remainingSlots);
    const filesWithPreview = allowedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );

    setUploadedImages((previous) => [...previous, ...filesWithPreview]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });

  const addEmojiToText = (emojiObject) => {
    setPostText((previous) => previous + emojiObject.emoji);
  };

  const addKaomojiToText = (kaomoji) => {
    setPostText((previous) => (previous ? previous + " " + kaomoji : kaomoji));
    setShowKaomojiPopup(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!postText.trim() && uploadedImages.length === 0) {
      setFeedbackMessage("You submitted an empty post (╯°□°）╯︵ ┻━┻");
      setTimeout(() => setFeedbackMessage(""), 2000);
      return;
    }

    setFeedbackMessage("Post submitted successfully (๑˃̵ᴗ˂̵)و");
    setTimeout(() => setFeedbackMessage(""), 2000);

    setPostText("");
    setUploadedImages([]);
    setIsAnonymousPost(false);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target))
        setShowEmojiPicker(false);

      if (kaomojiRef.current && !kaomojiRef.current.contains(e.target))
        setShowKaomojiPopup(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="cast-page">
      <TopBar title="Cast" />

      <div className="create-wrapper">
        <div className="create-container">
          <form className="create-form" onSubmit={handleSubmit}>
            <textarea
              className="create-textarea"
              placeholder="Cast a thought..."
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />

            <div className="actions-row">
              <div className="buttons-left">
                <button
                  type="button"
                  className="small-btn"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowKaomojiPopup(false);
                  }}
                >
                  •ᴗ•
                </button>

                <button
                  type="button"
                  className="small-btn"
                  onClick={() => {
                    setShowKaomojiPopup(!showKaomojiPopup);
                    setShowEmojiPicker(false);
                  }}
                >
                  (≧▽≦)
                </button>

                <div className="small-btn image-btn" {...getRootProps()}>
                  ⬒
                  <input {...getInputProps()} />
                </div>

                {showEmojiPicker && (
                  <div className="emoji-picker-box" ref={emojiRef}>
                    <div
                      className="close-btn"
                      onClick={() => setShowEmojiPicker(false)}
                    >
                      ×
                    </div>
                    <EmojiPicker
                      theme="dark"
                      onEmojiClick={addEmojiToText}
                      skinTonesDisabled={true}
                      searchDisabled={true}
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}

                {showKaomojiPopup && (
                  <div className="kaomoji-popup" ref={kaomojiRef}>
                    <div
                      className="close-btn"
                      onClick={() => setShowKaomojiPopup(false)}
                    >
                      ×
                    </div>

                    <div className="kaomoji-tabs">
                      {kaomojiTabs.map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          className={
                            "kaomoji-tab" +
                            (activeKaomojiCategory === tab.key ? " active" : "")
                          }
                          onClick={() => setActiveKaomojiCategory(tab.key)}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="kaomoji-list">
                      {kaomojiCategories[activeKaomojiCategory].map(
                        (icon, index) => (
                          <button
                            key={index}
                            type="button"
                            className="kaomoji-item"
                            onClick={() => addKaomojiToText(icon)}
                          >
                            {icon}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="anonymous-toggle-container">
                <span className="anonymous-text">Anonymous</span>
                <button
                  type="button"
                  className={
                    isAnonymousPost
                      ? "anonymous-toggle active"
                      : "anonymous-toggle"
                  }
                  onClick={() => setIsAnonymousPost(!isAnonymousPost)}
                >
                  <div className="anonymous-toggle-indicator" />
                </button>

                {isAnonymousPost && (
                  <span className="anonymous-pill">Anonymous post</span>
                )}
              </div>

              <button type="submit" className="submit-btn">
                Submit Thought
              </button>
            </div>

            {feedbackMessage && (
              <div className="feedback-message">{feedbackMessage}</div>
            )}

            {uploadedImages.length > 0 && (
              <div className="preview-row">
                {uploadedImages.map((img, index) => (
                  <img
                    key={index}
                    src={img.preview}
                    alt="preview"
                    className="preview-img"
                  />
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
