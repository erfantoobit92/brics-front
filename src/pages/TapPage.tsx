import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import FloatingText from "../components/FloatingText";
import { Main_API_URL } from "../constants";

// آیکون‌ها
import { FaRocket } from "react-icons/fa";
import { RiWifiFill } from "react-icons/ri";
import { FaBolt } from "react-icons/fa6";
import SpinButton from "../components/SpinButton";
import { useTranslation } from "react-i18next";

// آدرس عکس‌ها - اینا رو با آدرس عکس‌های خودت جایگزین کن
// import candyIcon from '../assets/images/candy.png'; // مثلا

interface FloatingTextData {
  id: number;
  text: string;
  x: number;
  y: number;
}

const TapPage = () => {
  const { t } = useTranslation();
  const { token, user } = useAppContext();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Game state
  const [balance, setBalance] = useState<string>("0");
  const [energy, setEnergy] = useState<number>(1000);
  const [energyLimit, setEnergyLimit] = useState<number>(1000);

  const [floatingTexts, setFloatingTexts] = useState<FloatingTextData[]>([]);

  // تمام منطق سوکت مثل قبل باقی میمونه
  useEffect(() => {
    if (!token) return;
    const newSocket = io(Main_API_URL, { auth: { token } });
    setSocket(newSocket);
    newSocket.on("connect", () => console.log("WebSocket Connected!"));
    newSocket.on("initial_state", (data) => {
      setBalance(data.balance);
      setEnergy(data.currentEnergy);
      setEnergyLimit(data.energyLimit);
    });
    newSocket.on("update_state", (data) => {
      if (data.success) {
        setBalance(data.balance);
        setEnergy(data.currentEnergy);
      }
    });
    return () => {
      newSocket.off("initial_state");
      newSocket.off("update_state");
      newSocket.disconnect();
    };
  }, [token]);

  const handleTap = (event: React.MouseEvent<HTMLDivElement>) => {
    if (energy <= 0) return;
    socket?.emit("tap", { count: 1 });

    const { clientX, clientY } = event;
    const newText: FloatingTextData = {
      id: Date.now() + Math.random(), // Math.random برای جلوگیری از آی‌دی تکراری در کلیک‌های سریع
      text: "+1",
      x: clientX,
      y: clientY,
    };
    setFloatingTexts((prev) => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newText.id));
    }, 1500);
  };

  const energyPercentage = (energy / energyLimit) * 100;

  const handleSpinClick = () => {
    console.log("Spin button clicked!");
    // اینجا منطق مربوط به گردونه شانس رو پیاده‌سازی کنید
    // مثلا باز شدن یک مودال یا رفتن به صفحه‌ی گردونه
  };

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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-lime-500 text-black font-bold py-2 px-4 rounded-full shadow-lg shadow-green-500/50"
        >
          <FaRocket />
          {t('boost')}
        </motion.button>
      </header>

      {/* بخش اصلی: امتیاز و گربه */}
      <main className="flex-grow flex flex-col items-center justify-center pt-4 gap-5 z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/images/coin.png" alt="Candy" className="w-12 h-12" />
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
              <span className="font-bold text-sm">{t('level')} 6 / 100</span>
              <div className="w-24 bg-black/30 h-2 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-purple-500 w-1/4 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TapPage;
