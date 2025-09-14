// src/components/BoostItem.tsx

import React from "react";
import { motion } from "framer-motion";
import type { BoostLevelData } from "../../api";
import { useTranslation } from "react-i18next";

interface BoostItemProps {
  boost: BoostLevelData;
  onUpgrade: () => void;
  isUpgrading: boolean;
}

const BoostItem: React.FC<BoostItemProps> = ({ boost, onUpgrade, isUpgrading }) => {
  const isNextLevel = !boost.isUnlocked && !boost.isCurrent;
    const { t } = useTranslation();

  // تعیین وضعیت دکمه
  let buttonState: 'current' | 'unlocked' | 'locked' | 'upgradeable' = 'locked';
  let buttonText = t("locked");

  if (boost.isCurrent) {
    buttonState = 'current';
    buttonText = t("current");
  } else if (boost.isUnlocked) {
    buttonState = 'unlocked';
    buttonText = t("unlocked");
  } else if (isNextLevel && boost.canAfford) {
    buttonState = 'upgradeable';
    buttonText = t("upgrade");
  }

  const buttonClasses = {
    current: "bg-green-500 text-white border-green-500",
    unlocked: "bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-600 font-bold",
    locked: "bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed",
    upgradeable: "bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-600 font-bold",
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: boost.level * 0.05 }}
      className="flex items-center justify-between w-full p-4  backdrop-blur-sm rounded-full border border-white/10 mb-3"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-2xl font-bold">
          {boost.level}
        </div>
        <div>
          <p className="font-bold text-lg">{t('tap_level')} {boost.level}</p>
          <div className="flex items-center gap-2 text-yellow-400">
           <img
                  src="/images/coin-gold.png"
                  alt="brics"
                  className="w-4 h-4"
                />
            <span>{ boost.cost == 0 ? t('free') :boost.cost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        disabled={buttonState !== 'upgradeable' || isUpgrading}
        onClick={buttonState === 'upgradeable' ? onUpgrade : undefined}
        className={`px-4 py-2 rounded-full border text-sm transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses[buttonState]}`}
      >
        {isUpgrading && buttonState === 'upgradeable' ? t('upgrading') : buttonText}
      </motion.button>
    </motion.div>
  );
};

export default BoostItem;