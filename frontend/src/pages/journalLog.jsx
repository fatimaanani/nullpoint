import React, { useState, useMemo, useEffect } from "react";
import "../styles/journalLog.css";
import TopBar from "../components/topBar";
import { useNavigate } from "react-router-dom";
import api from "../api";

const entryColors = ["#b8c9ff", "#f3b8d9", "#d9b8e6", "#6bb397", "#c5e6d3"];

function assignColorsToEntries(entriesOfDay) {
  if (entriesOfDay.length === 1) {
    return [{ ...entriesOfDay[0], color: "#6bb397" }];
  }
  const pastel = entryColors.filter((c) => c !== "#6bb397");
  return entriesOfDay.map((e) => ({
    ...e,
    color: pastel[Math.floor(Math.random() * pastel.length)],
  }));
}

function JournalLog() {
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [expandedEntry, setExpandedEntry] = useState(null);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

 useEffect(() => {
  const userId = localStorage.getItem("user_id");
  api
    .get(`/journal/log/${userId}`)
    .then((res) => {
      setEntries(res.data);
    })
    .catch(() => {
      setEntries([]);
    });
}, []);


  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentMonth, currentYear]);

  const firstDayIndex = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentMonth, currentYear]);

  const entriesByDay = useMemo(() => {
    const map = {};

    entries.forEach((entry) => {
      const entryDate = new Date(entry.creation_date);

      if (
        entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear
      ) {
        const day = entryDate.getDate();

        if (!map[day]) map[day] = [];
        map[day].push({
          id: entry.entry_id,
          title: entry.title,
          content: entry.entries,
          mood: entry.tags || "",
        });
      }
    });

    return map;
  }, [entries, currentMonth, currentYear]);

  const openDay = (day) => {
    setSelectedDate(day);
    setExpandedEntry(null);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setExpandedEntry(null);
  };

  const renderSquares = (entries) => {
    const colored = assignColorsToEntries(entries);
    return (
      <div className="entry-squares">
        {colored.map((e) => (
          <div
            key={e.id}
            className="entry-square"
            style={{ backgroundColor: e.color }}
          ></div>
        ))}
      </div>
    );
  };

  const changeMonth = (offset) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
    setExpandedEntry(null);
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="journal-log-page">
      <div className="journal-log-container">
        <button className="journal-back-btn" onClick={() => navigate("/journal")}>
          ←
        </button>

        <h1 className="journal-log-title">Journal Log</h1>

        <div className="month-selector">
          <button onClick={() => changeMonth(-1)}>←</button>
          <span>
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
            })}{" "}
            {currentYear}
          </span>
          <button onClick={() => changeMonth(1)}>→</button>
        </div>

        <div className="calendar-wrapper">
          <div className="weekdays-row">
            {weekdays.map((w) => (
              <div className="weekday" key={w}>
                {w}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div className="empty-cell" key={"e" + i}></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEntries = entriesByDay[day] || [];

              return (
                <div
                  key={day}
                  className="calendar-day"
                  onClick={() => openDay(day)}
                >
                  <span className="day-number">{day}</span>
                  {dayEntries.length > 0 && renderSquares(dayEntries)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>entries for {selectedDate}</h2>

            {entriesByDay[selectedDate]?.length ? (
              entriesByDay[selectedDate].map((entry) => (
                <div key={entry.id} className="modal-entry">
                  <h3>{entry.title}</h3>
                  {entry.mood && (
                    <p className="modal-mood">{entry.mood}</p>
                  )}
                  <p>
                    {expandedEntry === entry.id
                      ? entry.content
                      : entry.content.slice(0, 140) +
                        (entry.content.length > 140 ? "..." : "")}
                  </p>
                  {expandedEntry !== entry.id && (
                    <button
                      className="expand-btn"
                      onClick={() => setExpandedEntry(entry.id)}
                    >
                      read more →
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>no entries</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalLog;
