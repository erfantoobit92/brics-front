// src/components/BoostItem.tsx

import React from "react";
import { FaLock, FaCheckCircle, FaCoins } from "react-icons/fa";
import { motion } from "framer-motion";
import type { BoostLevelData } from "../../api";

interface BoostItemProps {
  boost: BoostLevelData;
  onUpgrade: () => void;
  isUpgrading: boolean;
}

const BoostItem: React.FC<BoostItemProps> = ({ boost, onUpgrade, isUpgrading }) => {
  const isNextLevel = !boost.isUnlocked && !boost.isCurrent;
  
  // تعیین وضعیت دکمه
  let buttonState: 'current' | 'unlocked' | 'locked' | 'upgradeable' = 'locked';
  let buttonText = "Locked";
  let buttonIcon = <FaLock />;

  if (boost.isCurrent) {
    buttonState = 'current';
    buttonText = "Current";
    buttonIcon = <FaCheckCircle className="text-green-400" />;
  } else if (boost.isUnlocked) {
    buttonState = 'unlocked';
    buttonText = "Unlocked";
    buttonIcon = <FaCheckCircle className="text-gray-400" />;
  } else if (isNextLevel && boost.canAfford) {
    buttonState = 'upgradeable';
    buttonText = "Upgrade";
    buttonIcon = <FaCoins />;
  }

  const buttonClasses = {
    current: "bg-green-500/20 text-green-400 border-green-500",
    unlocked: "bg-gray-700/30 text-gray-400 border-gray-600",
    locked: "bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed",
    upgradeable: "bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-600 font-bold",
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: boost.level * 0.05 }}
      className="flex items-center justify-between w-full p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 mb-3"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-800/50 rounded-lg flex items-center justify-center text-2xl font-bold">
          {boost.level}
        </div>
        <div>
          <p className="font-bold text-lg">Tap Level {boost.level}</p>
          <div className="flex items-center gap-2 text-yellow-400">
            <FaCoins />
            <span>{boost.cost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        disabled={buttonState !== 'upgradeable' || isUpgrading}
        onClick={buttonState === 'upgradeable' ? onUpgrade : undefined}
        className={`px-4 py-2 rounded-lg border text-sm transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[buttonState]}`}
      >
        {isUpgrading && buttonState === 'upgradeable' ? '...' : buttonIcon}
        {isUpgrading && buttonState === 'upgradeable' ? 'Upgrading' : buttonText}
      </motion.button>
    </motion.div>
  );
};

export default BoostItem;