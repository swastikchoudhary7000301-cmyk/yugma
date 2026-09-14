import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log(
      "API REQUEST:",
      config.method?.toUpperCase(),
      config.url
    );

    console.log(
      "TOKEN:",
      token ? `${token.substring(0, 25)}...` : "NO TOKEN"
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(
      "API ERROR:",
      error.config?.url,
      error.response?.status,
      error.response?.data
    );

    /*
     * IMPORTANT:
     * Do NOT delete the token automatically while
     * we are debugging authentication.
     */
    return Promise.reject(error);
  }
);

export default api;