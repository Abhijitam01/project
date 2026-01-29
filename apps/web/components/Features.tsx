"use client";

const features = [
  {
    title: "Real-time Collaboration",
    description: "Draw with your team in real-time. Changes are synced instantly across all participants.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: "Infinite Canvas",
    description: "Never run out of space. Our infinite canvas lets you map out your biggest ideas without limits.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
  },
  {
    title: "Instant Export",
    description: "Export your drawings to high-quality PNG, SVG, or PDF formats with just a single click.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section id="features" className="section bg-[var(--accent)]">
      <div className="container text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for creators, by creators</h2>
        <p className="text-[var(--muted)] max-w-[600px] mx-auto">
          Everything you need to visualize your ideas and collaborate with your team in one simple yet powerful tool.
        </p>
      </div>
      <div className="container grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="p-8 rounded-2xl bg-[var(--background)] border border-[var(--border)] hover:shadow-xl hover:shadow-[var(--primary)]/5 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-[var(--muted)] leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
