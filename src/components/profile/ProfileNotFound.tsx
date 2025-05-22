
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function ProfileNotFound() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Profile not found</h2>
        <p className="mt-2 text-muted-foreground">
          The profile you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/discover">Discover DJs</Link>
        </Button>
      </div>
    </div>
  );
}
