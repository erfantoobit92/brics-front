import { useEffect, useState, type JSX } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
// import { useUserStore } from "../store/userStore"; // فرض بر استفاده از Zustand برای بالانس
import {
  FiGlobe,
  FiTwitter,
  FiYoutube,
  FiCheckCircle,
  FiLink,
  FiDollarSign,
  FiPlusCircle,
} from "react-icons/fi";
import { FaTelegramPlane, FaBone, FaTelegram } from "react-icons/fa"; // مثال برای لوگو کنار اسم
import { ClipLoader } from "react-spinners";
import {
  Api_Claim_Task_Reward,
  Api_Connect_User_Wallet,
  Api_Start_Task,
} from "../api";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useAppContext } from "../context/AppContext";
import { useTonWallet, useTonConnectUI } from "@tonconnect/ui-react"; // useTonConnectUI رو اضافه کن
import { shareStory, init } from "@telegram-apps/sdk-react";
import { Telegram_Bot_Username } from "../constants";

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

const taskIcons: Record<TaskType, JSX.Element> = {
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
  const { user, setUser } = useAppContext();

  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI(); // هوک اصلی برای ارسال تراکنش

  // این هوک به تغییرات اتصال کیف پول گوش میده
  useEffect(() => {
    const handleConnection = async () => {
      console.log("user?.walletAddress", user?.walletAddress);

      if (
        wallet &&
        task.type === "CONNECT_WALLET" &&
        user?.walletAddress == null
      ) {
        // کیف پول با موفقیت متصل شد!
        const address = wallet.account.address;
        console.log("Wallet connected:", address);
        toast.success("Wallet connected!");

        try {
          // حالا آدرس رو به بک‌اند می‌فرستیم
          const response = await Api_Connect_User_Wallet(address);

          // اگر تسک "اتصال کیف پول" جایزه داشت، بک‌اند اون رو برمی‌گردونه
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

          //   setWalletAddress(address); // آدرس رو در state گلوبال ذخیره می‌کنیم
          // onWalletConnected(); // به کامپوننت پدر (مثلاً صفحه تسک‌ها) اطلاع میدیم که لیست رو رفرش کنه
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

  console.log(wallet);

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      // --- منطق هوشمند بر اساس نوع و وضعیت تسک ---

      // اگر تسک در حالت PENDING باشه
      if (task.status === "PENDING") {
        // تسک‌هایی که فقط نیاز به "چک کردن" دارن و "شروع" ندارن
        if (task.type === "ADD_LOGO_TO_PROFILE_NAME") {
          await Api_Claim_Task_Reward(task.id);
          toast.success(`+${task.rewardCoin.toLocaleString()}! Task Verified.`);
          //   updateUserBalance(response.data.newBalance);
          onTaskUpdate();
          return;
        }

        if (task.type === "JOIN_TELEGRAM_CHANNEL") {
          window.open(
            `https://t.me/${(task.metadata.channelId as String).slice(
              1,
              task.metadata.channelId.length
            )}`
          );
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
        await Api_Claim_Task_Reward(task.id);
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

  const handleAddTokenToWallet = async () => {
    // const tokenddress = "0x278a5B50c34506bc8e15C8567136292c30C92CD1";
    // const symbol = "BCT";
    // const decimals = 9;

    // // ساختن deeplink
    // const link = `https://metamask.app.link/add-token?address=${tokenddress}&symbol=${symbol}&decimals=${decimals}`;

    // window.location.href = link;

    // return;

    const tokenAddress = task.metadata.tokenAddress;
    const tokenSymbol = task.metadata.tokenSymbol;
    const tokenDecimals = task.metadata.tokenDecimals;
    const tokenImage = task.metadata.tokenImage;

    // 1. اول چک می‌کنیم که آیا کیف پول متصل (مثل متامسک) در مرورگر وجود داره یا نه
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
      // 3. درخواست wallet_watchAsset رو به کیف پول ارسال کن
      const wasAdded = await (window as any).ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // برای توکن‌های BEP-20 هم از همین نوع استفاده میشه
          options: {
            address: tokenAddress, // آدرس کانترکت توکن
            symbol: tokenSymbol, // سیمبل توکن (مثلا BRICS)
            decimals: tokenDecimals, // تعداد اعشار (مثلا 18)
            image: tokenImage, // URL تصویر لوگوی توکن (خیلی مهمه!)
          },
        },
      });

      if (wasAdded) {
        // 4. اگر کاربر توکن رو با موفقیت اضافه کرد
        toast.success(
          "Token added successfully! You can now claim your reward."
        );

        // تسک رو به حالت STARTED در بیار
        await Api_Start_Task(task.id);
        onTaskUpdate(); // لیست تسک‌ها رو رفرش کن تا دکمه Claim ظاهر بشه
      } else {
        // اگر کاربر پنجره رو بست یا عملیات موفق نبود
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

    // 1. اطلاعات تراکنش رو از metadata تسک بخون
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // تراکنش تا 10 دقیقه معتبره
      messages: [
        {
          address: task.metadata.toAddress, // آدرس کیف پول پروژه
          amount: (task.metadata.amount * 1e9).toString(), // مقدار به nanoton
          // payload: 'optional-comment' // می‌تونی یک کامنت هم بفرستی
        },
      ],
    };

    try {
      // 2. پنجره تایید تراکنش رو در کیف پول کاربر باز کن
      await tonConnectUI.sendTransaction(transaction);

      // 3. به کاربر اطلاع بده که تراکنش ارسال شده و باید صبر کنه
      toast.success(
        "Transaction sent! Please wait for blockchain confirmation before claiming."
      );

      // 4. تسک رو به حالت STARTED در بیار
      await Api_Start_Task(task.id);
      onTaskUpdate(); // لیست تسک‌ها رو رفرش کن تا دکمه Claim ظاهر بشه
    } catch (error: any) {
      console.log("Transaction error:", error);
      // خطاهایی مثل رد کردن توسط کاربر (UserRejectsError) اینجا میفتن
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
    await Api_Claim_Task_Reward(task.id);
    setIsProcessing(false);
    toast.success(`+${task.rewardCoin.toLocaleString()}! Task Verified.`);
    onTaskUpdate();
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

  const renderActionButton = () => {
    if (task.type === "CONNECT_WALLET") {
      // اگر کیف پول وصل باشه، تسک رو تکمیل شده نشون میدیم
      if (wallet || task.status === "COMPLETED") {
        return (
          <div className="flex items-center space-x-2 text-green-400 font-semibold">
            <FiCheckCircle size={20} />
            <span>Connected</span>
          </div>
        );
      }
      // اگر وصل نباشه، دکمه اتصال TON Connect رو نشون میدیم
      return <TonConnectButton />;
    }

    if (task.status === "COMPLETED") {
      return (
        <div className="flex items-center space-x-2 text-green-400 font-semibold">
          <FiCheckCircle size={20} />
          <span>Done</span>
        </div>
      );
    }

    if (task.type === "POST_TELEGRAM_STORY") {
      return (
        <motion.button
          // ... (انیمیشن‌های دکمه)
          className="bg-pink-500 hover:bg-pink-600 text-white ..."
          onClick={handlePostStory}
          disabled={isProcessing}
        >
          {isProcessing ? "Waiting..." : "Post Story"}
        </motion.button>
      );
    }

    if (task.type === "ON_CHAIN_TRANSACTION") {
      if (task.status === "PENDING") {
        return (
          <motion.button
            // ... (انیمیشن‌های دکمه)
            className="bg-green-600 hover:bg-green-700 text-white ..."
            onClick={handleSendTransaction}
            disabled={isProcessing}
          >
            {isProcessing ? "Waiting..." : "Send Transaction"}
          </motion.button>
        );
      }
      if (task.status === "STARTED") {
        // بعد از ارسال تراکنش، دکمه Claim ظاهر میشه
        return (
          <motion.button
            // ... (انیمیشن‌های دکمه)
            className="bg-yellow-500 hover:bg-yellow-600 text-white ..."
            onClick={handleAction} // از تابع عمومی برای claim استفاده می‌کنه
            disabled={isProcessing}
          >
            {isProcessing ? "Checking..." : "Claim"}
          </motion.button>
        );
      }
    }

    if (task.type === "ADD_TOKEN_TO_WALLET") {
      if (task.status === "PENDING") {
        return (
          <motion.button
            // ... (انیمیشن‌های دکمه)
            className="bg-purple-600 hover:bg-purple-700 text-white ..."
            onClick={handleAddTokenToWallet}
            disabled={isProcessing}
          >
            {isProcessing ? "Waiting..." : "Add Token"}
          </motion.button>
        );
      }
      if (task.status === "STARTED") {
        // بعد از اضافه کردن توکن، دکمه Claim ظاهر میشه
        return (
          <motion.button
            // ... (انیمیشن‌های دکمه)
            className="bg-yellow-500 hover:bg-yellow-600 text-white ..."
            onClick={handleAction} // از تابع عمومی برای claim استفاده می‌کنه
            disabled={isProcessing}
          >
            {isProcessing ? "Checking..." : "Claim"}
          </motion.button>
        );
      }
    }

    // دکمه‌ها بر اساس نوع و وضعیت
    let buttonText = "";
    let buttonClass = "bg-blue-500 hover:bg-blue-600";

    if (task.status === "PENDING") {
      switch (task.type) {
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
      <div className="flex">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`text-white font-bold py-2 px-5 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}
          onClick={handleAction}
          disabled={isProcessing}
        >
          {isProcessing ? <ClipLoader color="#fff" size={20} /> : buttonText}
        </motion.button>
        {task.type === "JOIN_TELEGRAM_CHANNEL" ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`text-white font-bold py-2 px-5 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}
            onClick={handleJoinTelegramClaimReward}
            disabled={isProcessing}
          >
            {isProcessing ? <ClipLoader color="#fff" size={20} /> : "Check"}
          </motion.button>
        ) : (
          <></>
        )}
      </div>
    );
  };

  return (
    <motion.div
      variants={itemVariants}
      layout // این باعث انیمیشن روان هنگام حذف آیتم میشه
    >
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-4 rounded-2xl flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">
            {taskIcons[task.type as TaskType] || <FiGlobe />}
          </div>
          <div>
            <h3 className="font-bold text-white text-md">{task.title.en}</h3>
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
