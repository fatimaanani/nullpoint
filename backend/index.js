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
//quotes 
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
// most used moods (profile)
app.get("/profile/:user_id/moods", async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const [rows] = await pool.query(
      `
      SELECT jt.tag_name, COUNT(*) AS usage_count
      FROM journal_tags jt
      JOIN journal_entries je ON jt.entry_id = je.entry_id
      WHERE je.user_id = ?
      GROUP BY jt.tag_name
      ORDER BY usage_count DESC
      LIMIT 4
      `,
      [user_id]
    );

    res.json(rows);
  } catch (error) {
    console.log("MOST USED MOODS ERROR:", error.sqlMessage || error);
    res.json([]);
  }
});

// thoughts history (profile)
app.get("/profile/thoughts-history/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [posts] = await pool.query(
      "SELECT post_id, content, creation_date FROM posts WHERE user_id = ? ORDER BY creation_date DESC",
      [userId]
    );

    if (posts.length === 0) {
      return res.json([]);
    }

    const postIds = posts.map((p) => p.post_id);

    const [reactions] = await pool.query(
      `SELECT pr.post_id, pr.reaction_type, u.username
       FROM post_reactions pr
       JOIN users u ON pr.user_id = u.user_id
       WHERE pr.post_id IN (?)`,
      [postIds]
    );

    const [comments] = await pool.query(
      `SELECT pc.comment_id, pc.post_id, pc.parent_comment_id, pc.content, u.username
       FROM post_comments pc
       JOIN users u ON pc.user_id = u.user_id
       WHERE pc.post_id IN (?)
       ORDER BY pc.creation_date ASC`,
      [postIds]
    );

    const [images] = await pool.query(
      `SELECT post_id, image_url
       FROM post_images
       WHERE post_id IN (?)`,
      [postIds]
    );

    const result = posts.map((post) => {
      const postReactions = reactions.filter(
        (r) => r.post_id === post.post_id
      );

      const postComments = comments.filter(
        (c) =>
          c.post_id === post.post_id &&
          c.parent_comment_id === null
      );

      const commentsWithReplies = postComments.map((comment) => ({
        comment_id: comment.comment_id,
        content: comment.content,
        username: comment.username,
        replies: comments
          .filter((r) => r.parent_comment_id === comment.comment_id)
          .map((r) => ({
            reply_id: r.comment_id,
            content: r.content,
            username: r.username
          }))
      }));

      const postImages = images
        .filter((img) => img.post_id === post.post_id)
        .map((img) => img.image_url);

      return {
        post_id: post.post_id,
        content: post.content,
        creation_date: post.creation_date,
        reactions: postReactions,
        comments: commentsWithReplies,
        images: postImages
      };
    });

    res.json(result);
  } catch (error) {
    console.log("THOUGHTS HISTORY ERROR:", error.sqlMessage || error);
    res.status(500).json({ message: "server_error" });
  }
});


//cast
app.post(
  "/posts/create",
  upload.array("images", 3),
  async (req, res) => {

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { user_id, content, is_anonymous } = req.body;

if (!user_id || (!content && (!req.files || req.files.length === 0))) {
      return res.json({ success: false, message: "missing_data" });
    }

    try {
      const [result] = await pool.query(
        "INSERT INTO posts (user_id, content, is_anonymous) VALUES (?, ?, ?)",
        [user_id, content || "", is_anonymous === "true" ? 1 : 0]
      );

      const postId = result.insertId;

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await pool.query(
            "INSERT INTO post_images (post_id, image_url) VALUES (?, ?)",
            [postId, file.filename]
          );
        }
      }

      res.json({ success: true, post_id: postId });
    } catch (error) {
      console.log("CREATE POST ERROR:", error.sqlMessage || error);
      res.json({ success: false, message: "server_error" });
    }
  }
);

