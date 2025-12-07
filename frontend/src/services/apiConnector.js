import axios from "axios";

export const axiosInstance = axios.create({});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const storedToken = localStorage.getItem("token");
      let token = null;

      if (storedToken) {
        try {
          token = JSON.parse(storedToken);
        } catch (error) {
          token = storedToken;
        }
      }

      if (token && !config.headers?.Authorization) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // ignore parsing/localStorage errors
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
  });
};