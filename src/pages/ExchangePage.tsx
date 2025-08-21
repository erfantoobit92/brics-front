import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import styles from "./ExchangePage.module.css";
import {
  Api_Get_Exchange_Status,
  Api_Convert_Currency,
  ConversionDirection,
} from "../api";
import {
  FaCoins,
  FaExchangeAlt,
  FaSpinner,
  FaGoogleWallet,
} from "react-icons/fa";

// ================= TYPE DEFINITIONS =================
interface ExchangeStatusData {
  balance: number;
  bricsBalance: number;
  rate: number; // ۱ بریکس = چقدر بالانس
}

// ================= MAIN EXCHANGE PAGE COMPONENT =================
const ExchangePage: React.FC = () => {
  const [status, setStatus] = useState<ExchangeStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // State برای فرم تبدیل
  const [fromAmount, setFromAmount] = useState<string>("0");
  const [toAmount, setToAmount] = useState<string>("0");
  // پیش‌فرض: کاربر Balance می‌دهد، Brics می‌گیرد
  const [direction, setDirection] = useState<ConversionDirection>(
    ConversionDirection.BALANCE_TO_BRICS
  );
  const [isConverting, setIsConverting] = useState<boolean>(false);

  // واکشی داده‌های اولیه
  const fetchData = useCallback(async () => {
    try {
      const response = await Api_Get_Exchange_Status();
      setStatus(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load exchange data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // افکت برای محاسبه خودکار مقادیر
  useEffect(() => {
    if (!status) return;

    const fromValue = parseFloat(fromAmount) || 0;
    if (direction === ConversionDirection.BALANCE_TO_BRICS) {
      setToAmount((fromValue / status.rate).toFixed(6));
    } else {
      setToAmount((fromValue * status.rate).toFixed(2));
    }
  }, [fromAmount, direction, status]);

  // تابع برای عوض کردن جهت تبدیل (سوییچ کردن ارزها)
  const handleSwapDirection = () => {
    setDirection((prev) =>
      prev === ConversionDirection.BALANCE_TO_BRICS
        ? ConversionDirection.BRICS_TO_BALANCE
        : ConversionDirection.BALANCE_TO_BRICS
    );
    setFromAmount("0"); // ریست کردن مقادیر
  };

  // تابع برای انجام تبدیل
  const handleConvert = async () => {
    const amountToConvert = parseFloat(fromAmount);
    if (!amountToConvert || amountToConvert <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setIsConverting(true);
    try {
      await Api_Convert_Currency(amountToConvert, direction);
      await fetchData(); // رفرش کردن داده‌ها بعد از تبدیل موفق
      setFromAmount("0"); // ریست فرم
      // اینجا میشه یه پیام موفقیت خوشگل نشون داد (مثلاً با react-toastify)
    } catch (err: any) {
      alert(err.response?.data?.message || "Conversion failed.");
    } finally {
      setIsConverting(false);
    }
  };

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} size={50} />
      </div>
    );
  if (error || !status)
    return (
      <div className={styles.errorContainer}>
        {error || "Data not available."}
      </div>
    );

  const fromCurrency =
    direction === ConversionDirection.BALANCE_TO_BRICS ? "Balance" : "Brics";
  const toCurrency =
    direction === ConversionDirection.BALANCE_TO_BRICS ? "Brics" : "Balance";
  const fromBalance =
    direction === ConversionDirection.BALANCE_TO_BRICS
      ? status.balance
      : status.bricsBalance;
  const fromIcon =
    direction === ConversionDirection.BALANCE_TO_BRICS ? (
      <FaGoogleWallet />
    ) : (
      <FaCoins />
    );
  const toIcon =
    direction === ConversionDirection.BALANCE_TO_BRICS ? (
      <FaCoins />
    ) : (
      <FaGoogleWallet />
    );

  function setBalance() {
    setFromAmount(fromBalance.toString());
  }

  return (
    <motion.div
      className={styles.pageContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className={styles.title}>Currency Exchange</h1>
      <p className={styles.rateInfo}>
        Current Rate: 1 <FaCoins /> = {status.rate.toLocaleString()}{" "}
        <FaGoogleWallet />
      </p>

      <div className={styles.converterBox}>
        {/* === بخش "From" === */}
        <div className={styles.currencyInput}>
          <label>From</label>
          <div className={styles.inputRow}>
            {fromIcon}
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
            />
            <span className={styles.currencyName}>{fromCurrency}</span>
          </div>
          <p className={styles.balanceInfo} onClick={setBalance}>
            Available:{" "}
            {fromBalance.toLocaleString(undefined, {
              maximumFractionDigits: 6,
            })}
          </p>
        </div>

        {/* === دکمه سوییچ === */}
        <motion.button
          className={styles.swapButton}
          onClick={handleSwapDirection}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaExchangeAlt />
        </motion.button>

        {/* === بخش "To" === */}
        <div className={styles.currencyInput}>
          <label>To (Estimated)</label>
          <div className={styles.inputRow}>
            {toIcon}
            <input
              type="text"
              value={toAmount}
              readOnly
              className={styles.readOnlyInput}
            />
            <span className={styles.currencyName}>{toCurrency}</span>
          </div>
        </div>

        {/* === دکمه تبدیل === */}
        <motion.button
          className={styles.convertButton}
          onClick={handleConvert}
          disabled={
            isConverting ||
            parseFloat(fromAmount) <= 0 ||
            parseFloat(fromAmount) > fromBalance
          }
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isConverting ? <FaSpinner className={styles.spinner} /> : "Convert"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ExchangePage;
