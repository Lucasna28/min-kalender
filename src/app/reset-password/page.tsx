"use client";

import { motion, AnimatePresence } from "framer-motion";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
  exit: {
    y: -20,
    opacity: 0,
  },
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-screen overflow-hidden bg-background">
      {/* Grid baggrund */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-t from-background via-background/90 to-background/50" />

      {/* Radial gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#3b82f620,transparent)]" />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key="reset-password-page"
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8"
        >
          {/* Reset password formular container */}
          <motion.div
            variants={containerVariants}
            className="w-full max-w-md mx-auto"
          >
            {/* Logo og header */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center space-y-6 mb-8"
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={80}
                  height={80}
                  className="rounded-2xl shadow-xl"
                />
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-primary/10"
                  animate={{ opacity: [0, 0.2, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              <div className="space-y-2 text-center">
                <motion.h1
                  className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  Nulstil adgangskode
                </motion.h1>
                <motion.p
                  variants={itemVariants}
                  className="text-base text-muted-foreground"
                >
                  Indtast din email for at nulstille din adgangskode
                </motion.p>
              </div>
            </motion.div>

            {/* Reset password form */}
            <motion.div variants={itemVariants}>
              <ResetPasswordForm />
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
