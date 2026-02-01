"use client"

import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Designer",
    company: "TechCorp",
    avatar: "SJ",
    content: "This platform has revolutionized how our design team collaborates. The real-time features are incredible!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Engineering Manager",
    company: "StartupXYZ",
    avatar: "MC",
    content: "Best collaborative drawing tool we've used. The infinite canvas and smooth performance are game-changers.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "UX Researcher",
    company: "DesignHub",
    avatar: "ER",
    content: "Intuitive, fast, and powerful. Our team can't imagine working without it now.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-4">
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
              Loved by
            </span>{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Creators
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our users have to say about their experience
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-lg mb-6 text-foreground/90">
                    &quot;{testimonial.content}&quot;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}`} />
                      <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
