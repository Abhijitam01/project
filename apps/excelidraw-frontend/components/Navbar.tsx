import { Button } from "@repo/ui/button"
import Link from "next/link"

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full h-20 px-8 md:px-16 backdrop-blur-md bg-white/70 border-b border-gray-100/50">    
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-xl italic">D</span>
        </div>
        <p className="font-black text-2xl tracking-tight text-black">
            Drawr<span className="text-gray-400">.</span>
        </p>
      </div>

      <div className="flex items-center gap-6">
        <Link href={"/signin"} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
          Sign In
        </Link>
        <Link href={"/signup"}>
          <Button className="rounded-full px-6 bg-black hover:bg-gray-800 text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10">
            Get Started
          </Button>
        </Link>
      </div>
    </nav>
  )
}