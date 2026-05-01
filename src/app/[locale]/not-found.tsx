"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 overflow-hidden relative">
      {/* Background Abstract Shapes */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl z-0"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          x: [0, 100, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl z-0"
      />

      {/* Main Content */}
      <div className="z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative inline-block"
        >
          <h1 className="text-[150px] md:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-500 drop-shadow-2xl">
            404
          </h1>
          <motion.div
            animate={{
              y: [-10, 10, -10],
              rotate: [-5, 5, -5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-4 -right-8 md:-top-8 md:-right-12 text-6xl md:text-8xl"
          >
            🤔
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6 mt-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-lg">
            It looks like you've ventured into the void. The page you are
            looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full font-semibold shadow-lg shadow-purple-500/30 flex items-center gap-2 mx-auto"
              >
                <Home size={20} />
                Back to Home
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-sm text-gray-400 dark:text-gray-500"
      >
        Error Code: 404
      </motion.p>
    </div>
  );
}
