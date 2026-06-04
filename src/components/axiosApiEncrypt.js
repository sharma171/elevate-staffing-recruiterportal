import axios from "axios";

const excludedRoutes = ["/login", "/resetpassword", "/employeelogin"];

const axiosApiSecure = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

axiosApiSecure.interceptors.request.use(
  (config) => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        const token = user?.token;
        if (token) {
          config.headers["Authorization-X"] = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.log("Failed to parse user token from localStorage", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosApiSecure.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const browserUrl = window.location.pathname;
      const isExcluded = excludedRoutes.some((route) => browserUrl.includes(route));

      if (!isExcluded && error?.response?.status === 401) {
        const hasReloaded = localStorage.getItem("reloaded");
        if (!hasReloaded) {
          localStorage.setItem("reloaded", "true");
          window.location.reload();
        } else {
          localStorage.removeItem("reloaded");
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/";
        }
      } else {
        localStorage.removeItem("reloaded");
      }
    } catch (e) {
      console.error("Error in response interceptor", e);
    }
    return Promise.reject(error);
  }
);

export default axiosApiSecure;
