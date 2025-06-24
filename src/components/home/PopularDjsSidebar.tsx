
import { UserCard } from "@/components/cards/user-card";
import { users } from "@/lib/mock-data";

export const PopularDjsSidebar = () => {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-white drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]">Popular DJs</h2>
      <div className="space-y-4">
        {users
          .filter((user) => user.role === 'dj')
          .slice(0, 3)
          .map((dj) => (
            <UserCard key={dj.id} user={dj} />
          ))}
      </div>
    </div>
  );
};
