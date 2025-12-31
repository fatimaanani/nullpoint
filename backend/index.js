const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");

const pool = require("./db");

dotenv.config();

const app = express();
console.log("INDEX.JS LOADED");

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.get("/", (req, res) => {
  res.json({ message: "nullpoint running (╹ڡ╹ )" });
});

app.use((req, res, next) => {
  if (req.method === "POST") {
    console.log("POST HIT:", req.originalUrl);
    console.log("BODY:", req.body);
  }
  next();
});


// authenticatimmklamfk
app.post("/authentication/register", async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if (!fullName || !username || !email || !password) {
    return res.json({ success: false, message: "missing_fields" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT user_id FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existing.length > 0) {
      return res.json({ success: false, message: "user_exists" });
    }

    const [result] = await pool.query(
      `INSERT INTO users 
        (full_name, username, email, password_hash, gender, about) 
       VALUES (?, ?, ?, ?, NULL, NULL)`,
      [fullName, username, email, password]
    );

    res.json({
      success: true,
      user_id: result.insertId
    });
  } catch (error) {
    console.log("AUTH SQL ERROR:");
    console.log(error.sqlMessage || error);
    res.json({ success: false, message: "server_error" });
  }
});


//profile
app.get("/profile/:user_id", async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const [rows] = await pool.query(
      "SELECT full_name, username, email, gender, about FROM users WHERE user_id = ?",
      [user_id]
    );

    if (!rows.length) {
      return res.json({ success: false });
    }

    res.json(rows[0]);
  } catch (error) {
    console.log("PROFILE FETCH ERROR:", error.sqlMessage || error);
    res.json({ success: false });
  }
});


// gender marra wehde
app.post("/profile/set-gender", async (req, res) => {
  const { user_id, gender } = req.body;

  if (!user_id || !gender) {
    return res.json({ success: false, message: "missing_data" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE users SET gender = ? WHERE user_id = ? AND gender IS NULL",
      [gender, user_id]
    );

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: "gender_locked" });
    }

    res.json({ success: true });
  } catch (error) {
    console.log("GENDER UPDATE ERROR:", error.sqlMessage || error);
    res.json({ success: false, message: "server_error" });
  }
});


//journal
app.post("/journal/add", async (req, res) => {
  const { user_id, title, entry, tags } = req.body;

  if (!user_id || !title || !entry) {
    return res.json({ success: false });
  }

  try {
    const entryResult = await pool.query(
      "INSERT INTO journal_entries (user_id, title, entries) VALUES (?, ?, ?)",
      [user_id, title, entry]
    );

    const entryId = entryResult[0].insertId;

    if (Array.isArray(tags)) {
      for (let i = 0; i < tags.length; i++) {
        await pool.query(
          "INSERT INTO journal_tags (entry_id, tag_name) VALUES (?, ?)",
          [entryId, tags[i]]
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.log("JOURNAL ERROR:", error.sqlMessage || error);
    res.json({ success: false });
  }
});


//journal log
app.get("/journal/log/:user_id", async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const [rows] = await pool.query(
      `SELECT 
        e.entry_id,
        e.title,
        e.entries,
        e.creation_date,
        GROUP_CONCAT(t.tag_name ORDER BY t.tag_id SEPARATOR ',') AS tags
      FROM journal_entries e
      LEFT JOIN journal_tags t ON e.entry_id = t.entry_id
      WHERE e.user_id = ?
      GROUP BY e.entry_id
      ORDER BY e.creation_date DESC`,
      [user_id]
    );

    res.json(rows);
  } catch (error) {
    res.json({ success: false });
  }
});

app.get("/journal/quote", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT quote_text, author, mood FROM journal_quotes ORDER BY RAND() LIMIT 1"
    );

    if (!rows.length) {
      return res.json({ quote_text: "", author: "", mood: "" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.json({ success: false });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
