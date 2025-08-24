import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

import { Api_Get_Profile, Api_Login_With_Telegram } from "../api";
import type { User } from "@telegram-apps/sdk";
// import type { User, ShareStoryOptions, shareStory } from "@telegram-apps/sdk";
// import { useRawInitData, useLaunchParams } from "@telegram-apps/sdk-react";
// import type { AxiosError } from "axios";

interface AppContextType {
  token: string | null;
  isLoading: boolean;
  telegramUser: User | undefined;
  user: LoginUserInterface | null;
  setUser: React.Dispatch<React.SetStateAction<LoginUserInterface | null>>;
}

interface LoginUserInterface {
  firstName?: string;
  lastName?: string;
  username?: string;
  walletAddress?: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // const rawInitData = useRawInitData();
  const rawInitData =
    "query_id=AAH3JeEmAAAAAPcl4SZOZvJo&user=%7B%22id%22%3A652289527%2C%22first_name%22%3A%22Erfan%22%2C%22last_name%22%3A%22Hasan%20zade%22%2C%22username%22%3A%22Erfun_Hz%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F7tWn0s-hZyG0iTyg6GMpa5IEssrAOi1nqEyAi1VJe84.svg%22%7D&auth_date=1755707597&signature=D-h5eu3ZnYY4VgN6Liz4fBS3MYYFphwzAD0ydhTUaDvOqZiLlp4uhyrT9trlUsHM7IE13K5LXoXwoYW1P_bKBA&hash=6fc68f19a831070954a0b6a5e4c4671684063e2c1dc6ffd540d1484ba54b8ff1";
  const launchParams = { ref: undefined };
  // const launchParams = useLaunchParams();

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState<LoginUserInterface | null>(null);

  // 3. استفاده از آبجکت گلوبال برای کنترل WebApp (روشی پایدار و همیشگی)
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  // let isClearedLocalStorage = false;
  // Effect برای احراز هویت
  useEffect(() => {
    const authenticate = async () => {
      // if (!isClearedLocalStorage) {
      //   isClearedLocalStorage = true;
      //   localStorage.removeItem("token");
      // }

      const initDataString = rawInitData;
      // 2. پارامتر استارت رو از هوک دیگه می‌گیریم
      const startParamString = launchParams.ref;
      // حالا از initData که از هوک گرفتیم استفاده می‌کنیم
      if (initDataString) {
        if (!token) {
          try {
            const { access_token, user } = await Api_Login_With_Telegram(
              initDataString,
              startParamString as string | undefined
            );
            console.log("000000000", user);

            localStorage.setItem("token", access_token);
            setToken(access_token);
            setUser(user);
          } catch (error) {
            console.error("Failed to login", error);
          } finally {
            setIsLoading(false);
          }
        } else if (user == null) {
          console.log(user);
          
          const data = await Api_Get_Profile();
          setUser(data);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    if (rawInitData !== undefined) {
      authenticate();
    }
  }, [rawInitData, launchParams, token]);

  const telegramUser = {
    allows_write_to_pm: true,
    first_name: "Erfan",
    id: 652289527,
    last_name: "Hasan zade",
    language_code: "en",
    photo_url:
      "https://t.me/i/userpic/320/7tWn0s-hZyG0iTyg6GMpa5IEssrAOi1nqEyAi1VJe84.svg",
    username: "Erfun_ Hz",
  };

  // const telegramUser = launchParams.tgWebAppData?.user;
  const value = { token, isLoading, telegramUser, user, setUser };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
