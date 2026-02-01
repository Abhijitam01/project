"use client"
import { Features } from '@/components/Features'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { Navbar } from '@/components/Navbar'
import { Stats } from '@/components/Stats'
import { Testimonials } from '@/components/Testimonials'
import { CTA } from '@/components/CTA'
import { Pricing } from '@/components/Pricing'
import { FAQ } from '@/components/FAQ'
import React from 'react'

const page = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </>
  )
}

export default page