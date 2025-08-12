import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export const useSecureProfile = (profileId?: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCounts, setFollowCounts] = useState({ follower_count: 0, following_count: 0 });
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (!profileId || !user) return;

    const checkFollowStatus = async () => {
      try {
        // Use secure function to check if following
        const { data: isFollowingData, error } = await supabase
          .rpc('is_following', { profile_id: profileId });

        if (!error) {
          setIsFollowing(isFollowingData || false);
        }

        // Get follow counts using secure function
        const { data: countsData, error: countsError } = await supabase
          .rpc('get_follow_counts', { profile_id: profileId })
          .single();

        if (!countsError && countsData) {
          setFollowCounts(countsData);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [profileId, user]);

  const toggleFollow = async () => {
    if (!user || !profileId) return;

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileId);

        if (!error) {
          setIsFollowing(false);
          setFollowCounts(prev => ({ ...prev, follower_count: prev.follower_count - 1 }));
        }
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profileId
          });

        if (!error) {
          setIsFollowing(true);
          setFollowCounts(prev => ({ ...prev, follower_count: prev.follower_count + 1 }));
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return {
    isFollowing,
    followCounts,
    toggleFollow
  };
};