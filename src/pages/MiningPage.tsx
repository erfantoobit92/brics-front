import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./MiningPage.module.css";
import {
  FaBolt,
  FaCoins,
  FaArrowUp,
  FaServer,
  FaSpinner,
  FaGoogleWallet,
  FaShoppingCart,
  FaLock,
} from "react-icons/fa";
import {
  Api_Claim_Rewards,
  Api_Get_Mining_Status,
  Api_Upgrade_Hardware,
  Api_Buy_Hardware,
} from "../api";

interface CombinedHardware {
  id: number | null; // id نمونه‌ی کاربر (اگر داشته باشد)
  hardwareId: number;
  name: any;
  level: number;
  isOwned: boolean;
  currentMiningRatePerHour: number;
  nextLevelUpgradeCost?: number | null; // هزینه آپگرید (برای فعال‌ها)
  buyCost?: number | null; // هزینه خرید (برای قفل‌ها)
  isMaxLevel: boolean;
}

// ================= TYPE DEFINITIONS (با فیلدهای جدید) =================
// interface HardwareInfo {
//   id: number;
//   name: string;
// }

// interface UserHardware {
//   id: number;
//   level: number;
//   hardware: HardwareInfo;
//   currentMiningRatePerHour: number;
//   nextLevelUpgradeCost: number | null;
//   isMaxLevel: boolean;
// }

export interface MiningStatusData {
  unclaimedMiningReward: number;
  totalMiningRatePerHour: number;
  hardwares: CombinedHardware[]; // <<-- استفاده از تایپ جدید
  balance: number; // <<-- فیلد جدید اضافه شد
  bricsBalance: number; // <<-- فیلد جدید اضافه شد
}

// ================= HARDWARE CARD COMPONENT =================
interface HardwareCardProps {
  hardware: CombinedHardware;
  onUpgrade: (userHardwareId: number) => Promise<void>;
  onBuy: (hardwareId: number) => Promise<void>;
  upgradingId: number | null;
  buyingId: number | null;
}

