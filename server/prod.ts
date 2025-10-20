import express from "express";
import cors from "cors";
import { createServer } from "./index.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create the main server with all routes
const app = createServer();

// CORS configuration for production
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://darul-umah-frontend.onrender.com",
  credentials: true,
}));

// Serve static files from the built frontend
const staticPath = join(__dirname, "../dist/spa");
app.use(express.static(staticPath));

// Serve the React app for all non-API routes
// Use a more specific pattern to avoid path-to-regexp issues
app.get("/*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  
  res.sendFile(join(staticPath, "index.html"));
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${staticPath}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "https://darul-umah-frontend.onrender.com"}`);
});
