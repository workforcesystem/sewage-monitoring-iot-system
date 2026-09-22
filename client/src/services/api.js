import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5050/api",
  baseURL: "/api",
  withCredentials: true,
});

export default api;
