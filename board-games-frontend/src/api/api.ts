import { BACKEND_URL } from "@/utils/constants";
import axios from "axios";

const USER_ROUTE = BACKEND_URL + "/api/user";

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

export const pingServer = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/ping`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
