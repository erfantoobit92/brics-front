// src/components/TapPageSkeleton.tsx

import { FaBolt } from "react-icons/fa6";

// یک کامپوننت کمکی کوچک برای هر بلاک اسکلتون
// این کامپوننت انیمیشن براق رو هندل می‌کنه
const ShimmerBlock = ({ className }: { className: string }) => (
  <div
    className={`${className} relative overflow-hidden bg-gray-700/50 rounded-lg`}
  >
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
  </div>
);

const TapPageSkeleton = () => {
  return (
    <div
      className="relative w-full h-full flex flex-col justify-between items-center text-white overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url('/images/bg.png')` }}
    >
      {/* هدر اسکلتون */}
      <header className="w-full flex justify-between items-center p-4 z-10">
        <div className="flex items-center gap-2">
          <ShimmerBlock className="w-10 h-10 !rounded-full" />
          <ShimmerBlock className="w-24 h-5" />
        </div>
        <ShimmerBlock className="w-28 h-10 !rounded-full" />
      </header>

      {/* بخش اصلی اسکلتون */}
      <main className="flex-grow flex flex-col items-center justify-center pt-4 gap-5 z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ShimmerBlock className="w-12 h-12 !rounded-full" />
          <ShimmerBlock className="w-40 h-12" />
        </div>
        <ShimmerBlock className="w-64 h-64 sm:w-80 sm:h-80 !rounded-full" />
      </main>

      {/* فوتر اسکلتون */}
      <footer className="w-full flex flex-col items-center p-4 pb-20 z-10">
        <div className="w-full max-w-sm">
          {/* نوار انرژی */}
          <div className="flex justify-center items-center gap-2 mb-3">
            <FaBolt className="text-gray-600" size={24} />
            <ShimmerBlock className="w-20 h-6" />
          </div>
          <ShimmerBlock className="w-full h-4 rounded-full" />

          {/* بخش پایینی فوتر */}
          <div className="flex justify-between items-center mt-4 mb-8">
            <ShimmerBlock className="w-16 h-16 !rounded-full" />
            <div className="flex flex-col items-end gap-1">
              <ShimmerBlock className="w-24 h-4" />
              <ShimmerBlock className="w-24 h-2 !rounded-full" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TapPageSkeleton;