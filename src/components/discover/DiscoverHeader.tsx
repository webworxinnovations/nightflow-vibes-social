
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface DiscoverHeaderProps {
  isCreatorRole: boolean;
}

export function DiscoverHeader({ isCreatorRole }: DiscoverHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Discover</h1>
      
      {/* Show Add Event button only for creator roles */}
      {isCreatorRole && (
        <Link to="/create-event">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </Link>
      )}
    </div>
  );
}
