import React, { useState, useEffect } from "react";
import TaskItem from "../components/TaskItem";
import { motion, AnimatePresence } from "framer-motion";
import { ClipLoader } from "react-spinners"; // یا هر لودر دیگه‌ای
import { Toaster } from "react-hot-toast";
import { Api_Get_Tasks } from "../api";

// انیمیشن برای کل لیست
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // هر آیتم با 0.1 ثانیه تاخیر وارد میشه
    },
  },
};

const TasksPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await Api_Get_Tasks();
      const sortedTasks = response.data.sort((a: any, b: any) => {
        if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
        if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
        return b.rewardCoin - a.rewardCoin; // تسک‌های با جایزه بیشتر بالاتر
      });
      setTasks(sortedTasks);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-3xl font-bold text-center text-white mb-6 tracking-wider">
        Earn More Coins
      </h1>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <ClipLoader color="#4A90E2" size={50} />
        </div>
      )}

      {error && !loading && (
        <div className="text-center text-red-400 mt-10">{error}</div>
      )}

      {!loading && !error && (
        <motion.div
          className="space-y-4"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} onTaskUpdate={fetchTasks} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default TasksPage;
