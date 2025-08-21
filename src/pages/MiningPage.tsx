// MiningPage.tsx (نسخه اصلاح شده و بهینه)

import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import HardwareCard from "../components/HardwareCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { api } from "../api"; // API client
import { useVisibilityChange } from "@uidotdev/usehooks";

// اینترفیس‌ها با ساختار جدید و جامع API هماهنگ میشن
interface Hardware {
  id: number;
  userHardwareId: number;
  name: string;
  description: string;
  currentLevel: number;
  bricsPerHour: number;
  lastClaimTimestamp: string;
  storageHours: number;
  nextLevel: {
    level: number;
    bricsPerHour: number;
    costCoins: string;
    costBrics: number;
  } | null;
}

interface MiningState {
  isMiningActive: boolean;
  totalBricsPerHour: number;
  claimableBrics: number;
  miningStopTime: string | null;
  hardwares: Hardware[]; // سخت‌افزارها بخشی از state اصلی هستن
}

const MiningPage = () => {
  const { token } = useAppContext(); // setUser رو هم از context بگیر برای آپدیت بالانس
  const [state, setState] = useState<MiningState | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingId, setUpgradingId] = useState<number | null>(null);
  
  // این state فقط برای نمایش انیمیشن افزایش عدد هست
  const [displayClaimable, setDisplayClaimable] = useState(0);

  const isVisible = useVisibilityChange();

  // تابع برای گرفتن وضعیت از سرور
  const fetchState = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get<MiningState>("/mining/state", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setState(data);
      setDisplayClaimable(data.claimableBrics); // مقدار اولیه رو تنظیم کن
    } catch (error) {
      console.error("Failed to fetch mining state", error);
    }
  }, [token]);
  
  // 1. وقتی کاربر وارد صفحه میشه، ماینینگ رو استارت میزنه
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .post<MiningState>(
        "/mining/start",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setState(res.data);
        setDisplayClaimable(res.data.claimableBrics);
      })
      .catch(err => console.error("Failed to start mining", err))
      .finally(() => setLoading(false));
  }, [token]);

  // 2. تایمر برای ارسال Heartbeat و آپدیت UI (بهینه شده)
  useEffect(() => {
    if (!token || !state || !state.isMiningActive || !isVisible) return;

    // هر ۱۰ ثانیه heartbeat بفرست
    const heartbeatInterval = setInterval(() => {
      api.post("/mining/heartbeat", {}, { headers: { Authorization: `Bearer ${token}` } });
    }, 10000);

    // هر ۱ ثانیه فقط UI رو آپدیت کن (بدون درخواست به سرور)
    const uiInterval = setInterval(() => {
      const bricsPerSecond = state.totalBricsPerHour / 3600;
      setDisplayClaimable(prev => prev + bricsPerSecond);
    }, 1000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(uiInterval);
    };
  }, [token, state, isVisible]);
  
  // باگ اصلی اینجا بود. این useEffect به طور کامل حذف میشه
  // چون محاسبه سود فقط و فقط باید در بک‌اند انجام بشه.

  const handleClaim = async () => {
    if (!token) return;
    try {
      const { data: newState } = await api.post<MiningState>(
          "/mining/claim", 
          {}, 
          { headers: { Authorization: `Bearer ${token}` } }
      );
      // state رو با پاسخ جدیدی که از سرور اومده آپدیت کن
      setState(newState);
      setDisplayClaimable(newState.claimableBrics); // معمولا صفر میشه
      
      // TODO: موجودی کل Brics کاربر رو هم در context آپدیت کن
      console.log(`Claim successful!`);
    } catch (error) {
      console.error(`Error claiming brics: ${error}`);
      console.log("Failed to claim.");
    }
  };

  const handleUpgrade = async (userHardwareId: number) => {
    if (!token || upgradingId) return;

    setUpgradingId(userHardwareId);
    try {
      const { data: newState } = await api.post<MiningState>(
        "/mining/upgrade",
        { userHardwareId }, // Body رو بفرست
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // آپدیت کردن state با داده‌های جدیدی که از بک‌اند اومده
      setState(newState);
      
      // TODO: موجودی Coins و Brics کاربر رو هم در context آپدیت کن
      console.log("Upgrade successful!");
    } catch (error) {
      console.error(`Error upgrading hardware: ${error}`);
      console.log("Upgrade failed.");
    } finally {
      setUpgradingId(null);
    }
  };

  if (loading || !state) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 text-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">Mining Center</h1>
        <p className="text-gray-400">
          Upgrade your hardware to increase passive income.
          <br/>
          Total Brics/Hour: {state.totalBricsPerHour.toFixed(4)}
        </p>
      </div>

      <div className="bg-green-800/50 border border-green-500 p-4 rounded-lg text-center mb-6">
        <p className="text-lg">Claimable Profit:</p>
        <p className="text-2xl font-bold">
          +{displayClaimable.toFixed(6)} BRICS
        </p>
        <button
          onClick={handleClaim}
          className="mt-2 bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg disabled:bg-gray-500"
          disabled={displayClaimable < 0.000001} // دکمه رو غیرفعال کن وقتی چیزی برای برداشت نیست
        >
          Claim
        </button>
      </div>

      <div className="space-y-4">
        {state.hardwares.map((hw) => (
          <HardwareCard
            key={hw.userHardwareId} // از userHardwareId که یونیک هست استفاده کن
            hardware={hw}
            onUpgrade={handleUpgrade}
            isUpgrading={upgradingId === hw.userHardwareId}
          />
        ))}
      </div>
    </div>
  );
};

export default MiningPage;