//comments
app.post("/comments/reply", async (req, res) => {
  const { user_id, post_id, parent_comment_id, content } = req.body;

  if (!user_id || !post_id || !parent_comment_id || !content) {
    return res.json({ success: false, message: "missing_data" });
  }

  try {
    await pool.query(
      "INSERT INTO post_comments (post_id, user_id, parent_comment_id, content) VALUES (?, ?, ?, ?)",
      [post_id, user_id, parent_comment_id, content]
    );

    res.json({ success: true });
  } catch (error) {
    console.log("REPLY ERROR:", error.sqlMessage || error);
    res.json({ success: false, message: "server_error" });
  }
});

//tryoiut
app.post(
  "/comments/add",
  upload.array("images", 3),
  async (req, res) => {
    const { user_id, post_id, parent_comment_id, content } = req.body;

    if (!user_id || !post_id || !content) {
      return res.json({ success: false });
    }

    try {
      const [commentResult] = await pool.query(
        "INSERT INTO post_comments (user_id, post_id, parent_comment_id, content) VALUES (?, ?, ?, ?)",
        [user_id, post_id, parent_comment_id || null, content]
      );

      const commentId = commentResult.insertId;

      if (req.files && req.files.length > 0) {
        const imageValues = req.files.map((file) => [
          commentId,
          file.filename
        ]);

        await pool.query(
          "INSERT INTO comment_images (comment_id, image_url) VALUES ?",
          [imageValues]
        );
      }

      res.json({ success: true });
    } catch (error) {
      console.log("COMMENT ERROR:", error.sqlMessage || error);
      res.json({ success: false });
    }
  }
);
// feed
app.get("/feed", async (req, res) => {
  const { user_id, tab } = req.query;

  try {
    const [posts] = await pool.query(`
      SELECT 
        p.post_id,
        p.content,
        p.creation_date,
        p.is_anonymous,
        u.username
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      ORDER BY p.creation_date DESC
    `);

    if (posts.length === 0) {
      return res.json([]);
    }

    const postIds = posts.map(p => p.post_id);
let hiddenPostIds = [];

if (user_id) {
  const [hidden] = await pool.query(
    "SELECT post_id FROM hidden_posts WHERE user_id = ?",
    [user_id]
  );
  hiddenPostIds = hidden.map(h => h.post_id);
}

    const [images] = await pool.query(
      "SELECT post_id, image_url FROM post_images WHERE post_id IN (?)",
      [postIds]
    );

    const [reactions] = await pool.query(
      `SELECT post_id, COUNT(*) AS count
       FROM post_reactions
       WHERE post_id IN (?)
       GROUP BY post_id`,
      [postIds]
    );

    const [comments] = await pool.query(
  `SELECT 
     pc.comment_id,
     pc.post_id,
     pc.parent_comment_id,
     pc.content,
     u.username
   FROM post_comments pc
   JOIN users u ON pc.user_id = u.user_id
   WHERE pc.post_id IN (?)
   ORDER BY pc.creation_date ASC`,
  [postIds]
);

    const [commentImages] = await pool.query(
      `SELECT comment_id, image_url
       FROM comment_images
       WHERE comment_id IN (
         SELECT comment_id FROM post_comments WHERE post_id IN (?)
       )`,
      [postIds]
    );

    let userReactions = [];

    if (user_id) {
      const [rows] = await pool.query(
        `SELECT post_id
         FROM post_reactions
         WHERE user_id = ? AND post_id IN (?)`,
        [user_id, postIds]
      );
      userReactions = rows;
    }

    const result = posts
  .filter(post => !hiddenPostIds.includes(post.post_id))
  .map(post => {
    const postImages = images
      .filter(i => i.post_id === post.post_id)
      .map(i => i.image_url);

    const postReaction = reactions.find(
      r => r.post_id === post.post_id
    );

    const postComments = comments.filter(
      c => c.post_id === post.post_id && c.parent_comment_id === null
    );

    const commentsWithReplies = postComments.map(comment => ({
      comment_id: comment.comment_id,
      content: comment.content,
        username: comment.username,
      images: commentImages
        .filter(img => img.comment_id === comment.comment_id)
        .map(img => img.image_url),
      replies: comments
        .filter(r => r.parent_comment_id === comment.comment_id)
        .map(r => ({
          reply_id: r.comment_id,
          content: r.content,
          username: r.username,
          images: commentImages
            .filter(img => img.comment_id === r.comment_id)
            .map(img => img.image_url)
        }))
    }));

    return {
      post_id: post.post_id,
      content: post.content,
      creation_date: post.creation_date,
      username: post.is_anonymous ? "Anonymous User" : post.username,
      images: postImages,
      reaction_count: postReaction ? postReaction.count : 0,
      comments: commentsWithReplies
    };
  });

    // trending tab
    if (tab === "trending") {
      const trending = result.filter(
        post =>
          post.reaction_count + post.comments.length >= 4
      );

      return res.json(trending);
    }

    // default = recent
    res.json(result);
  } catch (error) {
    console.log("FEED ERROR:", error.sqlMessage || error);
    res.status(500).json({ message: "server_error" });
  }
});


