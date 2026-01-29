"use client"
import { Features } from '@repo/ui/Features'
import { Footer } from '@repo/ui/Footer'
import { Hero } from '@repo/ui/Hero'
import { Navbar } from '@repo/ui/Navbar'
import { useUser } from '@/hooks/useUser'
import React from 'react'

const page = () => {


  return (
      <>
      <Navbar />
      <Hero />
      <Features />
      <Footer />
      </>
  )
}

export default page