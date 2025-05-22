
import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/cards/post-card";
import { EventCard } from "@/components/cards/event-card";
import { Post } from "@/lib/mock-data";

interface ProfileTabsProps {
  posts: Post[];
  userEvents: any[];
  isOwnProfile: boolean;
  userName: string;
}

export function ProfileTabs({ posts, userEvents, isOwnProfile, userName }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="posts" className="mt-8">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts" className="mt-6">
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {posts.length === 0 && (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold">No posts yet</h3>
              <p className="text-muted-foreground">
                {isOwnProfile ? "You haven't" : `${userName} hasn't`} posted anything yet
              </p>
              {isOwnProfile && (
                <Button className="mt-4">
                  Create Your First Post
                </Button>
              )}
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="events" className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {userEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          
          {userEvents.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <h3 className="text-lg font-semibold">No upcoming events</h3>
              <p className="text-muted-foreground">
                {isOwnProfile ? "You don't" : `${userName} doesn't`} have any upcoming events
              </p>
              {isOwnProfile && userName === 'promoter' && (
                <Button className="mt-4" asChild>
                  <Link to="/create-event">Create an Event</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="media" className="mt-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {posts
            .filter((post) => post.image)
            .map((post) => (
              <div
                key={post.id}
                className="aspect-square overflow-hidden rounded-md"
              >
                <img
                  src={post.image}
                  alt="Media"
                  className="h-full w-full object-cover transition-transform hover:scale-110"
                />
              </div>
            ))}
          
          {posts.filter((post) => post.image).length === 0 && (
            <div className="col-span-full py-12 text-center">
              <h3 className="text-lg font-semibold">No media yet</h3>
              <p className="text-muted-foreground">
                {isOwnProfile ? "You haven't" : `${userName} hasn't`} posted any photos or videos
              </p>
              {isOwnProfile && (
                <Button className="mt-4">
                  Upload Your First Photo
                </Button>
              )}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
