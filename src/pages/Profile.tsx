
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SongRequestModal } from "@/components/tipdrop/song-request-modal";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileNotFound } from "@/components/profile/ProfileNotFound";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, profile: currentProfile } = useSupabaseAuth();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isSongRequestOpen, setIsSongRequestOpen] = useState(false);
  
  // If no ID is provided in the URL, show the current user's profile
  const profileUsername = id || currentProfile?.username;
  
  // Redirect to login if trying to view personal profile without being logged in
  useEffect(() => {
    if (!id && !currentUser) {
      navigate("/auth", { replace: true });
    }
  }, [id, currentUser, navigate]);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileUsername) {
        setLoading(false);
        return;
      }

      try {
        // Fetch profile by username
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', profileUsername)
          .single();

        if (error || !profileData) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } else {
          setProfile(profileData);
          setFollowerCount(profileData.follower_count || 0);
          
          // Check if current user is following this profile
          if (currentUser && currentUser.id !== profileData.id) {
            const { data: followData } = await supabase
              .from('follows')
              .select('id')
              .eq('follower_id', currentUser.id)
              .eq('following_id', profileData.id)
              .single();
            
            setIsFollowing(!!followData);
          }
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileUsername, currentUser]);
  
  const handleFollow = async () => {
    if (!currentUser || !profile) return;

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id);
        
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: profile.id
          });
        
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  };
  
  const handleUpdateProfile = async (profileData: any) => {
    if (!profile || !currentUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.name,
          bio: profileData.bio,
          location: profileData.location
        })
        .eq('id', currentUser.id);

      if (!error) {
        setProfile({
          ...profile,
          full_name: profileData.name,
          bio: profileData.bio,
          location: profileData.location
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  // If viewing your own profile, you should be able to edit it
  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <ProfileNotFound />;
  }

  // Convert profile to expected format for existing components
  const userForComponents = {
    id: profile.id,
    name: profile.full_name || profile.username,
    username: profile.username,
    avatar: profile.avatar_url,
    bio: profile.bio,
    location: profile.location,
    role: profile.role,
    isLive: false, // You can implement this based on streams table
    coverImage: null,
    genres: [], // You can add this field to profiles table if needed
    followers: followerCount,
    following: profile.following_count,
    events: [],
    similarDjs: []
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
      <div className="relative">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative z-10 p-6">
          <ProfileHeader 
            user={userForComponents} 
            isOwnProfile={isOwnProfile} 
            isFollowing={isFollowing} 
            handleFollow={handleFollow}
            updateUserProfile={isOwnProfile ? handleUpdateProfile : undefined}
          />
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <ProfileInfo user={userForComponents} followerCount={followerCount} />
              
              <ProfileTabs
                posts={[]} // You'll need to implement posts fetching
                userEvents={[]} // You'll need to implement events fetching
                isOwnProfile={isOwnProfile}
                userName={userForComponents.name}
                onCreatePost={undefined} // Implement if needed
                onDeletePost={undefined} // Implement if needed
              />
            </div>
            
            <div>
              <ProfileSidebar 
                user={userForComponents}
                isOwnProfile={isOwnProfile}
                events={[]} // You'll need to implement events fetching
                isSongRequestOpen={isSongRequestOpen}
                setIsSongRequestOpen={setIsSongRequestOpen}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Song Request Modal */}
      {profile && !isOwnProfile && (
        <SongRequestModal
          isOpen={isSongRequestOpen}
          onClose={() => setIsSongRequestOpen(false)}
          dj={userForComponents}
        />
      )}
    </div>
  );
}
