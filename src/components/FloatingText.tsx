import { motion } from "framer-motion";

interface FloatingTextProps {
  text: string;
  x: number;
  y: number;
}

const FloatingText = ({ text, x, y }: FloatingTextProps) => {
  return (
    <motion.div
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{ y: -150, opacity: 0, scale: 1.5 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="absolute text-4xl sm:text-5xl font-bold text-white pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: "translateX(-50%)", // برای اینکه دقیقا وسط کلیک باشه
        textShadow: "0px 2px 10px rgba(255, 255, 255, 0.5)", // یه سایه خوشگل
      }}
    >
      {text}
    </motion.div>
  );
};

export default FloatingText;