import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { useTonWallet, useTonConnectUI } from "@tonconnect/ui-react";
import { shareStory, init } from "@telegram-apps/sdk-react";

import {
  Api_Claim_Task_Reward,
  Api_Connect_User_Wallet,
  Api_Start_Task,
} from "../api";
import { useAppContext } from "../context/AppContext";
import { Telegram_Bot_Username } from "../constants";
import { useTranslation } from "react-i18next";

export const TaskType = {
  VISIT_WEBSITE: "VISIT_WEBSITE",
  FOLLOW_SOCIAL: "FOLLOW_SOCIAL",
  WATCH_YOUTUBE: "WATCH_YOUTUBE",
  JOIN_TELEGRAM_CHANNEL: "JOIN_TELEGRAM_CHANNEL",
  BOOST_TELEGRAM_CHANNEL: "BOOST_TELEGRAM_CHANNEL",
  POST_TELEGRAM_STORY: "POST_TELEGRAM_STORY",
  ADD_LOGO_TO_PROFILE_NAME: "ADD_LOGO_TO_PROFILE_NAME",
  CONNECT_WALLET: "CONNECT_WALLET",
  ON_CHAIN_TRANSACTION: "ON_CHAIN_TRANSACTION",
  ADD_TOKEN_TO_WALLET: "ADD_TOKEN_TO_WALLET",
} as const;
export type TaskType = (typeof TaskType)[keyof typeof TaskType];

const taskIcons: Record<TaskType, string> = {
  VISIT_WEBSITE: "/tasks/website.png",
  FOLLOW_SOCIAL: "/tasks/instagram.png",
  WATCH_YOUTUBE: "/tasks/youtube.png",
  JOIN_TELEGRAM_CHANNEL: "/tasks/telegram.png",
  BOOST_TELEGRAM_CHANNEL: "/tasks/boost-telegram.png",
  POST_TELEGRAM_STORY: "/tasks/story.png",
  ADD_LOGO_TO_PROFILE_NAME: "/tasks/website.png",
  CONNECT_WALLET: "/tasks/connect-wallet.png",
  ON_CHAIN_TRANSACTION: "/tasks/transaction.png",
  ADD_TOKEN_TO_WALLET: "/tasks/add-token-wallet.png",
};

// انیمیشن برای آیتم‌ها (بدون تغییر)
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const } },
  exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } },
};

