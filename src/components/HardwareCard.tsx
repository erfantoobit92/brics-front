import React from "react";
import { motion } from "framer-motion";

// تعریف نوع داده‌ای که این کامپوننت به عنوان props می‌گیره
interface Hardware {
  id: number;
  userHardwareId: number;
  name: string;
  description: string;
  currentLevel: number;
  bricsPerHour: number;
  nextLevel: {
    level: number;
    bricsPerHour: number;
    costCoins: string;
    costBrics: number;
  } | null;
}

interface HardwareCardProps {
  hardware: Hardware;
  onUpgrade: (userHardwareId: number) => void;
  isUpgrading: boolean; // پراپ جدید برای حالت لودینگ
}

const HardwareCard: React.FC<HardwareCardProps> = ({
  hardware,
  onUpgrade,
  isUpgrading,
}) => {
  const formatBigNumber = (numStr: string) => {
    const num = Number(numStr);
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-yellow-400">{hardware.name}</h3>
        <span className="text-sm font-semibold bg-gray-700 px-2 py-1 rounded">
          Lvl {hardware.currentLevel}
        </span>
      </div>

      <div className="text-sm text-gray-400">
        <span>Profit per hour: </span>
        <span className="font-bold text-green-400">
          +{hardware.bricsPerHour.toFixed(4)} BRICS
        </span>
      </div>

      {hardware.nextLevel ? (
        <div className="border-t border-gray-700 pt-3">
          <p className="text-sm mb-2">
            Upgrade to Level {hardware.nextLevel.level}:
          </p>
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <p>
                Cost:{" "}
                <span className="font-bold">
                  {formatBigNumber(hardware.nextLevel.costCoins)} Coins
                </span>
              </p>
              {hardware.nextLevel.costBrics > 0 && (
                <p>
                  +{" "}
                  <span className="font-bold">
                    {hardware.nextLevel.costBrics} BRICS
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={() => onUpgrade(hardware.userHardwareId)}
              disabled={isUpgrading} // دکمه رو در حالت لودینگ غیرفعال کن
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-transform duration-200 active:scale-95 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isUpgrading ? "..." : "Upgrade"} {/* نمایش لودینگ */}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-green-500 font-bold">
          Max Level Reached!
        </p>
      )}
    </motion.div>
  );
};

export default HardwareCard;
