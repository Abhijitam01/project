import { Button } from "./ui/button"
import Link from "next/link"

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between w-full h-16 px-8 md:px-12 py-2 bg-background/80 backdrop-blur-md border-b border-border/50">    
      <Link href="/" className="flex items-center">
        <p className="text-xl font-extrabold text-foreground">
          Sketchy<span className="text-muted-foreground">.io</span>
        </p>
      </Link>

      <div className="flex gap-3">
        <Link href="/signup">
          <Button variant="ghost" size="sm">Sign Up</Button>
        </Link>
        <Link href="/signin">
          <Button size="sm">Sign In</Button>
        </Link>
      </div>
    </nav>
  )
}