// import { useTranslation } from "react-i18next";
// import { Link } from "react-router-dom";
// import { FaUserFriends } from "react-icons/fa";
// import { IoHome } from "react-icons/io5";
// import { BiSolidCoinStack } from "react-icons/bi";
// import { SiJasmine } from "react-icons/si";
// import { CgProfile } from "react-icons/cg";
// import { TbArrowsExchange } from "react-icons/tb";
// import { SiGoogletasks } from "react-icons/si";
// import { RiBitCoinFill } from "react-icons/ri";

// const BottomNav = () => {
//   const { t } = useTranslation(); // از هوک استفاده کن

//   // const navItems = [
//   //   { path: "/", label: "Tap" },
//   //   { path: "/mine", label: "Mine" }, // لینک جدید
//   //   { path: "/tasks", label: "Tasks" },
//   //   { path: "/friends", label: "Friends" },
//   //   { path: "/change", label: "Convert" },
//   //   { path: "/profile", label: "Profile" },
//   // ];

//   return (
//     <div className="flex !align-center !px-auto !items-center w-[100%] h-20">
//       <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl bg-[#272a2f] flex justify-around items-center z-50 rounded-3xl text-xs">
//         {/* ... بقیه کد ... */}
//         <Link
//           to="/"
//           className="text-center text-white p-4 flex flex-col items-center gap-1"
//         >
//           <RiBitCoinFill size={24} />
//           <p>{t("tap")}</p> {/* متن ثابت رو با t('key') جایگزین کن */}
//         </Link>
//         <Link
//           to="/friends"
//           className="text-center text-white p-4 flex flex-col items-center gap-1"
//         >
//           <FaUserFriends size={24} />
//           <p>{t("friends")}</p>
//         </Link>
//         <Link
//           to="/tasks"
//           className="text-center text-white p-4 flex flex-col items-center gap-1"
//         >
//           <SiGoogletasks size={24} />
//           <p>{t("tasks")}</p>
//         </Link>
//         <Link
//           to="/mine"
//           className="text-center text-white p-4 flex flex-col items-center gap-1"
//         >
//           <SiJasmine size={24} />
//           <p>{t("mine")}</p>
//         </Link>
//         <Link
//           to="/change"
//           className="text-center text-white p-4 flex flex-col items-center gap-1"
//         >
//           <TbArrowsExchange size={24} />
//           <p>{t("change")}</p>
//         </Link>
//         <Link
//           to="/profile"
//           className="text-center text-white p-4 flex flex-col items-center gap-1"
//         >
//           <CgProfile size={24} />
//           <p>{t("profile")}</p>
//         </Link>
//       </div>
//     </div>

//     // <nav className="w-full bg-gray-800 p-2">
//     //   <ul className="flex justify-around items-center">
//     //     {navItems.map((item) => (
//     //       <li key={item.path}>
//     //         <NavLink
//     //           to={item.path}
//     //           className={({ isActive }) =>
//     //             `flex flex-col items-center gap-1 text-xs ${
//     //               isActive ? "text-yellow-400" : "text-gray-400"
//     //             }`
//     //           }
//     //         >
//     //           <span>{item.label}</span>
//     //         </NavLink>
//     //       </li>
//     //     ))}
//     //   </ul>
//     // </nav>
//   );
// };

// export default BottomNav;

import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

// آیکون‌ها رو از react-icons ایمپورت می‌کنیم
import { RiCopperCoinLine, RiTeamLine } from "react-icons/ri";
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
