
import { Music, MapPin, Calendar, Users, Star, Trophy, Zap } from "lucide-react";

interface ProfileInfoProps {
  user: any;
  followerCount: number;
}

export function ProfileInfo({ user, followerCount }: ProfileInfoProps) {
  return (
    <div className="ml-0 mt-20 sm:ml-44 sm:mt-0 relative">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-blue-500/15 blur-3xl rounded-3xl" />
      <div className="absolute -inset-4 bg-gradient-to-br from-purple-400/10 via-transparent to-pink-400/10 blur-2xl rounded-3xl animate-pulse" />
      
      <div className="relative z-10 premium-card rounded-3xl p-8 interactive-hover">
        {/* Floating particles inside card */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute top-4 right-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
          <div className="absolute bottom-8 left-12 w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
          <div className="absolute top-1/2 right-16 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold gradient-text mb-2 neon-text">
            {user.name}
          </h1>
          <p className="text-xl text-purple-300 mb-4 font-medium">@{user.username}</p>
          
          {/* Enhanced role badge */}
          <div className="inline-flex items-center mb-6 group">
            <span className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 border border-purple-400/50 rounded-full text-purple-200 capitalize elite-glow transition-all duration-300 group-hover:scale-105">
              <Star className="mr-2 h-4 w-4 inline animate-pulse" />
              {user.role}
              <Trophy className="ml-2 h-4 w-4 inline" />
            </span>
          </div>
          
          {/* Location with enhanced styling */}
          {user.location && (
            <div className="flex items-center mb-6 text-blue-300 group">
              <div className="p-2 rounded-lg bg-blue-500/20 mr-3 group-hover:bg-blue-500/30 transition-colors">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-lg font-medium">{user.location}</span>
            </div>
          )}
          
          {/* Enhanced bio */}
          {user.bio && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
              <p className="text-gray-200 text-lg leading-relaxed font-medium">{user.bio}</p>
            </div>
          )}
          
          {/* Enhanced genres */}
          {user.genres?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-purple-300 mb-4 uppercase tracking-wider flex items-center">
                <Zap className="mr-2 h-4 w-4" />
                Music Genres
              </h3>
              <div className="flex flex-wrap gap-3">
                {user.genres.map((genre: string, index: number) => (
                  <span
                    key={genre}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500/25 via-pink-500/25 to-blue-500/25 border border-purple-400/40 px-4 py-2 text-sm font-semibold text-purple-200 hover:from-purple-500/40 hover:via-pink-500/40 hover:to-blue-500/40 transition-all duration-300 cursor-pointer interactive-hover"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <Music className="mr-2 h-4 w-4" />
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Enhanced stats with premium styling */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent border border-purple-400/30 interactive-hover elite-glow">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-full bg-purple-500/30">
                  <Users className="h-6 w-6 text-purple-300" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1 neon-text">{followerCount.toLocaleString()}</p>
              <p className="text-sm text-purple-300 font-semibold uppercase tracking-wide">Followers</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-pink-500/20 via-pink-500/10 to-transparent border border-pink-400/30 interactive-hover elite-glow">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-full bg-pink-500/30">
                  <Users className="h-6 w-6 text-pink-300" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1 neon-text">{user.following?.toLocaleString() || 0}</p>
              <p className="text-sm text-pink-300 font-semibold uppercase tracking-wide">Following</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent border border-blue-400/30 interactive-hover elite-glow">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 rounded-full bg-blue-500/30">
                  <Calendar className="h-6 w-6 text-blue-300" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1 neon-text">{user.events?.length || 0}</p>
              <p className="text-sm text-blue-300 font-semibold uppercase tracking-wide">Events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
