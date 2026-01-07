import axios from "axios";

const api = axios.create({
  baseURL: "https://nullpoint-production.up.railway.app",
});

export default api;
