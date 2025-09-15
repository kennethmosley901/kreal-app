// frontend/src/lib/api.js
import axios from "axios";

const backend = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"; // no trailing slash

export const api = axios.create({
  baseURL: `${backend}/api`, // <-- this adds the /api prefix
  timeout: 20000,
});
