import axios from "axios";
import { Main_API_URL } from "../constants";

export const api = axios.create({
  baseURL: Main_API_URL,
  headers: {
    "bypass-tunnel-reminder": "104.232.37.84",
  },
});

export const APi_Send_Log = (
  level: "log" | "warn" | "error",
  message: string,
  data?: any
) => {
  // برای اینکه در محیط توسعه (مرورگر) هم لاگ رو ببینیم
  console[level](`[REMOTE] ${message}`, data);

  // ارسال به بک‌اند بدون انتظار برای پاسخ (fire-and-forget)
  api
    .post("/log", {
      level,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null, // برای جلوگیری از خطای ارسال آبجکت‌های چرخه‌ای
    })
    .catch((error) => {
      // اگر ارسال لاگ به خودی خود خطا داد، فقط در کنسول محلی نمایش بده
      console.error("Failed to send log to server:", error);
    });
};

export const loginWithTelegram = async (
  initData: string,
  startParam?: string | undefined
) => {
  try {
    // ما یک آبجکت به بک‌اند می‌فرستیم
    const response = await api.post("/auth/login", { initData, startParam });
    return response.data.access_token;
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
};

export const getProfile = async (token: string) => {
  try {
    const response = await api.get("/user/profile", {
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
    const response = await api.get("/user/referrals", {
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

export const getMiningState = async (token: string) => {
  try {
    const response = await api.get("/mining/state", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch mining state:", error);
    throw error;
  }
};

export const upgradeHardware = async (
  token: string,
  userHardwareId: number
) => {
  try {
    const response = await api.post(
      "/mining/upgrade",
      { userHardwareId }, // این body درخواسته
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data; // بک‌اند وضعیت جدید رو برمی‌گردونه
  } catch (error: any) {
    console.error("Failed to upgrade hardware:", error);
    // خطا رو به بیرون پاس میدیم تا در UI نمایش داده بشه
    throw error.response?.data?.message || "Upgrade failed";
  }
};

export const claimBrics = async (token: string) => {
  try {
    const response = await api.post(
      "/mining/claim",
      {},
      {
        // body خالی
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Claim failed";
  }
};

export const fetchMineState  = async (token: string) => {
  try {
    const response = await api.get(
      "/mining/state",
      {
        // body خالی
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Claim failed";
  }
};

export const Api_Start_Mine  = async (token: string) => {
  try {
    const response = await api.post(
      "/mining/start",
      {},
      {
        // body خالی
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Claim failed";
  }
};