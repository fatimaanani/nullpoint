import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/journal.css";
import TopBar from "../components/topBar";
import api from "../api";

function Journal() {
  const [entry, setEntry] = useState("");
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState("");

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [quote, setQuote] = useState("");

  const [showTitleModal, setShowTitleModal] = useState(false);
  const [entryTitle, setEntryTitle] = useState("");
  const [titleFeedback, setTitleFeedback] = useState("");
  const navigate = useNavigate();


  const moods = ["calm", "tired", "grateful", "overwhelmed", "peaceful", "anxious"];

 useEffect(() => {
  api
    .get("/journal/quote")
    .then((res) => {
      if (res.data && res.data.quote_text) {
        setQuote(res.data.quote_text);
      }
    })
    .catch(() => {
      setQuote("");
    });
}, []);


  const toggleMood = (tag) => {
    if (selectedMoods.includes(tag)) {
      setSelectedMoods(selectedMoods.filter((t) => t !== tag));
    } else {
      setSelectedMoods([...selectedMoods, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!entry.trim()) {
      setFeedbackMessage("You submitted an empty entry (╯°□°）╯︵ ┻━┻");
      setTimeout(() => setFeedbackMessage(""), 2000);
      return;
    }

    setShowTitleModal(true);
  };

  const handleSaveTitle = async () => {
    if (!entryTitle.trim()) {
      setTitleFeedback("Title cannot be empty (╯°□°）╯︵ ┻━┻");
      setTimeout(() => setTitleFeedback(""), 2000);
      return;
    }

    try {
      const response = await api.post(
  "/journal/add",
  {
    user_id: localStorage.getItem("user_id"),
    title: entryTitle,
    entry: entry,
    tags: selectedMoods
  }
);

      if (response.data && response.data.success) {
        setTitleFeedback("Title entered successfully (๑˃̵ᴗ˂̵)و");
        setFeedbackMessage("Entry submitted successfully (๑˃̵ᴗ˂̵)و");

        setTimeout(() => {
          setShowTitleModal(false);
          setEntry("");
          setEntryTitle("");
          setSelectedMoods([]);
          setCustomTags([]);
          setTitleFeedback("");
          setFeedbackMessage("");
        }, 1200);
      }
    } catch (error) {
      setTitleFeedback("Something went wrong (╯°□°）╯︵ ┻━┻");
      setTimeout(() => setTitleFeedback(""), 2000);
    }
  };

  const handleCreateTag = () => {
    const clean = newTagText.trim().toLowerCase();
    if (clean && !customTags.includes(clean)) {
      setCustomTags([...customTags, clean]);
    }
    setNewTagText("");
    setIsAddingTag(false);
  };

  return (
    <div className="journalwrite-container">
      <TopBar title="Journal" />

      <div className="paper-sheet">
        <p className="dear-diary">Dear Diary,</p>

        <textarea
          className="diary-textarea"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="write your thoughts here..."
        ></textarea>

        <button className="submit-entry-btn" onClick={handleSubmit}>
          Submit Entry
        </button>

        {feedbackMessage && (
          <div className="journal-feedback">{feedbackMessage}</div>
        )}
      </div>

      <div className="tags-under-paper">
        {moods.map((tag) => (
          <span
            key={tag}
            className={`tag-chip ${selectedMoods.includes(tag) ? "selected" : ""}`}
            onClick={() => toggleMood(tag)}
          >
            {tag}
          </span>
        ))}

        {customTags.map((tag, i) => (
          <span
            key={i}
            className={`tag-chip ${selectedMoods.includes(tag) ? "selected" : ""}`}
            onClick={() => toggleMood(tag)}
          >
            {tag}
          </span>
        ))}

        {isAddingTag && (
          <div className="new-tag-box">
            <input
              type="text"
              className="new-tag-input"
              placeholder="new tag..."
              value={newTagText}
              onChange={(e) => setNewTagText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
            />
            <button className="new-tag-save" onClick={handleCreateTag}>
              ✔
            </button>
          </div>
        )}

        {!isAddingTag && (
          <button className="add-tag-chip" onClick={() => setIsAddingTag(true)}>
            + Add Tag
          </button>
        )}
      </div>

      <div className="below-paper">
        <p className="quote">{quote ? `“${quote}”` : ""}</p>

        <Link className="log-button" to="/journal-log">
          View journal log →
        </Link>
      </div>

      {showTitleModal && (
        <div className="title-modal-overlay">
          <div className="title-modal">
            <p className="modal-title">Entry title (✿◠‿◠):</p>

            <input
              type="text"
              className="title-input"
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
              placeholder="Write a title..."
            />
            <button
              type="button"
              className="save-title-btn"
              onClick={handleSaveTitle}
            >
              Save
            </button>

            <button
              type="button"
              className="cancel-title-btn"
              onClick={() => {
                setShowTitleModal(false);
                setEntryTitle("");
                setTitleFeedback("");
              }}
            >
              Cancel
            </button>
            {titleFeedback && (
              <div className="title-feedback">{titleFeedback}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Journal;


