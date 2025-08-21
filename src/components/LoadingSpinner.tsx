const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen w-full bg-gray-900">
      <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-yellow-400"></div>
    </div>
  );
};

export default LoadingSpinner;
