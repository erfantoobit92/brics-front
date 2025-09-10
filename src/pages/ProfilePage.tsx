import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Api_Get_Profile } from "../api";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";
import { NavLink } from "react-router-dom";

interface UserProfile {
  id: number;
  telegramId: number;
  username: string;
  firstName: string;
  balance: string;
  bricsBalance: number;
  walletAddress?: string;
  photoUrl?: string;
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
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const { i18n } = useTranslation();

  // چک می‌کنیم آیا زبانی قبلاً انتخاب شده یا نه
  const [showLanguageSelector, setShowLanguageSelector] = useState(
    !localStorage.getItem("userHasSelectedLanguage")
  );

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.dir(i18n.language);
  }, [i18n, i18n.language]);

  const handleLanguageSelected = () => {
    setShowLanguageSelector(false);
  };

  const changeLanguageOpen = () => {
    setShowLanguageSelector(true);
  };

  if (showLanguageSelector) {
    return <LanguageSelector onLanguageSelect={handleLanguageSelected} />;
  }

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

        <div className="flex justify-between items-center text-xl">
          <span className="text-gray-400">Wallet :</span>
          <span className="font-bold text-yellow-400">
            {profile.walletAddress ? "Connected" : "Not Connected"}
          </span>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={changeLanguageOpen}
          className="w-full bg-lime-500 my-4 hover:bg-lime-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
        >
          Change Language
        </button>

        <NavLink to="/change">
          <button className="w-full bg-orange-500 my-4 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
            Convert Page
          </button>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
        >
          Log Out
        </button>

        <p className="text-xs text-gray-500 text-center mt-2 pb-48">
          Logging out will clear your session. You'll need to restart the app
          from Telegram.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
