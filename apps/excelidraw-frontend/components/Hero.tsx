"use client"

import { motion } from "motion/react"
import { Button } from "@repo/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export const Hero = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-background via-background to-background/50">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full filter blur-3xl opacity-30"
        animate={{
          x: ["-20%", "20%", "-20%"],
          y: ["-20%", "20%", "-20%"],
          backgroundColor: ["#06b6d4", "#8b5cf6", "#06b6d4"],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 20,
          ease: "easeInOut",
        }}
        style={{
          top: "-30%",
          left: "-15%",
        }}
      />
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full filter blur-3xl opacity-30"
        animate={{
          x: ["20%", "-20%", "20%"],
          y: ["20%", "-20%", "20%"],
          backgroundColor: ["#3b82f6", "#10b981", "#3b82f6"],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 25,
          ease: "easeInOut",
        }}
        style={{
          bottom: "-20%",
          right: "-10%",
        }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full filter blur-3xl opacity-30"
        animate={{
          x: ["-10%", "10%", "-10%"],
          y: ["10%", "-10%", "10%"],
          backgroundColor: ["#f472b6", "#fbbf24", "#f472b6"],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 22,
          ease: "easeInOut",
        }}
        style={{
          top: "50%",
          left: "50%",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center max-w-6xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Real-time Collaboration Platform</span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
            Ideate.
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Collaborate.
          </span>
          <br />
          <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
            Create.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-10 leading-relaxed"
        >
          Transform your ideas into reality with our powerful collaborative drawing platform. 
          Work together in real-time, share instantly, and bring your creative vision to life.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8 py-6 group">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </Link>
        </motion.div>

        {/* Demo Video/Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="w-full max-w-5xl"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary/20 backdrop-blur-sm bg-black/20">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-purple-500/20 pointer-events-none" />
            <video 
              width="100%" 
              height="100%" 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-auto"
            >
              <source src="/Demo-vid.mp4" type="video/mp4" />
            </video>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  )
}
