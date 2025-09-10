import axios, { type AxiosResponse } from "axios";
import { Main_API_URL } from "../constants";
import type { MiningStatusData } from "../pages/MiningPage";

export const Axios_Api = axios.create({
  baseURL: Main_API_URL,
  headers: {
    "bypass-tunnel-reminder": "194.146.93.248",
    "x-lt-auth": "194.146.93.248",
    // Accept: "*/*",
    // Connection: "keep-alive",
  },
});

Axios_Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.Accept = true;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const Api_Login_With_Telegram = async (data: any) => {
  try {
    // ما یک آبجکت به بک‌اند می‌فرستیم
    const response = await Axios_Api.post("/auth/login", data);
    return response.data;
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

export const Api_Get_Mining_Status = (): Promise<
  AxiosResponse<MiningStatusData>
> => {
  return Axios_Api.get("/mining/status");
};

export const Api_Claim_Rewards = (): Promise<
  AxiosResponse<{ newBricsBalance: number; claimedAmount: number }>
> => {
  return Axios_Api.post("/mining/claim");
};

export const Api_Upgrade_Hardware = (
  userHardwareId: number
): Promise<AxiosResponse<MiningStatusData>> => {
  return Axios_Api.post(`/mining/upgrade/${userHardwareId}`);
};

export const Api_Buy_Hardware = (hardwareId: number) => {
  // این تابع باید درخواست POST به endpoint جدید بفرسته
  return Axios_Api.post(`/mining/buy/${hardwareId}`);
};

export const ConversionDirection = {
  BALANCE_TO_BRICS: "BALANCE_TO_BRICS",
  BRICS_TO_BALANCE: "BRICS_TO_BALANCE",
} as const;

export type ConversionDirection =
  (typeof ConversionDirection)[keyof typeof ConversionDirection];

export const Api_Get_Exchange_Status = () => {
  return Axios_Api.get("/exchange/status");
};

export const Api_Convert_Currency = (
  amount: number,
  direction: ConversionDirection
) => {
  return Axios_Api.post("/exchange/convert", { amount, direction });
};

export const Api_Get_Tasks = () => {
  return Axios_Api.get("/tasks");
};

export const Api_Start_Task = (taskId: string) => {
  return Axios_Api.post(`/tasks/start/${taskId}`);
};

export const Api_Claim_Task_Reward = (taskId: string) => {
  return Axios_Api.post(`/tasks/claim/${taskId}`);
};

export const Api_Connect_User_Wallet = (walletAddress: string) => {
  return Axios_Api.post("/user/connect-wallet", { walletAddress });
};

export const Api_Complete_Post_Story_Task = () => {
  return Axios_Api.post("/tasks/complete/post-story");
};
