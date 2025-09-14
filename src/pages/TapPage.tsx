import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import FloatingText from "../components/FloatingText";
import { Api_Get_Game_State, Api_Post_Taps } from "../api";

import { FaRocket } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { FaBolt } from "react-icons/fa6";
import SpinButton from "../components/SpinButton";
import { useTranslation } from "react-i18next";
import TapPageSkeleton from "../components/TapPageSkeleton";
import BoostModal from "../components/boost-tap-level/BoostModal";
import { MAX_Tap_Level } from "../constants";

interface FloatingTextData {
  id: number;
  text: string;
  x: number;
  y: number;
}

const TapPage = () => {
  const { t } = useTranslation();
  const { token, user } = useAppContext();

  const [balance, setBalance] = useState<string>("0");
  const [tapLevel, setTapLevel] = useState<number>(1);
  const [energy, setEnergy] = useState<number>(1000);
  const [energyLimit, setEnergyLimit] = useState<number>(1000);
  const [isLoading, setIsLoading] = useState(true); // برای نمایش لودینگ اولیه

  const [floatingTexts, setFloatingTexts] = useState<FloatingTextData[]>([]);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false); // <-- state جدید برای مودال

  const tapsQueue = useRef<number>(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null); // <--- CHANGE: تایمر دیبانس

  const sendTapsToServer = useCallback(async () => {
    if (tapsQueue.current === 0) return;

    try {
      const tapsToSend = tapsQueue.current;
      tapsQueue.current = 0;

      const { data } = await Api_Post_Taps(tapsToSend);

      if (data.success) {
        setBalance(data.balance);
        setEnergy(data.currentEnergy);
      } else {
        console.warn("Taps rejected by server:", data.message);
        fetchInitialState();
        // const { data: freshData } = await Api_Get_Game_State();
        // setBalance(freshData.balance);
        // setEnergy(freshData.currentEnergy);
        // setEnergyLimit(freshData.energyLimit);
      }
    } catch (error) {
      console.error("Failed to sync taps:", error);
    }
  }, []);

  const fetchInitialState = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await Api_Get_Game_State();
      setBalance(data.balance);
      setEnergy(data.currentEnergy);
      setEnergyLimit(data.energyLimit);
      setTapLevel(data.tapLevel);
    } catch (error) {
      console.error("Failed to fetch initial state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    fetchInitialState();

    // cleanup function: وقتی کاربر از صفحه خارج میشه
    return () => {
      // تایمر دیبانس رو پاک می‌کنیم
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      // هر تپی که در صف مونده رو قبل از خروج ارسال می‌کنیم
      sendTapsToServer();
    };
  }, [token, fetchInitialState, sendTapsToServer]);

  const handleCloseBoostModal = (didUpgrade: boolean = false) => {
    setIsBoostModalOpen(false);
    // اگر آپگریدی انجام شده بود، اطلاعات کاربر رو دوباره بگیر تا بالانس جدید نمایش داده بشه
    if (didUpgrade) {
      fetchInitialState();
    }
  };

  const handleTap = (event: React.MouseEvent<HTMLDivElement>) => {
    if (energy < tapLevel) return; // <--- FIX: شرط انرژی رو درست کردم
    setEnergy((prev) => prev - tapLevel);
    setBalance((prev) => (Number(prev) + tapLevel).toString());

    tapsQueue.current += 1;

    const { clientX, clientY } = event;
    const newText: FloatingTextData = {
      id: Date.now() + Math.random(),
      text: `+${tapLevel}`,
      x: clientX,
      y: clientY,
    };
    setFloatingTexts((prev) => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newText.id));
    }, 1500);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    // یه تایمر جدید تنظیم کن که ۲ ثانیه دیگه تابع sendTapsToServer رو اجرا کنه
    debounceTimer.current = setTimeout(() => {
      sendTapsToServer();
    }, 2000);
  };

  const energyPercentage = (energy / energyLimit) * 100;

  const handleSpinClick = () => {
    console.log("Spin button clicked!");
  };

  if (isLoading) {
    return <TapPageSkeleton />;
  }

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between items-center text-white overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url('/images/bg.png')` }}
    >
      {/* Container برای متن‌های شناور */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <AnimatePresence>
          {floatingTexts.map((f) => (
            <FloatingText key={f.id} text={f.text} x={f.x} y={f.y} />
          ))}
        </AnimatePresence>
      </div>

      {/* بخش هدر: پروفایل و دکمه Boost */}
      <header className="w-full flex justify-between items-center p-4 z-10">
        <NavLink to="/profile">
          <motion.button
            onClick={() => {}}
            whileTap={{ scale: 0.95 }}
            className="text-center flex flex-col items-center"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-800 rounded-full flex items-center justify-center">
                {user != null && (
                  <img
                    // اگر عکس وجود داشت نشون بده، وگرنه یک عکس پیش‌فرض بذار
                    src={user.photoUrl || "/images/default-profile.jpg"}
                    alt={t("profile")}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
              </div>
              {user != null && (
                <span className="font-bold text-lg">{user.firstName}</span>
              )}
            </div>
          </motion.button>
        </NavLink>
        <motion.button
          onClick={() => setIsBoostModalOpen(true)} // <-- مودال رو باز میکنه
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-lime-500 text-black font-bold py-2 px-4 rounded-full shadow-lg shadow-green-500/50"
        >
          <FaRocket />
          {t("boost")}
        </motion.button>
      </header>

      {/* بخش اصلی: امتیاز و گربه */}
      <main className="flex-grow flex flex-col items-center justify-center pt-4 gap-5 z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/images/coin-gold.png" alt="Candy" className="w-12 h-12" />
          <span
            className="text-5xl font-extrabold tracking-tight"
            style={{ textShadow: "0px 4px 15px rgba(255, 255, 255, 0.3)" }}
          >
            {Number(balance).toLocaleString()}
          </span>
        </div>

        <motion.div
          onClick={handleTap}
          whileTap={{
            scale: 0.92,
            transition: { type: "spring", stiffness: 400, damping: 15 },
          }}
          className="relative cursor-pointer select-none"
        >
          <img
            src="/images/coin.png"
            alt="Cat Character"
            className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
            draggable="false"
          />
        </motion.div>
      </main>

      {/* بخش پایینی: اطلاعات بازی */}
      <footer className="w-full flex flex-col items-center p-4 pb-20 z-10">
        <div className="w-full max-w-sm">
          {/* نوار انرژی */}
          <div className="flex justify-center items-center gap-2 mb-3 text-lg">
            <FaBolt className="text-yellow-400" size={24} />
            <span className="font-bold">{energy}</span>
            <span className="text-gray-400">/ {energyLimit}</span>
          </div>
          <div className="w-full bg-black/30 h-4 rounded-full backdrop-blur-sm border border-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${energyPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          {/* بخش AirDrop و Level */}
          <div className="flex justify-between items-center mt-4 mb-8">
            <div className="text-center">
              <SpinButton onClick={handleSpinClick} />
            </div>
            <div className="text-center">
              <span className="font-bold text-sm">
                {t("level")} {tapLevel} / {MAX_Tap_Level}
              </span>
              <div className="w-24 bg-black/30 h-2 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-purple-500 w-1/4 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <BoostModal isOpen={isBoostModalOpen} onClose={handleCloseBoostModal} />
    </div>
  );
};

export default TapPage;
