import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";
import { Toaster } from "react-hot-toast";

import { useAppContext } from "../context/AppContext";
import { User_Referral_Link } from "../constants";
import { Api_FetchFriends } from "../api";
import InviteBottomSheet from "../components/InviteBottomSheet";

// --- آیکون‌ها و عکس‌ها (این‌ها رو با آدرس‌های واقعی خودت جایگزین کن)
// import candyIcon from '../assets/images/candy.png';
// import giftBoxPurple from '../assets/images/gift-purple.png';
// import giftBoxRed from '../assets/images/gift-red.png';

// <<-- اینترفیس Friend رو آپدیت می‌کنیم تا فیلدهای جدید رو هم شامل بشه
interface Friend {
  id: number;
  firstName: string;
  username?: string;
  totalBrics?: number; // مثال: 2.8M
  rewarded?: number; // پاداشی که از این دوست گرفتی
}

const FriendsPage = () => {
  // ==================== منطق کد شما (کاملاً دست‌نخورده) ====================
  const { token, telegramUser } = useAppContext();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await Api_FetchFriends();
        // اینجا می‌تونی داده‌های response رو مپ کنی تا totalBrics و rewarded هم داشته باشن
        setFriends(response);
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchFriends();
    }
  }, [token]);
  // ==================== پایان منطق کد شما ====================

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const { t } = useTranslation();
  const referralLink = User_Referral_Link(telegramUser?.id ?? -1);

  return (
    <>
      <Toaster position="top-center" />
      <InviteBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        referralLink={referralLink}
      />
      <div
        className="w-full h-full bg-cover bg-center text-white overflow-hidden"
        style={{ backgroundImage: `url('/images/bg.png')` }}
      >
        {/* ========== هدر صفحه ========== */}
        <div className="flex flex-col p-4 !overflow-y-auto scroll-hidden h-[calc(100%-110px)]">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-4xl font-bold">{t("invite_your_friends")}</h1>
            <p className="text-gray-400 mt-3">
              {t("you_both_will_receive_bonuses")}
            </p>
          </motion.header>

          {/* ========== کارت‌های دعوت ========== */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.button
              onClick={() => setIsBottomSheetOpen(true)}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/30 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center flex flex-col items-center"
            >
              <img
                src="/images/gift.png"
                alt="Invite a friend"
                className="w-20 h-20 mb-2"
              />
              <span className="font-bold text-sm">{t("invite_a_friend")}</span>
              <div className="flex items-center gap-1 my-1 !mt-auto">
                <img
                  src="/images/coin-gold.png"
                  alt="brics"
                  className="w-4 h-4"
                />
                <span className="font-bold text-yellow-300">+ 1,000</span>
              </div>
              <p className="text-xs text-gray-300">
                {t("for_you_and_your_friend")}
              </p>
            </motion.button>
            <motion.button
              onClick={() => setIsBottomSheetOpen(true)}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/30 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center flex flex-col items-center"
            >
              <img
                src="/images/gift-plus.png"
                alt="Invite a friend with TG Premium"
                className="w-20 h-20 mb-2"
              />
              <span className="font-bold text-sm">
                {t("invite_friend_tg_premium")}
              </span>
              <div className="flex items-center gap-1 my-1 !mt-auto">
                <img
                  src="/images/coin-gold.png"
                  alt="brics"
                  className="w-4 h-4"
                />
                <span className="font-bold text-yellow-300">+ 3,000</span>
              </div>
              <p className="text-xs text-gray-300">
                {t("for_you_and_your_friend")}
              </p>
            </motion.button>
          </div>

          {/* ========== لیست دوستان ========== */}
          <h2 className="text-xl font-bold mb-3">
            {t("list_of_your_friends", { count: friends.length })}
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <ClipLoader color="#EAB308" size={40} />
            </div>
          ) : (
            <motion.div
              className="space-y-2"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              initial="hidden"
              animate="visible"
            >
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <motion.div
                    key={friend.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="bg-white/20 p-3 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                        {friend.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{friend.firstName}</p>
                        {/* اینجا رو با داده واقعی جایگزین کن */}
                        {/* <p className="text-xs text-gray-400 flex items-center gap-1">
                        Master{" "}
                        <img
                          src="/images/coin.png"
                          alt="brics"
                          className="w-3 h-3"
                        />{" "}
                        +{formatNumber(friend.totalBrics || 0)}
                      </p> */}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-300 font-bold pr-2">
                      <div className="!h-12 w-[1px] bg-white/40 mx-3"></div>
                      <img
                        src="/images/coin-gold.png"
                        alt="reward"
                        className="w-4 h-4"
                      />
                      <span>+ {friend.rewarded || 0}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center py-10 text-gray-500">
                  {t("no_friends_invited")}
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default FriendsPage;
