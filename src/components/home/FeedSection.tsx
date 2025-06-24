
import { PostCard } from "@/components/cards/post-card";
import { posts } from "@/lib/mock-data";

export const FeedSection = () => {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-white drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]">Your Feed</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
