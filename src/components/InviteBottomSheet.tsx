import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { FaLink, FaShare } from "react-icons/fa"; // آیکون‌های زیبا

interface Props {
  isOpen: boolean;
  onClose: () => void;
  referralLink: string;
}

const InviteBottomSheet = ({ isOpen, onClose, referralLink }: Props) => {
  const { t } = useTranslation();

  const handleShareOnTelegram = () => {
    const shareText = t('invite_message', { link: referralLink });
    const href = `https://t.me/share/url?text=${encodeURIComponent(shareText)}`;
    window.open(href, "_blank");
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success(t('link_copied'));
    onClose();
  };

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const sheetVariants = {
    visible: { y: 0 },
    hidden: { y: "100%" },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* پس‌زمینه تیره که با کلیک بسته میشه */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-400"
          />
          {/* محتوای اصلی باتم‌شیت */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 p-6 bg-gray-800 rounded-t-3xl shadow-lg z-450"
          >
            <h3 className="text-2xl font-bold text-center mb-6">{t('invite_a_friend')}</h3>
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-full text-lg"
              >
                <FaLink />
                {t('copy_link')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleShareOnTelegram}
                className="w-full flex items-center justify-center gap-3 bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-full text-lg"
              >
                <FaShare />
                {t('share_on_telegram')}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InviteBottomSheet;