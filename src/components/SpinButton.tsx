// src/components/SpinButtonWithImage.jsx

const SpinButtonWithImage = ({ onClick }: any) => {
  return (
    // کانتینر اصلی برای قرارگیری در گوشه صفحه
    <div className="spin-button-container">
      <div className="spinning-border">
        <button
          onClick={onClick}
          className="spin-button-inner"
          aria-label="Spin to Win"
        >
          <img
            src="/images/spin.png" // آدرس تصویر را چک کنید صحیح باشد
            alt="Spin"
            className="spin-button-image"
          />
        </button>
      </div>
    </div>
  );
};

export default SpinButtonWithImage;
