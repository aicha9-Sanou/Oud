import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("formulas.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS formulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    size REAL NOT NULL,
    concentration REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/formulas", (req, res) => {
    try {
      const formulas = db.prepare("SELECT * FROM formulas ORDER BY created_at DESC").all();
      res.json(formulas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch formulas" });
    }
  });

  app.post("/api/formulas", (req, res) => {
    const { name, size, concentration } = req.body;
    if (!name || !size || !concentration) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    try {
      const info = db.prepare("INSERT INTO formulas (name, size, concentration) VALUES (?, ?, ?)").run(name, size, concentration);
      res.json({ id: info.lastInsertRowid, name, size, concentration });
    } catch (error) {
      res.status(500).json({ error: "Failed to save formula" });
    }
  });

  app.delete("/api/formulas/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM formulas WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete formula" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
