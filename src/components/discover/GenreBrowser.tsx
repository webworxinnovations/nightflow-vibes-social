
import { Button } from "@/components/ui/button";
import { GenreFilter } from "@/types/discover";

interface GenreBrowserProps {
  allGenres: string[];
  genreFilter: GenreFilter;
  setGenreFilter: (filter: GenreFilter) => void;
}

export function GenreBrowser({ allGenres, genreFilter, setGenreFilter }: GenreBrowserProps) {
  return (
    <div className="mt-6">
      <h2 className="mb-4 text-xl font-semibold">Browse by Genre</h2>
      <div className="flex flex-wrap gap-2">
        {allGenres.slice(0, 8).map((genre) => (
          <Button 
            key={genre} 
            variant="outline" 
            className={`border-white/10 hover:bg-primary/20 ${genreFilter === genre ? 'bg-primary/20 border-primary' : ''}`}
            onClick={() => setGenreFilter(genre)}
          >
            {genre}
          </Button>
        ))}
      </div>
    </div>
  );
}
