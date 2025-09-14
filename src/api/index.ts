import axios, { type AxiosResponse } from "axios";
import { Main_API_URL } from "../constants";
import type { MiningStatusData } from "../pages/MiningPage";

export const Axios_Api = axios.create({
  baseURL: Main_API_URL,
  headers: {
    "bypass-tunnel-reminder": "167.114.57.176",
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
    throw error;
  }
};

export const Api_Get_Profile = async () => {
  return (await Axios_Api.get("/user/profile")).data;
};

export const Api_FetchFriends = async () => {
  return (await Axios_Api.get("/user/referrals")).data;
};

export const Api_Get_Mining_Status = (): Promise<
  AxiosResponse<MiningStatusData>
> => {
  return Axios_Api.get("/mining/status");
};

export const Api_Claim_Rewards = (): Promise<
  AxiosResponse<{
    newBricsBalance: number;
    claimedAmount: number;
    newBalance: number;
  }>
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


export const Api_Get_Game_State = () => {
  return Axios_Api.get('/game/state');
};

export const Api_Post_Taps = (count: number) => {
  return Axios_Api.post('/game/tap', { count });
};


export interface BoostLevelData {
  id: number;
  level: number;
  cost: number;
  isCurrent: boolean;
  isUnlocked: boolean;
  canAfford: boolean;
}

// تابع برای گرفتن لیست بوست‌ها
export const Api_Get_Boosts = (): Promise<{ data: BoostLevelData[] }> => {
  return Axios_Api.get('/boosts');
};

// تابع برای درخواست آپگرید
export const Api_Upgrade_Boost = (): Promise<{
  data: {
    message: string;
    newBalance: number;
    newTapLevel: number;
  };
}> => {
  return Axios_Api.post('/boosts/upgrade');
};


export const SpinRewardType = {
  COIN: "coin",
  BRICS: "brics",
  EMPTY: "empty",
} as const;

export type SpinRewardType = (typeof SpinRewardType)[keyof typeof SpinRewardType];


export interface SpinWheelItem {
  id: number;
  label: string;
  type: SpinRewardType;
  value: number;
  weight: number;
  isActive: boolean;
}

// وضعیت گردونه رو از سرور می‌گیره
export const Api_Get_Spin_Status = (): Promise<{
  data: {
    canSpin: boolean;
    nextSpinAvailableAt: string | null; // تاریخ به صورت ISO string میاد
    items: SpinWheelItem[];
  };
}> => {
  return Axios_Api.get('/spin-wheel/status');
};

// درخواست چرخش گردونه رو به سرور می‌فرسته
export const Api_Post_Spin = (): Promise<{
  data: {
    success: true;
    wonPrize: SpinWheelItem;
    newBalance: number;
    newBricsBalance: number;
    newEnergy: number;
  };
}> => {
  return Axios_Api.post('/spin-wheel/spin');
};
