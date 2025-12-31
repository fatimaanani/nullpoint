import React, { useState, useEffect } from "react";
import { Venus, Mars, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/profile.css";

function Profile() {
  const [gender, setGender] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [about, setAbout] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  const [mostUsedMoods, setMostUsedMoods] = useState([]);

  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/profile/${userId}`)
      .then((res) => {
        setFullName(res.data.full_name);
        setUsername(res.data.username);
        setEmail(res.data.email);
        setGender(res.data.gender);
        setAbout(res.data.about || "");
      })
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/profile/${userId}/moods`)
      .then((res) => {
        setMostUsedMoods(res.data);
      })
      .catch(() => {
        setMostUsedMoods([]);
      });
  }, [userId]);

  const handleGenderSelect = async (value) => {
    if (gender) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/profile/set-gender",
        {
          user_id: userId,
          gender: value
        }
      );

      if (response.data.success) {
        setGender(value);
        setIsOpen(false);
      }
    } catch (error) {}
  };

  const getIcon = () => {
    if (gender === "female") return <Venus className="gender-symbol female" />;
    if (gender === "male") return <Mars className="gender-symbol male" />;
    if (gender === "prefer_not_say")
      return <Circle className="gender-symbol neutral" />;
    return <Circle className="gender-symbol placeholder" />;
  };

  const displayGender = () => {
    if (gender === "male") return "Male";
    if (gender === "female") return "Female";
    if (gender === "prefer_not_say") return "Anonymous";
    return "Select Gender";
  };

  return (
    <div className="profile-container">
      <div className="profile-layout">
        <div className="profile-left">
          <div className="profile-icon">{getIcon()}</div>
        </div>

        <div className="profile-right">
          <div className="profile-header">
            <h2 className="profile-name">{username}</h2>

            <div className="gender-dropdown-container">
              <button
                className={`gender-toggle ${gender ? "locked" : ""}`}
                onClick={() => !gender && setIsOpen(!isOpen)}
              >
                {displayGender()}
                {!gender &&
                  (isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>

              {isOpen && !gender && (
                <div className="gender-menu">
                  <div
                    className="gender-option"
                    onClick={() => handleGenderSelect("male")}
                  >
                    Male
                  </div>
                  <div
                    className="gender-option"
                    onClick={() => handleGenderSelect("female")}
                  >
                    Female
                  </div>
                  <div
                    className="gender-option"
                    onClick={() => handleGenderSelect("prefer_not_say")}
                  >
                    Prefer not to say
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="profile-box">
            <p className="label">User Information</p>
            <div className="info-details">
              <p>
                Full Name: <span className="info-value">{fullName}</span>
              </p>
              <p>
                Email: <span className="info-value">{email}</span>
              </p>
            </div>
          </div>

          <div className="profile-box about-box">
            <div className="box-header">
              <p className="label">About</p>
              <button
                className="edit-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>

            <div className="about-content-wrapper">
              {isEditing ? (
                <textarea
                  className="about-input"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Write something about yourself..."
                />
              ) : (
                <p className="about-text">
                  {about || "No bio yet ＞︿＜"}
                </p>
              )}
            </div>
          </div>

          <div className="profile-box">
            <p className="label">Most Used Moods</p>
            <div className="moods-container">
              {mostUsedMoods.length > 0 ? (
                mostUsedMoods.map((mood, index) => (
                  <span key={index} className="mood-pill">
                    {mood.tag_name.charAt(0).toUpperCase() + mood.tag_name.slice(1)}
                  </span>
                ))
              ) : (
                <p className="empty-text">No moods yet ＞︿＜ </p>
              )}
            </div>
          </div>

          <div className="profile-box">
            <p className="label">Thoughts History</p>
            <button
              className="see-all-btn"
              onClick={() => navigate("/profile/thoughts")}
            >
              See all →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
