import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { Api_Login_With_Telegram } from "../api";
import type { User } from "@telegram-apps/sdk";
import { useRawInitData, useLaunchParams } from "@telegram-apps/sdk-react";

interface AppContextType {
  token: string | null;
  errorText: string | null;
  isLoading: boolean;
  telegramUser: User | undefined;
  user: LoginUserInterface | null;
  setUser: React.Dispatch<React.SetStateAction<LoginUserInterface | null>>;
}

interface LoginUserInterface {
  id: number;
  telegramId: string;
  firstName?: string;
  username?: string;
  lastName?: string;
  photoUrl?: string;
  walletAddress: string | null;
  balance?: number;
  bricsBalance?: number;
  tapLevel?: number;
  energyLimit?: number;
  currentEnergy?: number;
  lastEnergyRefill?: string;
  createdAt: string;
  referrerId: number | null;
  isPremium: boolean;
  unclaimedMiningReward?: number;
  lastMiningInteraction?: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const rawInitData = useRawInitData();
  const launchParams = useLaunchParams();

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState<LoginUserInterface | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const didLoginCall = useRef(false);
  useEffect(() => {
    const authenticate = async () => {
      // localStorage.clear();
      const initDataString = rawInitData;
      const startParamString = launchParams.ref;
      if (initDataString) {
        // if (!token) {
        if (didLoginCall.current) return;
        didLoginCall.current = true;
        try {
          const { access_token, user } = await Api_Login_With_Telegram({
            initData: initDataString,
            startParam: startParamString as string | undefined,
            isPremium: launchParams.tgWebAppData?.user?.is_premium ?? false,
          });
          localStorage.setItem("token", access_token);
          setToken(access_token);
          setUser(user);
        } catch (error) {
          setErrorText(`Failed to login : ${error}`);
        } finally {
          setIsLoading(false);
        }
        // } else if (user == null) {
        //   try {
        //     const data = await Api_Get_Profile();
        //     setUser(data);
        //   } catch (error) {
        //     setErrorText(`Failed to Get User Profile : ${error}`);
        //   } finally {
        //     setIsLoading(false);
        //   }
        // }
      } else {
        setIsLoading(false);
      }
    };

    if (rawInitData !== undefined) {
      authenticate();
    }
  }, [rawInitData, launchParams, token]);

  const telegramUser = launchParams.tgWebAppData?.user;
  const value = { token, isLoading, telegramUser, user, setUser, errorText };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
