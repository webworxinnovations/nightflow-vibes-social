
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { users, events, getDjById, getPostsByUser } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { SongRequestModal } from "@/components/tipdrop/song-request-modal";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileNotFound } from "@/components/profile/ProfileNotFound";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // If no ID is provided in the URL, show the current user's profile
  const profileId = id || currentUser?.id;
  
  // Redirect to login if trying to view personal profile without being logged in
  useEffect(() => {
    if (!id && !currentUser) {
      navigate("/signup", { replace: true });
    }
  }, [id, currentUser, navigate]);
  
  const [user, setUser] = useState(getDjById(profileId || "1"));
  const [posts, setPosts] = useState(getPostsByUser(profileId || "1"));
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing || false);
  const [followerCount, setFollowerCount] = useState(user?.followers || 0);
  const [isSongRequestOpen, setIsSongRequestOpen] = useState(false);
  
  useEffect(() => {
    if (profileId) {
      const userData = getDjById(profileId);
      const userPosts = getPostsByUser(profileId);
      setUser(userData);
      setPosts(userPosts);
      setIsFollowing(userData?.isFollowing || false);
      setFollowerCount(userData?.followers || 0);
    }
  }, [profileId]);
  
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1);
  };
  
  // If viewing your own profile, you should be able to edit it
  const isOwnProfile = currentUser && profileId === currentUser.id;
  
  if (!user) {
    return <ProfileNotFound />;
  }
  
  // Filter upcoming events for this user
  const userEvents = events.filter((event) => 
    event.lineup.some((dj) => dj.id === user.id) ||
    (event.promoter && event.promoter.id === user.id)
  );

  // Initialize the user object with the needed properties
  if (!user.similarDjs) {
    // Setup similar DJs for the sidebar
    user.similarDjs = users
      .filter((u) => u.id !== user.id && u.role === 'dj')
      .slice(0, 3);
  }
  
  // Add events property to user for the info component if it doesn't exist
  if (!user.events) {
    user.events = userEvents;
  }
  
  return (
    <div>
      <ProfileHeader 
        user={user} 
        isOwnProfile={isOwnProfile} 
        isFollowing={isFollowing} 
        handleFollow={handleFollow}
      />
      
      {/* Profile Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <ProfileInfo user={user} followerCount={followerCount} />
          
          <ProfileTabs
            posts={posts}
            userEvents={userEvents}
            isOwnProfile={isOwnProfile}
            userName={user.name}
          />
        </div>
        
        <div>
          <ProfileSidebar 
            user={user}
            isOwnProfile={isOwnProfile}
            events={events}
            isSongRequestOpen={isSongRequestOpen}
            setIsSongRequestOpen={setIsSongRequestOpen}
          />
        </div>
      </div>
      
      {/* Song Request Modal */}
      {user && !isOwnProfile && (
        <SongRequestModal
          isOpen={isSongRequestOpen}
          onClose={() => setIsSongRequestOpen(false)}
          dj={user}
        />
      )}
    </div>
  );
}
