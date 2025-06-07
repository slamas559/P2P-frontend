import axios from "axios";

const api = axios.create({
  baseURL: "https://p2p-api.up.railway.app/api", // your backend URL
  // baseURL: "http://localhost:5000/api", // your backend URL
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Add token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;