

import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

// آیکون‌ها رو از react-icons ایمپورت می‌کنیم
import {  RiTeamLine } from "react-icons/ri";
import { PiHandTapFill, PiHammer } from "react-icons/pi";
import { PiCoinsDuotone } from "react-icons/pi";

// لیست آیتم‌های نویگیشن برای مدیریت راحت‌تر
const navItems = [
  { path: "/", labelKey: "tap", icon: PiHandTapFill },
  { path: "/mine", labelKey: "mine", icon: PiHammer },
  { path: "/tasks", labelKey: "earn", icon: PiCoinsDuotone },
  { path: "/friends", labelKey: "friends", icon: RiTeamLine },
];

const BottomNav = () => {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl z-50">
      {/* کانتینر اصلی با استایل شیشه‌ای و شناور */}
      <div className="relative flex justify-around items-center p-2 bg-black/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
        {navItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.path}
            // با استفاده از isActive می‌تونیم استایل‌های متفاوتی به تب فعال بدیم
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center w-16 h-16 text-center transition-colors duration-300 z-10 ${
                isActive ? "text-lime-300" : "text-gray-400 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* انیمیشن قرص لغزنده فقط برای آیتم فعال رندر میشه */}
                {isActive && (
                  <motion.div
                    layoutId="active-pill" // این ID جادوی انیمیشن رو انجام میده
                    className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-500 rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* آیکون */}
                <item.icon className="text-2xl mb-1 relative" />

                {/* متن */}
                <span className="text-xs font-bold relative">
                  {t(item.labelKey)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
