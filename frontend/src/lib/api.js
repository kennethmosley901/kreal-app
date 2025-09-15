// server.js (or wherever you set up Express)
import cors from "cors";

const allowed = [
  "http://localhost:3000",
  "https://kreal-app-frontend.onrender.com", // <-- your actual frontend URL
];

app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowed.includes(origin)),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
