
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";

export const TipDropCard = () => {
  return (
    <GlassmorphicCard className="bg-slate-800/90 border-teal-400/40 backdrop-blur-xl">
      <h3 className="mb-2 text-lg font-semibold text-white drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]" style={{
        background: 'linear-gradient(45deg, #14b8a6, #06b6d4, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 6px rgba(20, 184, 166, 0.6))'
      }}>TipDrop</h3>
      <p className="text-sm text-slate-300 mb-4 leading-relaxed">
        Request songs from your favorite DJs and support them with tips.
      </p>
      <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-400/30 transition-all duration-300">
        Learn More
      </Button>
    </GlassmorphicCard>
  );
};
