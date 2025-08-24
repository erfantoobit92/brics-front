import React, { useState, type JSX } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
// import { useUserStore } from "../store/userStore"; // فرض بر استفاده از Zustand برای بالانس
import {
  FiGlobe,
  FiTwitter,
  FiYoutube,
  FiCheckCircle,
  FiSend,
  FiLink,
  FiDollarSign,
  FiPlusCircle,
  FiArrowRight,
} from "react-icons/fi";
import { FaTelegramPlane, FaBone, FaTelegram } from "react-icons/fa"; // مثال برای لوگو کنار اسم
import { ClipLoader } from "react-spinners";
import { Api_Claim_Task_Reward, Api_Start_Task } from "../api";

// انیمیشن برای هر آیتم
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const } },
  exit: { y: -20, opacity: 0, transition: { duration: 0.3 } },
};


type TaskType =
  | "VISIT_WEBSITE"
  | "FOLLOW_SOCIAL"
  | "WATCH_YOUTUBE"
  | "JOIN_TELEGRAM_CHANNEL"
  | "BOOST_TELEGRAM_CHANNEL"
  | "POST_TELEGRAM_STORY"
  | "ADD_LOGO_TO_PROFILE_NAME"
  | "CONNECT_WALLET"
  | "ON_CHAIN_TRANSACTION"
  | "ADD_TOKEN_TO_WALLET";

const taskIcons :Record<TaskType, JSX.Element>= {
  VISIT_WEBSITE: <FiGlobe className="text-blue-400" />,
  FOLLOW_SOCIAL: <FiTwitter className="text-sky-400" />,
  WATCH_YOUTUBE: <FiYoutube className="text-red-500" />,
  JOIN_TELEGRAM_CHANNEL: <FaTelegramPlane className="text-blue-500" />,
  BOOST_TELEGRAM_CHANNEL: <FaTelegram className="text-purple-600" />,
  POST_TELEGRAM_STORY: <FiPlusCircle className="text-pink-400" />,
  ADD_LOGO_TO_PROFILE_NAME: <FaBone className="text-yellow-400" />, // مثال مثل داگز
  CONNECT_WALLET: <FiLink className="text-green-400" />,
  ON_CHAIN_TRANSACTION: <FiDollarSign className="text-yellow-500" />,
  ADD_TOKEN_TO_WALLET: <FiPlusCircle className="text-indigo-400" />,
};

const TaskItem = ({ task, onTaskUpdate }: any) => {
  const [isProcessing, setIsProcessing] = useState(false);
//   const updateUserBalance = useUserStore((state: any) => state.updateBalance);

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      // --- منطق هوشمند بر اساس نوع و وضعیت تسک ---

      // اگر تسک در حالت PENDING باشه
      if (task.status === "PENDING") {
        // تسک‌هایی که فقط نیاز به "چک کردن" دارن و "شروع" ندارن
        if (
          task.type === "ADD_LOGO_TO_PROFILE_NAME" ||
          task.type === "JOIN_TELEGRAM_CHANNEL"
        ) {
          const response = await Api_Claim_Task_Reward(task.id);
          toast.success(`+${task.rewardCoin.toLocaleString()}! Task Verified.`);
        //   updateUserBalance(response.data.newBalance);
          onTaskUpdate();
          return;
        }

        // تسک‌هایی که نیاز به هدایت کاربر به جای دیگه دارن
        await Api_Start_Task(task.id);
        if (task.metadata.url || task.metadata.channelUrl) {
          window.open(task.metadata.url || task.metadata.channelUrl, "_blank");
        }
        toast.success("Task started! Come back to claim your reward.");
        onTaskUpdate();

        // اگر تسک در حالت STARTED باشه
      } else if (task.status === "STARTED") {
        const response = await Api_Claim_Task_Reward(task.id);
        toast.success(`+${task.rewardCoin.toLocaleString()}! Reward Claimed.`);
        // updateUserBalance(response.data.newBalance);
        onTaskUpdate();
      }
    } catch (error: any) {
        console.log(error);
        
      toast.error(error.response?.data?.message || "Action failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderActionButton = () => {
    if (task.status === "COMPLETED") {
      return (
        <div className="flex items-center space-x-2 text-green-400 font-semibold">
          <FiCheckCircle size={20} />
          <span>Done</span>
        </div>
      );
    }

    // دکمه‌ها بر اساس نوع و وضعیت
    let buttonText = "";
    let buttonClass = "bg-blue-500 hover:bg-blue-600";

    if (task.status === "PENDING") {
      switch (task.type) {
        case "JOIN_TELEGRAM_CHANNEL":
        case "ADD_LOGO_TO_PROFILE_NAME":
          buttonText = "Check";
          buttonClass = "bg-indigo-500 hover:bg-indigo-600";
          break;
        case "CONNECT_WALLET":
          buttonText = "Connect"; // این دکمه می‌تونه کاربر رو به صفحه ولت ببره
          break;
        default:
          buttonText = "Go";
      }
    } else if (task.status === "STARTED") {
      buttonText = "Claim";
      buttonClass = "bg-yellow-500 hover:bg-yellow-600";
    }

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`text-white font-bold py-2 px-5 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}
        onClick={handleAction}
        disabled={isProcessing}
      >
        {isProcessing ? <ClipLoader color="#fff" size={20} /> : buttonText}
      </motion.button>
    );
  };

  return (
    <motion.div
      variants={itemVariants}
      layout // این باعث انیمیشن روان هنگام حذف آیتم میشه
    >
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-4 rounded-2xl flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{taskIcons[(task.type as TaskType)] || <FiGlobe />}</div>
          <div>
            <h3 className="font-bold text-white text-md">{task.title}</h3>
            <p className="text-sm text-yellow-400 font-semibold">
              + {task.rewardCoin.toLocaleString()}
            </p>
          </div>
        </div>
        <div>{renderActionButton()}</div>
      </div>
    </motion.div>
  );
};

export default TaskItem;
