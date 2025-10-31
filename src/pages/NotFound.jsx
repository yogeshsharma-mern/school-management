import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 via-white to-yellow-50 text-gray-800 px-6">
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
        className="bg-yellow-400/20 p-6 rounded-full mb-6 shadow-lg"
      >
        <GraduationCap size={80} className="text-yellow-500" />
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-6xl font-extrabold text-yellow-500 tracking-tight drop-shadow-sm"
      >
        404
      </motion.h1>

      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-semibold mt-2"
      >
        Oops! Page Not Found
      </motion.h2>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-gray-600 text-center max-w-md leading-relaxed"
      >
        It looks like you’ve taken a wrong turn in the campus.  
        The page you’re looking for doesn’t exist or might have been moved.
      </motion.p>

      {/* Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/admin/dashboard")}
        className="mt-8 cursor-pointer flex items-center gap-2 bg-yellow-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-md hover:bg-yellow-600 transition-all duration-200"
      >
        <Home size={20} />
        Back to Dashboard
      </motion.button>

      {/* Subtext */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-2 text-sm text-gray-500 mt-6"
      >
        <AlertTriangle size={16} />
        <span>School Management Admin Portal</span>
      </motion.div>
    </div>
  );
}
