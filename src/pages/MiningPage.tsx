import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBolt, FaSpinner } from "react-icons/fa";

import {
  Api_Claim_Rewards,
  Api_Get_Mining_Status,
  Api_Upgrade_Hardware,
  Api_Buy_Hardware,
} from "../api";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ClipLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";

interface CombinedHardware {
  id: number | null;
  hardwareId: number;
  name: any;
  level: number;
  isOwned: boolean;
  currentMiningRatePerHour: number;
  nextLevelUpgradeCost?: number | null;
  buyCost?: number | null;
  isMaxLevel: boolean;
}
export interface MiningStatusData {
  unclaimedMiningReward: number;
  totalMiningRatePerHour: number;
  hardwares: CombinedHardware[];
  balance: number;
  bricsBalance: number;
}

// ===================================================================
// =================  HARDWARE CARD (بازطراحی شده)  ==================
// ===================================================================
interface HardwareCardProps {
  t: TFunction<"translation", undefined>;
  hardware: CombinedHardware;
  onUpgrade: (userHardwareId: number) => Promise<void>;
  onBuy: (hardwareId: number) => Promise<void>;
  upgradingId: number | null;
  buyingId: number | null;
  image: string; // <<-- پراپرتی جدید برای عکس
}

const HardwareCard: React.FC<HardwareCardProps> = ({
  t,
  hardware,
  onUpgrade,
  onBuy,
  upgradingId,
  buyingId,
  image,
}) => {
  const { i18n } = useTranslation();

  const isUpgrading = upgradingId === hardware.hardwareId;
  const isBuying = buyingId === hardware.hardwareId;
  const isLoading = isUpgrading || isBuying;

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 20 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      className="relative bg-white/25 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center text-white shadow-lg"
    >
      {/* {!hardware.isOwned && (
        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
          <FaLock size={32} className="text-gray-400" />
        </div>
      )} */}

      {/* عکس سخت‌افزار */}
      <img
        src={image}
        alt={hardware.name[i18n.language]}
        className="w-24 h-24 object-contain mb-2"
      />

      <h3 className="font-bold text-md">{hardware.name[i18n.language]}</h3>
      <p className="text-xs text-gray-400 mb-2">
        {hardware.isOwned
          ? `${t("level")} ${hardware.level} | ${t("speed")} ${Number(
              hardware.currentMiningRatePerHour ?? 0
            ).toLocaleString(undefined, {
              maximumFractionDigits: 6,
            })}`
          : t("buy")}
      </p>

      {/* نرخ ماینینگ */}
      {/* <div className="flex items-center gap-1 text-sm text-cyan-300 mb-3">
        <FaBolt />
        <span>Profit per hour</span>
        <span className="font-bold">
          +{hardware.currentMiningRatePerHour.toFixed(2)}
        </span>
      </div> */}

      {/* دکمه آپگرید یا خرید */}
      {hardware.isOwned ? (
        <motion.button
          onClick={() =>
            hardware.hardwareId &&
            upgradingId == null &&
            buyingId == null &&
            onUpgrade(hardware.hardwareId)
          }
          disabled={
            hardware.isMaxLevel || upgradingId != null || buyingId != null
          }
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="!mt-auto w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-500/30 py-3"
        >
          {isLoading ? (
            <FaSpinner className="animate-spin" />
          ) : hardware.isMaxLevel ? (
            t("max")
          ) : (
            <>
              <img src="/images/coin.png" alt="cost" className="w-4 h-4" />
              <span className="text-sm">
                {hardware.nextLevelUpgradeCost?.toLocaleString()}
              </span>
              <span className="text-[8px]">{t("upgrade")}</span>
            </>
          )}
        </motion.button>
      ) : (
        <motion.button
          onClick={() =>
            upgradingId == null &&
            buyingId == null &&
            onBuy(hardware.hardwareId)
          }
          disabled={
            upgradingId != null || buyingId != null || hardware.buyCost === null
          }
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="!mt-auto w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-500/30"
        >
          {isLoading ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <>
              <img src="/images/coin.png" alt="cost" className="w-4 h-4" />
              <span>{hardware.buyCost?.toLocaleString()}</span>
              <span className="text-[8px]">{t("buy")}</span>
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
};

const MiningPage: React.FC = () => {
  const [data, setData] = useState<MiningStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [upgradingId, setUpgradingId] = useState<number | null>(null);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const { t } = useTranslation();

  const fetchData = useCallback(async () => {
    try {
      const response = await Api_Get_Mining_Status();
      setData(response.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || t("failed_to_fetch_mining_data"));
    } finally {
      setLoading(false);
    }
  }, []);

  const didFetchInitData = useRef(false);
  useEffect(() => {
    if (didFetchInitData.current) return;
    didFetchInitData.current = true;
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!data || data.totalMiningRatePerHour <= 0) return;
    const intervalId = setInterval(() => {
      const rewardPerSecond = data.totalMiningRatePerHour / 3600;
      setData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          unclaimedMiningReward:
            prevData.unclaimedMiningReward + rewardPerSecond,
        };
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [data?.totalMiningRatePerHour]);

  const handleUpgrade = async (userHardwareId: number): Promise<void> => {
    let findedHardware = data?.hardwares.find(
      (m) => m.hardwareId == userHardwareId
    );
    if (
      (data?.balance ?? 0) != 0 &&
      findedHardware?.nextLevelUpgradeCost != null &&
      data!.balance < findedHardware?.nextLevelUpgradeCost
    ) {
      console.log(t(`You_dont_have_enough_coins`));

      toast.error(t(`You_dont_have_enough_coins`));

      return;
    }
    setUpgradingId(userHardwareId);
    try {
      await Api_Upgrade_Hardware(userHardwareId);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || t("upgrade_failed"));
    } finally {
      setUpgradingId(null);
    }
  };

  const handleClaim = async (): Promise<void> => {
    setIsClaiming(true);
    try {
      const result = await Api_Claim_Rewards();
      toast.success(
        t(`mining_reward`, {
          amount: Number(result.data.claimedAmount).toLocaleString(undefined, {
            maximumFractionDigits: 6,
          }),
        })
      );

      setData((prev) => {
        if (!prev) return prev; // یا می‌تونی یه مقدار اولیه درست برگردونی

        return {
          ...prev,
          bricsBalance: result.data.newBricsBalance,
          balance: result.data.newBalance,
          unclaimedMiningReward: 0,
        };
      });
      // setData({...data ,...{bricsBalance:newBricsBalance,balance:newBalance}})
      // await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || t("claim_failed"));
    } finally {
      setIsClaiming(false);
    }
  };

  const handleBuy = async (hardwareId: number): Promise<void> => {
    setBuyingId(hardwareId);
    try {
      await Api_Buy_Hardware(hardwareId);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || t("buy_failed"));
    } finally {
      setBuyingId(null);
    }
  };

  const [activeTab, setActiveTab] = useState("mine");

  const hardwareImages: { [key: number]: string } = {
    1: "/images/character.png", // hardwareId: 1
    2: "/images/character.png", // hardwareId: 2
    3: "/images/character.png", // hardwareId: 3
    // ... بقیه رو اضافه کن
  };

  if (loading) {
    return (
      <motion.div
        style={{ backgroundImage: `url('/images/bg.png')` }}
        className="w-full h-full flex flex-col p-4 text-white overflow-hidden bg-cover bg-center"
      >
        {loading && (
          <div className="flex justify-center items-center h-full">
            <ClipLoader color="#EAB308" size={50} />
          </div>
        )}
      </motion.div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-red-500">
        {error || t("no_data_available")}
      </div>
    );
  }

  const unlockedHardwares = data.hardwares.filter(
    (hw) => hw.isOwned && hw.hardwareId != 1
  );
  const lockedHardwares = data.hardwares.filter(
    (hw) => !hw.isOwned && hw.hardwareId != 1
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ backgroundImage: `url('/images/bg.png')` }}
      className="w-full h-full bg-cover bg-center text-white overflow-hidden"
    >
      <Toaster position="top-center" />

      <div className="flex flex-col p-4 !overflow-y-auto scroll-hidden h-[calc(100%-110px)]">
        {/* ========== هدر: امتیازات و دکمه Claim ========== */}
        <header className="flex-shrink-0">
          <div className="flex justify-center items-center gap-2">
            <img src="/images/coin.png" alt="Unclaimed" className="w-8 h-8" />
            <div className="text-center">
              <span className="text-3xl font-bold tracking-wider">
                {data.unclaimedMiningReward.toFixed(6)}
              </span>
              <p className="text-xs text-gray-400">
                {t("brics_balance")}: {data.bricsBalance.toFixed(6)}
              </p>
            </div>
          </div>
          <motion.button
            onClick={handleClaim}
            disabled={data.unclaimedMiningReward < 0.000001 || isClaiming}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-3 bg-gradient-to-r from-green-400 to-lime-500 text-black font-bold py-3 rounded-full shadow-lg shadow-green-500/50 disabled:opacity-60 flex items-center justify-center"
          >
            {isClaiming ? (
              <FaSpinner className="animate-spin" />
            ) : (
              t("claim_rewards")
            )}
          </motion.button>
        </header>

        {/* ========== تب‌ها: Mining Rigs ========== */}
        <div className="flex-shrink-0 my-4">
          <div className="flex p-2 px-1 bg-white/25 backdrop-blur-md rounded-xl w-full max-w-sm mx-auto h-18">
            {["mine", "upgrade", "buy"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab ? "" : "hover:bg-white/10"
                } flex-1 text-md font-bold p-2 rounded-xl relative transition mx-1`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-pill-mining"
                    className="absolute inset-0 bg-white/20 backdrop-blur-md !rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t(tab)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ========== محتوای تب‌ها ========== */}
        <main className="flex-grow ">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "mine" && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <motion.img
                    src="/images/coin.png"
                    alt="Mining..."
                    className="w-48 h-48"
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <div className="mt-4 p-4 bg-black/20 rounded-lg w-full max-w-xs">
                    <p className="text-gray-400 text-sm">
                      {t("total_rate_per_hour")}
                    </p>
                    <p className="text-2xl font-bold text-cyan-300 flex items-center justify-center gap-2">
                      <FaBolt /> {data.totalMiningRatePerHour.toFixed(6)}
                    </p>
                  </div>
                  <div className="mt-2 p-4 bg-black/20 rounded-lg w-full max-w-xs">
                    <p className="text-gray-400 text-sm">{t("coin_balance")}</p>
                    <p className="text-2xl font-bold text-yellow-300 flex items-center justify-center gap-2">
                      <img
                        src="/images/coin-gold.png"
                        alt="reward"
                        className="w-4 h-4"
                      />{" "}
                      {Math.floor(data.balance).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {(activeTab === "upgrade" || activeTab === "buy") && (
                <motion.div
                  className="grid grid-cols-2 gap-4 pb-4"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } },
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  {(activeTab === "upgrade"
                    ? unlockedHardwares
                    : lockedHardwares
                  ).map((hw) => (
                    <HardwareCard
                      t={t}
                      key={hw.hardwareId}
                      hardware={hw}
                      onUpgrade={handleUpgrade}
                      onBuy={handleBuy}
                      upgradingId={upgradingId}
                      buyingId={buyingId}
                      image={
                        hardwareImages[hw.hardwareId] || "/images/character.png"
                      } // <<-- پاس دادن عکس
                    />
                  ))}
                </motion.div>
              )}
              {(activeTab === "upgrade" || activeTab === "buy") &&
                (activeTab === "upgrade" ? unlockedHardwares : lockedHardwares)
                  .length == 0 && (
                  <div className="flex items-center justify-center w-full py-15 text-lg font-bold">
                    {activeTab === "upgrade"
                      ? t("No_hardware_found_for_upgrade")
                      : t("No_hardware_found_for_purchase")}
                  </div>
                )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
};

export default MiningPage;
