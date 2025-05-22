
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Button } from "@/components/ui/button";

interface EventLocationProps {
  venue: string;
  address: string;
}

export function EventLocation({ venue, address }: EventLocationProps) {
  return (
    <GlassmorphicCard>
      <h2 className="text-xl font-semibold">Venue Information</h2>
      <div className="mt-4">
        <h3 className="font-medium">{venue}</h3>
        <p className="text-muted-foreground">{address}</p>
      </div>
      
      <div className="mt-4 h-64 w-full overflow-hidden rounded-md bg-muted">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          Map would be displayed here
        </div>
      </div>
      
      <div className="mt-4">
        <Button className="w-full sm:w-auto">Get Directions</Button>
      </div>
    </GlassmorphicCard>
  );
}
