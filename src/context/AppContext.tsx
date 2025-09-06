import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

import { Api_Get_Profile, Api_Login_With_Telegram } from "../api";
import type { User, ShareStoryOptions, shareStory } from "@telegram-apps/sdk";
  import { useRawInitData, useLaunchParams } from "@telegram-apps/sdk-react";
import type { AxiosError } from "axios";

interface AppContextType {
  token: string | null;
  isLoading: boolean;
  telegramUser: User | undefined;
  user: LoginUserInterface | null;
  setUser: React.Dispatch<React.SetStateAction<LoginUserInterface | null>>;
}

interface LoginUserInterface {
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  walletAddress?: string;
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

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);


  useEffect(() => {
    const authenticate = async () => {
        // localStorage.clear();

      const initDataString = rawInitData;
      const startParamString = launchParams.ref;
      if (initDataString) {
        if (!token) {
          try {
            const { access_token, user } = await Api_Login_With_Telegram(
              initDataString,
              startParamString as string | undefined
            );
            localStorage.setItem("token", access_token);
            setToken(access_token);
            setUser(user);
          } catch (error) {
            alert(JSON.stringify(error))
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

  const telegramUser = launchParams.tgWebAppData?.user;
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
