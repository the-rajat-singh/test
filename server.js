const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// file to store notes
const NOTES_FILE = path.join(__dirname, "notes.json");

// initialize file if not exists
if (!fs.existsSync(NOTES_FILE)) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify([]));
}

/**
 * Health check API
 * Used to verify backend is running
 */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running fine "
  });
});

/**
 * Get all notes
 */
app.get("/notes", (req, res) => {
  const notes = JSON.parse(fs.readFileSync(NOTES_FILE));
  res.json(notes);
});

/**
 * Add a new note
 */
app.post("/notes", (req, res) => {
  const { note } = req.body;

  if (!note) {
    return res.status(400).json({ error: "Note is required" });
  }

  const notes = JSON.parse(fs.readFileSync(NOTES_FILE));

  const newNote = {
    id: Date.now(),
    note
  };

  notes.push(newNote);
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));

  res.status(201).json(newNote);
});

/**
 * Simple UI to add notes
 */
app.get("/", (req, res) => {
  res.send(`
    <h2> App</h2>
    <form method="POST" action="/add-note">
      <input name="note" placeholder="Write your note" required />
      <button>Add</button>
    </form>
    <br/>
    <a href="/notes">View Notes (JSON)</a>
  `);
});

app.use(express.urlencoded({ extended: true }));

app.post("/add-note", (req, res) => {
  const note = req.body.note;

  const notes = JSON.parse(fs.readFileSync(NOTES_FILE));
  notes.push({ id: Date.now(), note });

  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
