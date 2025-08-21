import axios from "axios";
import { Main_API_URL } from "../constants";

export const Axios_Api = axios.create({
  baseURL: Main_API_URL,
});

export const Api_Login_With_Telegram = async (
  initData: string,
  startParam?: string | undefined
) => {
  try {
    // ما یک آبجکت به بک‌اند می‌فرستیم
    const response = await Axios_Api.post("/auth/login", { initData, startParam });
    return response.data.access_token;
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
};

export const Api_Get_Profile = async (token: string) => {
  try {
    const response = await Axios_Api.get("/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    throw error;
  }
};

export const Api_FetchFriends = async (token: string) => {
  try {
    const response = await Axios_Api.get("/user/referrals", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    throw error;
  }
};
