// export const Main_API_URL = "http://192.168.221.132:3000";
export const Main_API_URL = "http://127.0.0.1:3000";
// export const Main_API_URL = "https://api.mohammaditest.ir";
export const WEB_APP_URL = "https://jemjoo.erfuni.ir";

export const Telegram_Bot_Url = "t.me/Bricstrade_Bot/Brics_Trade";
export const Telegram_Bot_Username = "Bricstrade_Bot";

export function User_Referral_Link(telegramUserId: number): string {
  return `https://t.me/${Telegram_Bot_Username}?start=${telegramUserId}`;
}
