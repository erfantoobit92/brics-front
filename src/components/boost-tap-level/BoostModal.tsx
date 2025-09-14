
// src/components/BoostModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Api_Get_Boosts, Api_Upgrade_Boost, type BoostLevelData } from '../../api';
import BoostItem from './BoostItem';
import { FaRocket, FaTimes } from 'react-icons/fa';

interface BoostModalProps {
  isOpen: boolean;
  onClose: (didUpgrade?: boolean) => void;
}

const BoostModal: React.FC<BoostModalProps> = ({ isOpen, onClose }) => {
  const [boosts, setBoosts] = useState<BoostLevelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const fetchBoosts = async () => {
    setIsLoading(true);
    try {
      const { data } = await Api_Get_Boosts();
      setBoosts(data);
    } catch (error) {
      console.error("Failed to fetch boosts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBoosts();
    }
  }, [isOpen]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await Api_Upgrade_Boost();
      // بعد از آپگرید موفق، لیست رو دوباره می‌گیریم تا وضعیت جدید نمایش داده بشه
      await fetchBoosts();
      // onClose(true) رو صدا می‌زنیم تا به صفحه TapPage بگیم که آپدیت انجام شده
      // و اون بتونه state خودش (balance) رو آپدیت کنه
    } catch (error) {
      console.error("Upgrade failed:", error);
      // اینجا میشه یه toast یا پیغام خطا به کاربر نشون داد
    } finally {
      setIsUpgrading(false);
    }
  };
  
  // وقتی کاربر مودال رو می‌بنده، به صفحه اصلی خبر میدیم که آیا آپگریدی اتفاق افتاده یا نه
  // اینکارو با چک کردن اینکه آیا هیچ بوستی در حالت upgradeable نیست انجام میدیم
  const handleClose = () => {
    const upgraded = boosts.some(b => b.isCurrent); // یه راه ساده برای تشخیص آپگرید
    onClose(upgraded);
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900/80 border border-purple-500/30 p-6 text-left align-middle shadow-xl transition-all text-white">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 text-purple-400">
                    <FaRocket />
                    <span>Boost Your Taps</span>
                  </div>
                   <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/10">
                      <FaTimes />
                   </button>
                </Dialog.Title>

                <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
                  {isLoading ? (
                    // Skeleton loader for boosts
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center w-full p-4 bg-black/20 rounded-xl mb-3 h-20 animate-pulse"></div>
                    ))
                  ) : (
                    boosts.map((boost) => (
                      <BoostItem key={boost.id} boost={boost} onUpgrade={handleUpgrade} isUpgrading={isUpgrading} />
                    ))
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

export default BoostModal;