//reactions
app.post("/reactions/add", async (req, res) => {
  const { user_id, post_id, reaction_type } = req.body;

  if (!user_id || !post_id || !reaction_type) {
    return res.json({ success: false });
  }

  try {
    const [existing] = await pool.query(
      "SELECT reaction_id FROM post_reactions WHERE user_id = ? AND post_id = ? AND reaction_type = ?",
      [user_id, post_id, reaction_type]
    );

    if (existing.length > 0) {
      await pool.query(
        "DELETE FROM post_reactions WHERE reaction_id = ?",
        [existing[0].reaction_id]
      );
    } else {
      await pool.query(
        "INSERT INTO post_reactions (user_id, post_id, reaction_type) VALUES (?, ?, ?)",
        [user_id, post_id, reaction_type]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.log("REACTION ERROR:", error.sqlMessage || error);
    res.json({ success: false });
  }
});

//comments
app.post(
  "/comments/add",
  upload.array("images", 3),
  async (req, res) => {
    const { user_id, post_id, content, parent_comment_id } = req.body;

    if (!user_id || !post_id || !content) {
      return res.json({ success: false });
    }

    try {
      const [result] = await pool.query(
        "INSERT INTO post_comments (user_id, post_id, parent_comment_id, content) VALUES (?, ?, ?, ?)",
        [user_id, post_id, parent_comment_id || null, content]
      );

      const commentId = result.insertId;

      if (req.files && req.files.length > 0) {
        const values = req.files.map((file) => [
          commentId,
          file.filename
        ]);

        await pool.query(
          "INSERT INTO comment_images (comment_id, image_url) VALUES ?",
          [values]
        );
      }

      res.json({ success: true });
    } catch (error) {
      console.log("COMMENT ERROR:", error.sqlMessage || error);
      res.json({ success: false });
    }
  }
);

// update about (profile)
app.post("/profile/update-about", async (req, res) => {
  const { user_id, about } = req.body;

  if (!user_id) {
    return res.json({ success: false, message: "missing_user" });
  }

  try {
    await pool.query(
      "UPDATE users SET about = ? WHERE user_id = ?",
      [about, user_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.log("ABOUT UPDATE ERROR:", error.sqlMessage || error);
    res.json({ success: false, message: "server_error" });
  }
});
// hide post
app.post("/posts/hide", async (req, res) => {
  const { user_id, post_id } = req.body;

  if (!user_id || !post_id) {
    return res.json({ success: false });
  }

  try {
    const [existing] = await pool.query(
      "SELECT hidden_id FROM hidden_posts WHERE user_id = ? AND post_id = ?",
      [user_id, post_id]
    );

    if (existing.length === 0) {
      await pool.query(
        "INSERT INTO hidden_posts (user_id, post_id) VALUES (?, ?)",
        [user_id, post_id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.log("HIDE POST ERROR:", error.sqlMessage || error);
    res.json({ success: false });
  }
});
// report post
app.post("/posts/report", async (req, res) => {
  const { user_id, post_id } = req.body;

  if (!user_id || !post_id) {
    return res.json({ success: false });
  }

  try {
    await pool.query(
      "INSERT INTO reports (user_id, post_id) VALUES (?, ?)",
      [user_id, post_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.log("REPORT POST ERROR:", error.sqlMessage || error);
    res.json({ success: false });
  }
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
