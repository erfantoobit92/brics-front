import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { motion } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import FloatingText from "../components/FloatingText";
import { Main_API_URL } from "../constants";

interface FloatingTextData {
  id: number;
  text: string;
  x: number;
  y: number;
}

const TapPage = () => {
  const { token, telegramUser } = useAppContext();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Game state
  const [balance, setBalance] = useState<string>("0");
  const [energy, setEnergy] = useState<number>(1000);
  const [energyLimit, setEnergyLimit] = useState<number>(1000);

  const [floatingTexts, setFloatingTexts] = useState<FloatingTextData[]>([]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(Main_API_URL, {
      auth: { token },
    });
    setSocket(newSocket);

    newSocket.on("connect", () => console.log("WebSocket Connected!"));

    // --- تغییر اصلی اینجاست ---

    // 1. گوش دادن به پیام initial_state برای تنظیم وضعیت اولیه
    newSocket.on("initial_state", (data) => {
      console.log("Received initial state:", data);
      setBalance(data.balance);
      setEnergy(data.currentEnergy);
      setEnergyLimit(data.energyLimit);
    });

    // 2. گوش دادن به پیام update_state برای آپدیت‌های بعدی (بعد از تپ)
    newSocket.on("update_state", (data) => {
      if (data.success) {
        // فقط اگه تپ موفق بود آپدیت کن
        setBalance(data.balance);
        setEnergy(data.currentEnergy);
      }
      // می‌تونی برای data.success === false هم یه فیدبک به کاربر نشون بدی
    });

    return () => {
      newSocket.off("initial_state"); // موقع unmount کردن، listener رو پاک کن
      newSocket.off("update_state");
      newSocket.disconnect();
    };
  }, [token]);

  const handleTap = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (energy <= 0) return;

    socket?.emit("tap", { count: 1 });

    const { clientX, clientY } = event;
    const newText: FloatingTextData = {
      id: Date.now(),
      text: "+1",
      x: clientX,
      y: clientY,
    };
    setFloatingTexts((prev) => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newText.id));
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-between p-4 overflow-hidden">
      {floatingTexts.map((f) => (
        <FloatingText key={f.id} text={f.text} x={f.x} y={f.y} />
      ))}

      <div className="text-center pt-8">
        <span className="text-gray-400 text-lg">
          {telegramUser?.first_name || "Player"}
        </span>
        <h1 className="text-5xl font-bold">
          {Number(balance).toLocaleString()}
        </h1>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleTap}
          className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 focus:outline-none shadow-[0_0_40px_rgba(251,191,36,0.5)]"
        >
          <span
            className="text-5xl font-bold text-white"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            BRICS
          </span>
        </motion.button>
      </div>

      <div className="w-full max-w-md pb-4">
        <div className="flex justify-between text-lg font-bold mb-1">
          <span>⚡️ Energy</span>
          <span>
            {energy} / {energyLimit}
          </span>
        </div>
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${(energy / energyLimit) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TapPage;
