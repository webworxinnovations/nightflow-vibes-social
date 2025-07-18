
import { UserCard } from "@/components/cards/user-card";
import { User } from "@/lib/mock-data";

interface EventLineupProps {
  lineup: User[];
}

export function EventLineup({ lineup }: EventLineupProps) {
  return (
    <>
      <h2 className="mb-4 text-xl font-semibold">Event Lineup</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {lineup.map((dj) => (
          <UserCard key={dj.id} user={dj} />
        ))}
      </div>
    </>
  );
}
