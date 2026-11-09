import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const FILE = process.env.DATA_FILE || "./lessons.json";
const load = () => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : []);
const save = (data) => fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

// List all lessons
app.get("/api/lessons", (req, res) => res.json(load()));

// Create a lesson (document with an English paragraph)
app.post("/api/lessons", (req, res) => {
  const { title, text } = req.body;
  if (!title?.trim() || !text?.trim())
    return res.status(400).json({ error: "Title and paragraph are required." });
  const lessons = load();
  const lesson = { id: Date.now().toString(), title: title.trim(), text: text.trim(), results: [] };
  lessons.push(lesson);
  save(lessons);
  res.status(201).json(lesson);
});

// Save a student's reading result (score + wrong words)
app.post("/api/lessons/:id/results", (req, res) => {
  const lessons = load();
  const lesson = lessons.find((l) => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: "Lesson not found." });
  const { student, score, wrongWords, kind } = req.body;
  lesson.results.push({ student: student || "Student", score, kind, wrongWords, date: new Date().toISOString() });
  save(lessons);
  res.json(lesson);
});

app.delete("/api/lessons/:id", (req, res) => {
  save(load().filter((l) => l.id !== req.params.id));
  res.status(204).end();
});

app.listen(5000, () => console.log("API running on http://localhost:5000"));
