import { api } from "<correct path to>/lib/api";
// frontend/src/lib/api.js
import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_URL || "https://kreal-app.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});
