
import { Music, MapPin, Calendar, Users, Star, Trophy, Zap, Crown, Sparkles } from "lucide-react";

interface ProfileInfoProps {
  user: any;
  followerCount: number;
}

export function ProfileInfo({ user, followerCount }: ProfileInfoProps) {
  return (
    <div className="ml-0 mt-24 sm:ml-48 sm:mt-0 relative">
      {/* Ultra-enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/15 to-blue-500/20 blur-3xl rounded-3xl animate-mega-glow" />
      <div className="absolute -inset-6 bg-gradient-to-br from-purple-400/15 via-transparent to-pink-400/15 blur-2xl rounded-3xl animate-mega-glow" style={{animationDelay: '1s'}} />
      <div className="absolute -inset-8 bg-gradient-to-tl from-blue-400/10 via-transparent to-violet-400/10 blur-3xl rounded-3xl animate-mega-glow" style={{animationDelay: '2s'}} />
      
      <div className="relative z-10 premium-card rounded-3xl p-10 interactive-hover ultra-glow">
        {/* Enhanced floating particles inside card */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute top-6 right-12 w-2 h-2 bg-purple-400 rounded-full animate-viral-bounce ultra-glow" />
          <div className="absolute bottom-12 left-16 w-1 h-1 bg-pink-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '1s'}} />
          <div className="absolute top-1/2 right-20 w-1 h-1 bg-blue-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '0.5s'}} />
          <div className="absolute top-8 left-8 w-1 h-1 bg-violet-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '1.5s'}} />
          <div className="absolute bottom-8 right-8 w-2 h-2 bg-cyan-400 rounded-full animate-viral-bounce ultra-glow" style={{animationDelay: '2s'}} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <Crown className="mr-3 h-8 w-8 text-yellow-400 animate-viral-bounce ultra-glow" />
            <h1 className="text-6xl font-bold gradient-text mb-2 neon-text animate-viral-bounce">
              {user.name}
            </h1>
            <Sparkles className="ml-3 h-8 w-8 text-pink-400 animate-viral-bounce ultra-glow" style={{animationDelay: '0.5s'}} />
          </div>
          <p className="text-2xl text-purple-300 mb-6 font-bold text-glow">@{user.username}</p>
          
          {/* Ultra-enhanced role badge */}
          <div className="inline-flex items-center mb-8 group magnetic-hover">
            <span className="px-6 py-3 text-lg font-bold bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-blue-500/40 border-2 border-purple-400/60 rounded-full text-purple-200 capitalize ultra-glow transition-all duration-500 group-hover:scale-110">
              <Star className="mr-3 h-5 w-5 inline animate-viral-bounce text-yellow-400" />
              {user.role}
              <Trophy className="ml-3 h-5 w-5 inline text-gold-400" />
            </span>
          </div>
          
          {/* Enhanced location with premium styling */}
          {user.location && (
            <div className="flex items-center mb-8 text-blue-300 group magnetic-hover">
              <div className="p-3 rounded-xl bg-blue-500/30 mr-4 group-hover:bg-blue-500/40 transition-colors ultra-glow">
                <MapPin className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-glow">{user.location}</span>
            </div>
          )}
          
          {/* Ultra-enhanced bio */}
          {user.bio && (
            <div className="mb-10 p-8 rounded-2xl bg-gradient-to-r from-white/10 to-white/15 border border-white/20 ultra-glow magnetic-hover">
              <p className="text-gray-200 text-xl leading-relaxed font-medium text-glow">{user.bio}</p>
            </div>
          )}
          
          {/* Premium genres with enhanced effects */}
          {user.genres?.length > 0 && (
            <div className="mb-10">
              <h3 className="text-lg font-bold text-purple-300 mb-6 uppercase tracking-wider flex items-center">
                <Zap className="mr-3 h-5 w-5 animate-viral-bounce ultra-glow" />
                Music Genres
                <Sparkles className="ml-3 h-5 w-5 animate-viral-bounce ultra-glow" style={{animationDelay: '0.3s'}} />
              </h3>
              <div className="flex flex-wrap gap-4">
                {user.genres.map((genre: string, index: number) => (
                  <span
                    key={genre}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 border-2 border-purple-400/50 px-6 py-3 text-lg font-bold text-purple-200 hover:from-purple-500/50 hover:via-pink-500/50 hover:to-blue-500/50 transition-all duration-500 cursor-pointer magnetic-hover ultra-glow"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <Music className="mr-3 h-5 w-5 animate-viral-bounce" />
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Ultra-enhanced stats with premium styling */}
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-500/25 via-purple-500/15 to-transparent border-2 border-purple-400/40 magnetic-hover ultra-glow">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 rounded-full bg-purple-500/40 ultra-glow">
                  <Users className="h-8 w-8 text-purple-300 animate-viral-bounce" />
                </div>
              </div>
              <p className="text-4xl font-bold text-white mb-2 neon-text">{followerCount.toLocaleString()}</p>
              <p className="text-lg text-purple-300 font-bold uppercase tracking-wide">Followers</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-pink-500/25 via-pink-500/15 to-transparent border-2 border-pink-400/40 magnetic-hover ultra-glow">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 rounded-full bg-pink-500/40 ultra-glow">
                  <Users className="h-8 w-8 text-pink-300 animate-viral-bounce" style={{animationDelay: '0.2s'}} />
                </div>
              </div>
              <p className="text-4xl font-bold text-white mb-2 neon-text">{user.following?.toLocaleString() || 0}</p>
              <p className="text-lg text-pink-300 font-bold uppercase tracking-wide">Following</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-500/25 via-blue-500/15 to-transparent border-2 border-blue-400/40 magnetic-hover ultra-glow">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 rounded-full bg-blue-500/40 ultra-glow">
                  <Calendar className="h-8 w-8 text-blue-300 animate-viral-bounce" style={{animationDelay: '0.4s'}} />
                </div>
              </div>
              <p className="text-4xl font-bold text-white mb-2 neon-text">{user.events?.length || 0}</p>
              <p className="text-lg text-blue-300 font-bold uppercase tracking-wide">Events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
