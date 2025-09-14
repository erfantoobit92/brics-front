// src/components/spin-wheel/SpinWheelModal.tsx

import React, { useState, useEffect, Fragment, useRef } from "react"; // useRef رو اضافه کن
import { Dialog, Transition } from "@headlessui/react";
import {
  Api_Get_Spin_Status,
  Api_Post_Spin,
  type SpinWheelItem,
  SpinRewardType,
} from "../../api";
import CountdownTimer from "./CountdownTimer";
import Confetti from "react-confetti";
import { FaGift, FaTimes } from "react-icons/fa";
import "./SpinWheel.css"; // فایل CSS برای استایل گردونه
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: (didSpin?: boolean) => void;
}

const SpinWheelModal: React.FC<SpinWheelModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<{
    canSpin: boolean;
    nextSpinAvailableAt: string | null;
    items: SpinWheelItem[];
  } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<SpinWheelItem | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isWaitingForApi, setIsWaitingForApi] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
    try {
      const { data } = await Api_Get_Spin_Status();
      // مطمئن میشیم همیشه ۸ آیتم داریم، حتی اگه از بک‌اند کمتر بیاد (برای نمایش)
      while (data.items.length < 8) {
        data.items.push({
          id: -1,
          label: t("spinWheel.prizes.tryAgain"),
          type: "empty",
        } as any);
      }
      data.items = data.items.sort(() => Math.random() - 0.5);

      setStatus(data);
    } catch (error) {
      console.error("Failed to get spin status:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // ریست کردن استایل گردونه وقتی مودال باز میشه
      if (wheelRef.current) {
        wheelRef.current.style.transition = "none";
        wheelRef.current.style.transform = "rotate(0deg)";
      }
      fetchStatus();
      setWonPrize(null);
      setShowConfetti(false);
    }
  }, [isOpen]);

  const handleSpin = async () => {
    if (!status?.canSpin || isSpinning || isWaitingForApi) return;

    setIsSpinning(true);
    setIsWaitingForApi(true);

    // 1. ریست کردن انیمیشن قبلی و شروع چرخش سریع
    if (wheelRef.current) {
      wheelRef.current.style.transition = "none"; // حذف هرگونه transition قبلی
      // یک زاویه اولیه تصادفی برای شروع بچرخونیم تا هر بار از یه جا شروع نشه
      const initialRandomRotation = Math.random() * 360;
      wheelRef.current.style.transform = `rotate(${initialRandomRotation}deg)`;

      // یک flush کوچیک برای اطمینان از اعمال تغییرات قبل از اضافه کردن انیمیشن
      // این یه تکنیک برای force کردن browser به re-paint هست
      wheelRef.current.offsetHeight;

      // حالا انیمیشن چرخش سریع و نامحدود رو اضافه می‌کنیم
      wheelRef.current.classList.add("spinning");
    }

    try {
      // 2. همزمان درخواست API رو می‌فرستیم
      const { data } = await Api_Post_Spin();
      const prize = data.wonPrize;
      // پیدا کردن ایندکس جایزه. اگه پیدا نشد (مثلا آیتم پوچ بود)، یه ایندکس تصادفی انتخاب می‌کنیم
      let prizeIndex = status!.items.findIndex((item) => item.id === prize.id);
      if (prizeIndex === -1) {
        prizeIndex = Math.floor(Math.random() * status!.items.length);
      }

      setIsWaitingForApi(false); // جواب API رسید

      if (wheelRef.current) {
        // 3. محاسبه زاویه نهایی برای توقف
        const totalItems = status!.items.length;
        const anglePerItem = 360 / totalItems;
        // زاویه دقیق مرکز آیتم برنده شده
        const targetAngle = prizeIndex * anglePerItem + anglePerItem / 2;

        // می‌خوایم گردونه چند دور کامل بچرخه و بعد روی زاویه هدف متوقف بشه
        // عدد ۶ یعنی ۶ دور کامل بچرخه. می‌تونی کم و زیادش کنی
        const fullRotations = 6 * 360;

        // زاویه نهایی = چرخش‌های کامل - زاویه هدف (چون گردونه ساعت‌گرد می‌چرخه)
        // ما می‌خوایم نشانگر روی زاویه هدف قرار بگیره، پس گردونه باید به اندازه منفی اون زاویه بچرخه
        const finalRotation = fullRotations - targetAngle + 67;

        // 4. اعمال انیمیشن توقف نرم
        wheelRef.current.classList.remove("spinning"); // حذف انیمیشن چرخش سریع

        // دوباره یه flush کوچیک برای اطمینان
        wheelRef.current.offsetHeight;

        // حالا transition نهایی رو با زاویه دقیق اعمال می‌کنیم
        wheelRef.current.style.transition =
          "transform 6s cubic-bezier(0.1, 0.5, 0.2, 1)";
        wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;

        // 5. نمایش نتیجه بعد از اتمام انیمیشن توقف
        setTimeout(() => {
          setIsSpinning(false);
          setWonPrize(prize);
          if (prize.type !== SpinRewardType.EMPTY) {
            setShowConfetti(true);
          }
          fetchStatus();
        }, 6100); // زمان باید کمی بیشتر از transition باشه
      }
    } catch (error) {
      console.error("Spin failed:", error);
      // ... هندل کردن خطا مثل قبل ...
      if (wheelRef.current) {
        wheelRef.current.classList.remove("spinning");
      }
      setIsSpinning(false);
      setIsWaitingForApi(false);
    }
  };

  const handleClose = () => {
    onClose(!!wonPrize); // اگه جایزه‌ای برده بود، true پاس میدیم
  };

  const getPrizeDisplay = (prize: SpinWheelItem) => {
    if (prize.type === "coin")
      return t("spinWheel.prizes.coins", {
        count: prize.value.toLocaleString() as any,
      });
    if (prize.type === "brics")
      return t("spinWheel.prizes.brics", { count: prize.value });
    return t("spinWheel.prizes.betterLuck");
  };

  const getItemContent = (item: SpinWheelItem) => {
    let value = t("spinWheel.empty");
    let icon = "/images/spin-empty.png"; // آیکون پیشفرض پوچ

    switch (item.type) {
      case SpinRewardType.COIN:
        value = item.value.toLocaleString();
        icon = "/images/coin-gold.png";
        break;
      case SpinRewardType.BRICS:
        value = item.value.toString();
        icon = "/images/coin.png";
        break;
    }
    return { value, icon };
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 " onClose={handleClose}>
        {/* ... Backdrop ... */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-lg" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              onConfettiComplete={() => setShowConfetti(false)}
            />
          )}
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white/80 p-6 text-left align-middle shadow-2xl transition-all text-gray-800">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white transition-colors text-3xl font-extrabold text-red-400"
                >
                  <FaTimes />
                </button>
                <Dialog.Title
                  as="h3"
                  className="text-3xl font-extrabold text-center text-gray-900 mb-2"
                >
                  {t("spinWheel.title")}
                </Dialog.Title>
                <p className="text-center text-gray-500 mb-6">
                  {t("spinWheel.subtitle")}
                </p>

                <div
                  className={`relative my-8 flex items-center justify-center ${
                    status && !status.canSpin && "opacity-[.48]"
                  }`}
                >
                  <div className="wheel-container ltr-direction mt-3">
                    <div className="spin-marker"></div>
                    <div id="wheel" className="wheel" ref={wheelRef}>
                      {status?.items.map((item, index) => {
                        const { value, icon } = getItemContent(item);
                        return (
                          <div
                            key={item.id + "-" + index}
                            className="wheel-section"
                            style={
                              {
                                "--i": index,
                                "--total": status.items.length,
                                // background:
                                //   index % 2 === 0 ? "orange" : "white",
                              } as React.CSSProperties
                            }
                          >
                            <div className="wheel-item-content">
                              <span className="wheel-item-value mt-4">
                                {value}
                              </span>
                              <img
                                src={icon}
                                alt={item.type}
                                className="wheel-item-icon"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* مرکز گردونه */}
                    <div className="wheel-center"></div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center justify-center h-28">
                  {!status ? (
                    <div className="text-gray-400">
                      {t("spinWheel.loading")}
                    </div>
                  ) : wonPrize ? (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      {wonPrize.type != SpinRewardType.EMPTY && (
                        <p className="text-lg text-gray-500">
                          {t("spinWheel.youWon")}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-orange-500 mt-1 flex items-center gap-2">
                        <FaGift /> {getPrizeDisplay(wonPrize)}
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClose}
                        className="spin-button mt-2"
                      >
                        <span className="text">{t("spinWheel.close")}</span>
                      </motion.button>
                    </motion.div>
                  ) : status.canSpin ? (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSpin}
                      disabled={isSpinning}
                      className="spin-button"
                    >
                      <span className="sparkle"></span>
                      <span className="sparkle"></span>
                      {isWaitingForApi
                        ? t("spinWheel.spinningButton")
                        : t("spinWheel.spinButton")}{" "}
                    </motion.button>
                  ) : (
                    <div className="text-center">
                      <p className="text-lg text-gray-500 mb-2">
                        {t("spinWheel.nextSpinIn")}
                      </p>
                      {status.nextSpinAvailableAt && (
                        <CountdownTimer
                          targetDate={status.nextSpinAvailableAt}
                          onComplete={fetchStatus}
                        />
                      )}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SpinWheelModal;
