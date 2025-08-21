import { motion } from "framer-motion";

interface FloatingTextProps {
  text: string;
  x: number;
  y: number;
}

const FloatingText = ({ text, x, y }: FloatingTextProps) => {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -80, scale: 1.5 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="absolute text-5xl font-bold text-white pointer-events-none"
      style={{
        left: x,
        top: y,
        textShadow: "0px 2px 10px rgba(255, 223, 77, 0.8)",
      }}
    >
      {text}
    </motion.div>
  );
};

export default FloatingText;
