import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Api_Get_Profile } from "../api";

interface UserProfile {
  id: number;
  telegramId: number;
  username: string;
  firstName: string;
  balance: string; // چون bigint هست، معمولاً به صورت string میاد
  bricsBalance: number; // چون bigint هست، معمولاً به صورت string میاد
  photoUrl?: string; // photoUrl رو به اینترفیس اضافه کن
}

const ProfilePage = () => {
  const { token } = useAppContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await Api_Get_Profile();
        setProfile(data);
      } catch (error) {
        // اگر توکن نامعتبر بود، کاربر رو لاگ‌اوت کن
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    // توکن رو از حافظه پاک کن
    localStorage.removeItem("token");
    // صفحه رو ریلود کن تا AppContext وضعیت رو آپدیت کنه
    window.location.reload();
    // یا میتونی با استفاده از توابع context، وضعیت رو بدون ریلود تغییر بدی
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        Loading profile...
        <br />
        <br />
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
        >
          Log Out
        </button>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center p-8">Could not load profile.</div>;
  }

  return (
    <div className="p-4 text-white max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-yellow-400">
        Your Profile
      </h1>

      {/* --- بخش جدید برای نمایش عکس و اسم --- */}
      <div className="flex flex-col items-center mb-6">
        <img
          // اگر عکس وجود داشت نشون بده، وگرنه یک عکس پیش‌فرض بذار
          src={profile.photoUrl || "/images/default-profile.jpg"}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-yellow-400 object-cover"
        />
        <h2 className="text-2xl font-bold mt-3">{profile.firstName}</h2>
        <p className="text-gray-400">@{profile.username || "N/A"}</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        {/* اینجا دیگه نیازی به نمایش اسم و یوزرنیم نیست چون بالا نشون دادیم */}
        <div className="flex justify-between">
          <span className="text-gray-400">Telegram ID:</span>
          <span className="font-semibold">{profile.telegramId}</span>
        </div>
        <div className="flex justify-between items-center text-xl">
          <span className="text-gray-400">Coin Balance:</span>
          <span className="font-bold text-green-400">
            {Number(profile.balance).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-xl">
          <span className="text-gray-400">Brics Balance :</span>
          <span className="font-bold text-yellow-400">
            {Number(profile.bricsBalance).toLocaleString(undefined, {
              maximumFractionDigits: 6,
            })}
          </span>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
        >
          Log Out
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Logging out will clear your session. You'll need to restart the app
          from Telegram.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
