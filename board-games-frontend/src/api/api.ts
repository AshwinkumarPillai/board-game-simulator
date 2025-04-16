import axios from "axios";

const API_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:5002";

const USER_ROUTE = API_BASE_URL + "/api/user";

export const loginUser = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${USER_ROUTE}/login`, { username, password });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const registerUser = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${USER_ROUTE}/register`, { username, password });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