const HardwareCard: React.FC<HardwareCardProps> = ({
  hardware,
  onUpgrade,
  onBuy,
  upgradingId,
  buyingId,
}) => {
  const isUpgrading = upgradingId === hardware.id;
  const isBuying = buyingId === hardware.hardwareId;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  const cardClassName = `${styles.hardwareCard} ${
    !hardware.isOwned ? styles.lockedCard : ""
  }`;

  return (
    <motion.div className={cardClassName} variants={cardVariants}>
      {!hardware.isOwned && (
        <div className={styles.lockedOverlay}>
          <FaLock size={24} />
        </div>
      )}
      <FaServer size={40} className={styles.hardwareIcon} />
      <div className={styles.hardwareInfo}>
        <h3>
          {hardware.name.en} {hardware.isOwned && `- Lvl ${hardware.level}`}
        </h3>
        <p>
          <FaBolt color="#f39c12" />{" "}
          {hardware.isOwned
            ? `${hardware.currentMiningRatePerHour.toFixed(6)} / hour`
            : "Inactive"}
        </p>
      </div>

      {hardware.isOwned ? (
        // --- دکمه آپگرید برای سخت‌افزار فعال
        <motion.button
          className={styles.upgradeButton}
          onClick={() => hardware.id && !isUpgrading && onUpgrade(hardware.id)}
          disabled={hardware.isMaxLevel || isUpgrading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isUpgrading ? (
            <FaSpinner className={styles.spinner} />
          ) : hardware.isMaxLevel ? (
            "MAX Level"
          ) : (
            <>
              <FaArrowUp /> Upgrade for {hardware.nextLevelUpgradeCost}
            </>
          )}
        </motion.button>
      ) : (
        // --- دکمه خرید برای سخت‌افزار قفل
        <motion.button
          className={styles.buyButton}
          onClick={() => !isBuying && onBuy(hardware.hardwareId)}
          disabled={isBuying || hardware.buyCost === null}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isBuying ? (
            <FaSpinner className={styles.spinner} />
          ) : (
            <>
              <FaShoppingCart /> Buy for {hardware.buyCost}
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
};

// ================= MAIN MINING PAGE COMPONENT =================
const MiningPage: React.FC = () => {
  // اینجا با کمک Generics، به useState میگیم چه نوع داده‌ای رو نگه میداره
  const [data, setData] = useState<MiningStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [upgradingId, setUpgradingId] = useState<number | null>(null);
  const [isClaiming, setIsClaiming] = useState<boolean>(false); // برای مدیریت لودینگ دکمه claim
  const [buyingId, setBuyingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await Api_Get_Mining_Status();
      setData(response.data);
      setError("");
    } catch (err: any) {
      // بهتره برای ارورها هم type مشخص‌تری تعریف کنی
      setError(err.response?.data?.message || "Failed to fetch mining data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // افکت برای افزایش زنده پاداش
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
    setUpgradingId(userHardwareId);
    try {
      await Api_Upgrade_Hardware(userHardwareId);
      await fetchData(); // <<-- اینجا کل صفحه رو رفرش می‌کنیم
    } catch (err: any) {
      alert(err.response?.data?.message || "Upgrade failed!");
    } finally {
      setUpgradingId(null);
    }
  };

  const handleClaim = async (): Promise<void> => {
    setIsClaiming(true); // لودینگ شروع
    try {
      await Api_Claim_Rewards();
      await fetchData(); // بروزرسانی کامل داده‌ها از سرور
    } catch (err: any) {
      alert(err.response?.data?.message || "Claim failed!");
    } finally {
      setIsClaiming(false); // لودینگ تمام
    }
  };

  const handleBuy = async (hardwareId: number): Promise<void> => {
    setBuyingId(hardwareId);
    try {
      await Api_Buy_Hardware(hardwareId); // <<-- فراخوانی API واقعی
      await fetchData(); // رفرش کامل صفحه بعد از خرید موفق
    } catch (err: any) {
      alert(err.response?.data?.message || "Buy failed!");
    } finally {
      setBuyingId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} size={50} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.errorContainer}>
        {error || "No data available."}
      </div>
    );
  }

  return (
    <motion.div
      className={styles.pageContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.mainDisplay}>
        <motion.div
          className={styles.bricsIconPulsing}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <FaCoins size={80} />
        </motion.div>

        <h1>Your Brics</h1>
        <div className={styles.rewardContainer}>
          <AnimatePresence mode="popLayout">
            <motion.h2 key={data.unclaimedMiningReward.toFixed(4)}>
              {data.unclaimedMiningReward.toFixed(6)}
            </motion.h2>
          </AnimatePresence>
          <span className={styles.bricsSymbol}>Unclaimed</span>
        </div>
        <p className={styles.mainBalance}>
          <FaCoins color="#f1c40f" /> <b>Total Brics:</b>{" "}
          {data.bricsBalance.toFixed(6)}
        </p>

        <p className={styles.miningRate}>
          <FaBolt /> Total Rate: {data.totalMiningRatePerHour.toFixed(6)} / hour
        </p>

        <motion.button
          className={styles.claimButton}
          onClick={handleClaim}
          disabled={data.unclaimedMiningReward < 0.000001 || isClaiming}
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px #27ae60" }}
          whileTap={{ scale: 0.95 }}
        >
          {isClaiming ? (
            <FaSpinner className={styles.spinner} />
          ) : (
            "Claim Rewards"
          )}
        </motion.button>
      </div>

      <div className={styles.balanceDisplay}>
        <FaGoogleWallet size={24} />
        <span>Your Balance for Upgrades:</span>
        <strong>{Math.floor(data.balance)}</strong>
      </div>

      <div className={styles.hardwareSection}>
        <h2>Mining Rigs</h2>
        <motion.div
          className={styles.hardwareList}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="visible"
        >
          {data.hardwares
            .sort((a, b) => (a.isOwned === b.isOwned ? 0 : a.isOwned ? -1 : 1)) // <<-- همیشه فعال‌ها اول
            .map((hw) => (
              <HardwareCard
                key={hw.hardwareId}
                hardware={hw}
                onUpgrade={handleUpgrade}
                onBuy={handleBuy}
                upgradingId={upgradingId}
                buyingId={buyingId}
              />
            ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MiningPage;
