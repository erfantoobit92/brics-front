import { useState, useEffect } from "react";
import TaskItem from "../components/TaskItem";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next"; 

import { Api_Get_Tasks } from "../api";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const TasksPage = () => {
  const { t } = useTranslation();

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  let didfetchData = false;
  const fetchTasks = async () => {
    if (didfetchData) return;
    didfetchData = true;

    try {
      setLoading(true);
      const response = await Api_Get_Tasks();
      const sortedTasks = response.data.sort((a: any, b: any) => {
        if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
        if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
        return b.rewardCoin - a.rewardCoin;
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
    <div
      className="w-full h-full bg-cover bg-center text-white overflow-hidden"
      style={{ backgroundImage: `url('/images/bg.png')` }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col p-4 !overflow-y-auto scroll-hidden h-[calc(100%-110px)]">
        {/* ========== هدر صفحه با انیمیشن ========== */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-shrink-0 flex flex-col items-center text-center mb-6"
        >
          <img src="/images/coin.png" alt="Brics" className="w-24 h-24" />
          <h1 className="text-4xl font-bold mt-2">
            {t("earn_more_brics")} {/* <<-- متن ترجمه شده */}
          </h1>
        </motion.header>

        {/* ========== محتوای اصلی (لیست تسک‌ها) ========== */}
        <main className="flex-grow">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <ClipLoader color="#EAB308" size={50} />
            </div>
          )}

          {error && !loading && (
            <div className="text-center text-red-400 mt-10">{error}</div>
          )}

          {!loading && !error && (
            // اینجا می‌تونی تسک‌ها رو به دسته‌های مختلف تقسیم کنی
            // فعلا همشون رو زیر یک عنوان میاریم
            <section>
              <h2 className="text-xl font-semibold mb-3">{t("all_tasks")}</h2>
              <motion.div
                className="space-y-3 "
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onTaskUpdate={fetchTasks}
                  />
                ))}
              </motion.div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default TasksPage;
