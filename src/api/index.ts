import axios, { type AxiosResponse } from "axios";
import { Main_API_URL } from "../constants";
import type { MiningStatusData } from "../pages/MiningPage";

export const Axios_Api = axios.create({
  baseURL: Main_API_URL,
});

Axios_Api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log(token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
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

export const Api_Get_Profile = async () => {
  try {
    const response = await Axios_Api.get("/user/profile");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    throw error;
  }
};

export const Api_FetchFriends = async () => {
  try {
    const response = await Axios_Api.get("/user/referrals");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    throw error;
  }
};


export const Api_Get_Mining_Status = (): Promise<AxiosResponse<MiningStatusData>> => {
  return Axios_Api.get('/mining/status');
};

export const Api_Claim_Rewards = (): Promise<AxiosResponse<{ newBricsBalance: number; claimedAmount: number }>> => {
  return Axios_Api.post('/mining/claim');
};

export const Api_Upgrade_Hardware = (userHardwareId: number): Promise<AxiosResponse<MiningStatusData>> => {
  return Axios_Api.post(`/mining/upgrade/${userHardwareId}`);
};