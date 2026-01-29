"use client"
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return (
    <section className="section relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--primary)] opacity-[0.05] blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--primary)] opacity-[0.05] blur-[120px]"></div>
      </div>

      <div className="container text-center max-w-[800px]">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-[var(--foreground)] to-[var(--muted)] bg-clip-text text-transparent">
          Collaborate & Create <br /> in Real-Time
        </h1>
        <p className="text-xl text-[var(--muted)] mb-10 leading-relaxed max-w-[600px] mx-auto">
          The simplest way to draw, brainstorm, and share ideas with your team. No sign up required to jump into a room.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-[500px] mx-auto mb-8 p-1 glass rounded-2xl border border-[var(--border)] overflow-hidden">
          <input
            type="text"
            placeholder="Enter room ID..."
            className="w-full px-6 py-4 bg-transparent outline-none border-none text-[var(--foreground)]"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button
            className="w-full sm:w-auto btn btn-primary px-8 py-4 whitespace-nowrap"
            onClick={() => roomId && router.push(`/room/${roomId}`)}
          >
            Join Room
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-[var(--muted-foreground)]">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--background)] bg-[var(--secondary)] overflow-hidden relative">
                <Image
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                  alt="user"
                  fill
                  sizes="32px"
                />
              </div>
            ))}
          </div>
          <p>Trusted by 10,000+ creators globally</p>
        </div>
      </div>
    </section>
  );
}
