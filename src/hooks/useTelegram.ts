import { useEffect, useState } from 'react';

// Define the types based on Telegram's documentation
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    // Add other properties you might need from initDataUnsafe
  };
  ready: () => void;
  onEvent: (eventType: any, eventHandler: any) => void;
  offEvent: (eventType: any, eventHandler: any) => void;
  close: () => void;
  // Add other methods you might need
}

export function useTelegram() {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    const telegram = (window as any).Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      telegram.expand(); // Make the web app full screen
      setTg(telegram);
    }
  }, []);

  const onClose = () => {
    tg?.close();
  };

  return {
    onClose,
    tg,
    user: tg?.initDataUnsafe?.user,
    initData: tg?.initData,
  };
}