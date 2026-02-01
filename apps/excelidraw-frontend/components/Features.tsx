"use client"

import { motion } from "motion/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PenTool, Share2, Users, Layers, Zap, Lock, Globe, Palette } from "lucide-react"

const features = [
  {
    icon: <PenTool className="h-10 w-10" />,
    title: "Intuitive Drawing Tools",
    description: "Professional-grade pens, shapes, and text tools for quick sketches and detailed diagrams.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Share2 className="h-10 w-10" />,
    title: "Real-time Collaboration",
    description: "Work together with your team in real-time, no matter where they are in the world.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <Users className="h-10 w-10" />,
    title: "Multi-User Editing",
    description: "Multiple users can edit the same drawing simultaneously with live cursors.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: <Layers className="h-10 w-10" />,
    title: "Infinite Canvas",
    description: "Unlimited space to bring your ideas to life with smooth pan and zoom.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: <Zap className="h-10 w-10" />,
    title: "Lightning Fast",
    description: "Optimized for speed and responsiveness, even with complex drawings.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: <Lock className="h-10 w-10" />,
    title: "Secure & Private",
    description: "Your drawings are encrypted and stored securely with enterprise-grade security.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: <Globe className="h-10 w-10" />,
    title: "Share Anywhere",
    description: "Export and share your creations with anyone, anywhere, in multiple formats.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: <Palette className="h-10 w-10" />,
    title: "Rich Customization",
    description: "Customize colors, styles, and themes to match your brand and preferences.",
    color: "from-pink-500 to-rose-500",
  },
]

export function Features() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-background/50 to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Powerful Features for
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Your Creativity
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to collaborate, create, and share your ideas with the world
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group h-full bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader>
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4 w-fit`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
