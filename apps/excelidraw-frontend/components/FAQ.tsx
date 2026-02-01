"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How does real-time collaboration work?",
    answer: "Our platform uses WebSocket technology to enable real-time synchronization between all users in a room. Every drawing action is instantly transmitted to all participants, ensuring everyone sees the same canvas at the same time.",
  },
  {
    question: "Can I export my drawings?",
    answer: "Yes! Free users can export to PNG format, while Pro and Enterprise users have access to multiple formats including SVG, PDF, and JSON. You can also share drawings via a public link.",
  },
  {
    question: "Is there a limit to the number of collaborators?",
    answer: "Free plans support up to 5 simultaneous collaborators per room. Pro plans support up to 50, and Enterprise plans have no limits. All plans support unlimited viewers.",
  },
  {
    question: "How secure is my data?",
    answer: "We take security seriously. All data is encrypted in transit and at rest. Enterprise plans include additional security features like SSO, advanced permissions, and on-premise deployment options.",
  },
  {
    question: "Can I use this for commercial projects?",
    answer: "Absolutely! All our plans, including the free tier, can be used for commercial projects. Pro and Enterprise plans offer additional features specifically designed for business use.",
  },
  {
    question: "What happens if I exceed my plan limits?",
    answer: "We'll notify you when you're approaching your limits. You can upgrade at any time, and we'll prorate the charges. Your existing rooms and data will remain accessible.",
  },
]

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border-b border-primary/10 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-primary transition-colors"
      >
        <span className="text-lg font-semibold pr-8">{question}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-muted-foreground leading-relaxed">{answer}</p>
      </motion.div>
    </motion.div>
  )
}

export function FAQ() {
  return (
    <section className="relative py-24 overflow-hidden">
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
              Frequently Asked
            </span>{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Excelidraw
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a href="mailto:support@excelidraw.com" className="text-primary hover:underline">
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
