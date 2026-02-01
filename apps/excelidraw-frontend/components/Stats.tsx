"use client"

import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, FileText, Clock, Award } from "lucide-react"

const stats = [
  {
    icon: <Users className="h-8 w-8" />,
    value: "10K+",
    label: "Active Users",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <FileText className="h-8 w-8" />,
    value: "50K+",
    label: "Drawings Created",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <Clock className="h-8 w-8" />,
    value: "99.9%",
    label: "Uptime",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: <Award className="h-8 w-8" />,
    value: "4.9/5",
    label: "User Rating",
    color: "from-orange-500 to-red-500",
  },
]

export function Stats() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} mb-4`}>
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  >
                    <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
