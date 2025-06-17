
import { UserCard } from "@/components/cards/user-card";
import { User } from "@/lib/mock-data";

interface UsersContentProps {
  filteredUsers: User[];
}

export function UsersContent({ filteredUsers }: UsersContentProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {filteredUsers.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
      
      {filteredUsers.length === 0 && (
        <div className="col-span-full py-12 text-center">
          <h3 className="text-lg font-semibold">No matches found</h3>
          <p className="text-muted-foreground">
            Try different filters or search terms
          </p>
        </div>
      )}
    </div>
  );
}
