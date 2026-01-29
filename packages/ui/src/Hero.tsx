"use client"

import { motion } from "motion/react"
import { Button } from "./button"
import { ArrowRight, Sparkles } from "lucide-react"

export const Hero = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-white px-4 pt-16">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full filter blur-[120px] opacity-20"
          animate={{
            x: ["-10%", "10%", "-10%"],
            y: ["-10%", "10%", "-10%"],
            backgroundColor: ["#3b82f6", "#8b5cf6", "#3b82f6"],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "-10%", left: "-10%" }}
        />
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full filter blur-[120px] opacity-20"
          animate={{
            x: ["10%", "-10%", "10%"],
            y: ["10%", "-10%", "10%"],
            backgroundColor: ["#10b981", "#3b82f6", "#10b981"],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "-10%", right: "-10%" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-sm font-medium text-gray-600 mb-8"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>Real-time collaborative drawing</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-black mb-6 leading-tight"
        >
          Draw without <br />
          <span className="text-gray-400">boundaries.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed"
        >
          The simple, powerful, and collaborative canvas for teams to ideate together. 
          No accounts required to start, just open and sketch.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button className="rounded-full px-8 h-14 text-lg bg-black hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10">
            Start Drawing Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button className="rounded-full px-8 h-14 text-lg border-gray-200 bg-white border text-black hover:bg-gray-50 transition-all">
            View Live Demo
          </Button>
        </motion.div>
      </div>

      {/* Preview Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-20 mt-20 w-full max-w-6xl px-4"
      >
        <div className="relative p-2 rounded-[2rem] bg-gray-100/50 border border-gray-200/50 backdrop-blur-sm shadow-2xl overflow-hidden aspect-video">
           <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden relative group">
              <video 
                className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100" 
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/Demo-vid.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
           </div>
        </div>
      </motion.div>
    </div>
  )
}


