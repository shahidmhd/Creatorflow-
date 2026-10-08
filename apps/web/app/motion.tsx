"use client";

import { motion } from "framer-motion";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function MotionBars({ values }: { values: number[] }) {
  return (
    <>
      {values.map((height, index) => (
        <motion.div
          key={index}
          className="flex-1 rounded-t bg-navy"
          initial={{ height: 0 }}
          whileInView={{ height: `${height}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: index * 0.045, ease: "easeOut" }}
          style={{ opacity: 0.45 + index / 20 }}
        />
      ))}
    </>
  );
}
