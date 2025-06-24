
import { Button } from "@/components/ui/button";

export const TrendingGenresSidebar = () => {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-white drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]">Trending Genres</h2>
      <div className="space-y-2">
        {['House', 'Techno', 'Hip-Hop', 'Drum & Bass', 'Trance'].map((genre) => (
          <Button 
            key={genre} 
            variant="outline" 
            className="w-full justify-start border-teal-400/30 bg-slate-800/60 text-slate-200 text-left hover:bg-teal-500/20 hover:border-teal-400/50 hover:text-white transition-all duration-300"
          >
            #{genre}
          </Button>
        ))}
      </div>
    </div>
  );
};