const TaskItem = ({ task, onTaskUpdate }: any) => {
  const { i18n} = useTranslation();
  
  // ==================== منطق کد شما (کاملاً دست‌نخورده) ====================
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, setUser } = useAppContext();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    const handleConnection = async () => {
      if (
        wallet &&
        task.type === "CONNECT_WALLET" &&
        user?.walletAddress == null
      ) {
        const address = wallet.account.address;
        toast.success("Wallet connected!");
        try {
          const response = await Api_Connect_User_Wallet(address);
          if (response.data.newBalance) {
            toast.success(
              `Reward claimed! New balance: ${response.data.newBalance.toLocaleString()}`
            );
          }
          setUser({
            firstName: user?.firstName,
            lastName: user?.lastName,
            username: user?.username,
            walletAddress: address,
          });
        } catch (error: any) {
          toast.error(
            error.response?.data?.message ||
              "Failed to sync wallet with server."
          );
        }
      }
    };
    handleConnection();
  }, [wallet]);
  const handleAction = async () => {
    setIsProcessing(true);
    try {
      if (task.status === "PENDING") {
        if (task.type === "ADD_LOGO_TO_PROFILE_NAME") {
          await Api_Claim_Task_Reward(task.id);
          toast.success(`+${task.rewardCoin.toLocaleString()}! Task Verified.`);
          onTaskUpdate();
          return;
        }
        // if (task.type === "JOIN_TELEGRAM_CHANNEL") {
        //   window.open(
        //     `https://t.me/${(task.metadata.channelId as String).slice(
        //       1,
        //       task.metadata.channelId.length
        //     )}`
        //   );
        //   return;
        // }
        await Api_Start_Task(task.id);
        if (task.metadata.url || task.metadata.channelUrl) {
          window.open(task.metadata.url || task.metadata.channelUrl, "_blank");
        }
        toast.success("Task started! Come back to claim your reward.");
        onTaskUpdate();
      } else if (task.status === "STARTED") {
        await Api_Claim_Task_Reward(task.id);
        toast.success(`+${task.rewardCoin.toLocaleString()}! Reward Claimed.`);
        onTaskUpdate();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed.");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleAddTokenToWallet = async () => {
    const tokenAddress = task.metadata.tokenAddress;
    const tokenSymbol = task.metadata.tokenSymbol;
    const tokenDecimals = task.metadata.tokenDecimals;
    const tokenImage = task.metadata.tokenImage;
    if (typeof (window as any).ethereum === "undefined") {
      navigator.clipboard
        .writeText(tokenAddress)
        .then(() => {
          window.open(
            `https://link.trustwallet.com/add_asset?asset=c56_t${tokenAddress}`,
            "_blank"
          );
        })
        .catch((err) => {
          console.log("Failed to copy text:", err);
        });
      return;
    }
    setIsProcessing(true);
    try {
      const wasAdded = await (window as any).ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });
      if (wasAdded) {
        toast.success(
          "Token added successfully! You can now claim your reward."
        );
        await Api_Start_Task(task.id);
        onTaskUpdate();
      } else {
        toast.error("Token was not added.");
      }
    } catch (error) {
      console.error("Error adding token:", error);
      toast.error("An error occurred while adding the token.");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleSendTransaction = async () => {
    if (!wallet) {
      tonConnectUI.openModal();
      return;
    }
    setIsProcessing(true);
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: task.metadata.toAddress,
          amount: (task.metadata.amount * 1e9).toString(),
        },
      ],
    };
    try {
      await tonConnectUI.sendTransaction(transaction);
      toast.success(
        "Transaction sent! Please wait for blockchain confirmation before claiming."
      );
      await Api_Start_Task(task.id);
      onTaskUpdate();
    } catch (error: any) {
      if (error.name === "UserRejectsError") {
        toast.error("You rejected the transaction.");
      } else {
        toast.error("An error occurred during the transaction.");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  const handleJoinTelegramClaimReward = async () => {
    setIsProcessing(true);
    try {
      await Api_Claim_Task_Reward(task.id);
      setIsProcessing(false);
      toast.success(`+${task.rewardCoin.toLocaleString()}! Task Verified.`);
      onTaskUpdate();
    } catch (e: any) {
      setIsProcessing(false);

      if (
        e.status === 400 &&
        task.type === "JOIN_TELEGRAM_CHANNEL" &&
        task.status === "PENDING"
      ) {
        window.open(
          `https://t.me/${(task.metadata.channelId as String).slice(
            1,
            task.metadata.channelId.length
          )}`
        );
      }
    }
  };
  const handlePostStory = async () => {
    try {
      init();
      shareStory(task.metadata.imageUrl, {
        text: `${task.metadata.caption}\n\nJoin us: t.me/${Telegram_Bot_Username} @${Telegram_Bot_Username}`,
        widgetLink: {
          url: `https://t.me/${Telegram_Bot_Username}`,
          name: "@BricsTrade",
        },
      });
    } catch (error) {
      alert(error);
    }
  };
  // ==================== پایان منطق کد شما ====================

  const detectSocialNetwork = (task: any) => {
    if (
      task.type != TaskType.FOLLOW_SOCIAL &&
      taskIcons[task.type as TaskType]
    ) {
      return taskIcons[task.type as TaskType];
    }
    try {
      const hostname = new URL(task.metadata.url).hostname.toLowerCase();

      if (hostname.includes("instagram.com")) {
        return "/tasks/instagram.png";
      }

      if (hostname.includes("x.com") || hostname.includes("twitter.com")) {
        return "/tasks/twitter.png";
      }

      return "/tasks/social.png";
    } catch (e) {
      return "/tasks/social.png";
    }
  };
  const renderActionButton = () => {
    // >>  تمام منطق این تابع حفظ شده، فقط ظاهر دکمه‌ها در JSX تغییر کرده است  <<

    // حالت تکمیل شده
    if (task.status === "COMPLETED") {
      return (
        <img src="/images/check.png" alt="Completed" className="w-8 h-8" />
        // <div className="w-8 h-8 flex items-center justify-center bg-pink-500 rounded-full">
        //   <FaCheck className="text-white text-lg" />
        // </div>
      );
    }

    // حالت‌های دیگر (دکمه‌های عملیاتی)
    // برای سادگی، یک استایل پایه برای دکمه‌ها تعریف می‌کنیم
    const buttonBaseClasses =
      "text-white font-bold py-2 px-auto rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm w-16";

    if (task.type === "CONNECT_WALLET") {
      if (wallet) return null;
      return (
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`${buttonBaseClasses} bg-blue-500 hover:bg-blue-600`}
          onClick={() => {
            tonConnectUI.openModal();
          }}
          disabled={isProcessing}
        >
          {isProcessing ? <ClipLoader color="#fff" size={18} /> : "Go"}
        </motion.button>
      );
    }

    if (task.type === "POST_TELEGRAM_STORY") {
      return (
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`${buttonBaseClasses} bg-blue-500 hover:bg-blue-600`}
          onClick={handlePostStory}
          disabled={isProcessing}
        >
          {isProcessing ? <ClipLoader color="#fff" size={18} /> : "Go"}
        </motion.button>
      );
    }

    if (task.type === "ON_CHAIN_TRANSACTION") {
      if (task.status === "PENDING") {
        return (
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`${buttonBaseClasses} bg-blue-500 hover:bg-blue-600`}
            onClick={handleSendTransaction}
            disabled={isProcessing}
          >
            {isProcessing ? <ClipLoader color="#fff" size={18} /> : "Go"}
          </motion.button>
        );
      }
      if (task.status === "STARTED") {
        return (
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`${buttonBaseClasses} bg-blue-500 hover:bg-blue-600`}
            onClick={handleAction}
            disabled={isProcessing}
          >
            {isProcessing ? <ClipLoader color="#fff" size={18} /> : "Go"}
          </motion.button>
        );
      }
    }

    if (task.type === "ADD_TOKEN_TO_WALLET") {
      if (task.status === "PENDING") {
        return (
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`${buttonBaseClasses} bg-blue-500 hover:bg-blue-600`}
            onClick={handleAddTokenToWallet}
            disabled={isProcessing}
          >
            {isProcessing ? <ClipLoader color="#fff" size={18} /> : "Go"}
          </motion.button>
        );
      }
      if (task.status === "STARTED") {
        return (
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`${buttonBaseClasses} bg-blue-500 hover:bg-blue-600`}
            onClick={handleAction}
            disabled={isProcessing}
          >
            {isProcessing ? <ClipLoader color="#fff" size={18} /> : "Go"}
          </motion.button>
        );
      }
    }

    let buttonText = "";
    let buttonClass = "bg-blue-500 hover:bg-blue-600";
    if (task.status === "PENDING") {
      buttonText = task.type === "ADD_LOGO_TO_PROFILE_NAME" ? "Check" : "Go";
      if (task.type === "ADD_LOGO_TO_PROFILE_NAME")
        buttonClass = "bg-yellow-500 hover:bg-yellow-600";
    } else if (task.status === "STARTED") {
      buttonText = "Claim";
      buttonClass = "bg-yellow-500 hover:bg-yellow-600";
    }

    return (
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`${buttonBaseClasses} ${buttonClass}`}
          onClick={
            task.type === "JOIN_TELEGRAM_CHANNEL" && task.status === "PENDING"
              ? handleJoinTelegramClaimReward
              : handleAction
          }
          disabled={isProcessing}
        >
          {isProcessing ? <ClipLoader color="#fff" size={18} /> : buttonText}
        </motion.button>
        {/* {task.type === "JOIN_TELEGRAM_CHANNEL" && task.status === "PENDING" && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`${buttonBaseClasses} bg-yellow-500 hover:bg-yellow-600`}
            onClick={handleJoinTelegramClaimReward}
            disabled={isProcessing}
          >
            {isProcessing ? <ClipLoader color="#fff" size={18} /> : "Check"}
          </motion.button>
        )} */}
      </div>
    );
  };

  return (
    <motion.div variants={itemVariants} layout>
      <div className="bg-white/30 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex justify-between items-center shadow-lg">
        {/* بخش چپ: آیکون و اطلاعات */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex-shrink-0 bg-black/20 rounded-full flex items-center justify-center">
            <img
              src={detectSocialNetwork(task)}
              alt="task icon"
              className="w-8 h-8"
            />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base">
              {task.title[i18n.language]}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <img
                src="/images/coin-gold.png"
                alt="reward"
                className="w-4 h-4"
              />
              <span className="text-sm text-white font-semibold">
                +{Number(task.rewardCoin).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* بخش راست: دکمه یا تیک */}
        <div className="flex-shrink-0">{renderActionButton()}</div>
      </div>
    </motion.div>
  );
};

export default TaskItem;
