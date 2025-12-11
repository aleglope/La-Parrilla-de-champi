"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: string;
  buttonText?: string;
}

/**
 * Modal reutilizable para mostrar información al usuario
 */
export default function InfoModal({
  isOpen,
  onClose,
  title,
  message,
  icon = "ℹ️",
  buttonText = "Entendido",
}: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative glass-card p-8 rounded-2xl max-w-md w-full mx-4 border-2 border-flame-blue/30 shadow-2xl"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-fire-red to-fire-red-dark flex items-center justify-center text-4xl shadow-lg">
                {icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-heading font-black text-center gradient-text mb-4">
              {title}
            </h3>

            {/* Message */}
            <p className="text-ash-300 text-center mb-8 leading-relaxed">
              {message}
            </p>

            {/* Button */}
            <button
              onClick={onClose}
              className="w-full px-6 py-4 bg-gradient-to-r from-flame-blue to-flame-blue-bright text-white rounded-xl font-heading font-bold text-lg hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-flame-blue-bright/30"
            >
              {buttonText}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
