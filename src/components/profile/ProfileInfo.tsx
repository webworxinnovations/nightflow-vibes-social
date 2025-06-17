
import { Music, MapPin, Calendar, Users, Star } from "lucide-react";

interface ProfileInfoProps {
  user: any;
  followerCount: number;
}

export function ProfileInfo({ user, followerCount }: ProfileInfoProps) {
  return (
    <div className="ml-0 mt-16 sm:ml-40 sm:mt-0 relative">
      {/* Glow effect behind text */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl rounded-3xl" />
      
      <div className="relative z-10 p-6 backdrop-blur-sm bg-black/20 rounded-2xl border border-white/10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          {user.name}
        </h1>
        <p className="text-lg text-purple-300 mb-2">@{user.username}</p>
        
        {/* Role badge */}
        <div className="inline-flex items-center mb-4">
          <span className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-full text-purple-300 capitalize">
            <Star className="mr-1 h-3 w-3" />
            {user.role}
          </span>
        </div>
        
        {/* Location */}
        {user.location && (
          <div className="flex items-center mb-4 text-blue-300">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{user.location}</span>
          </div>
        )}
        
        {/* Bio */}
        {user.bio && (
          <p className="text-gray-300 mb-4 leading-relaxed">{user.bio}</p>
        )}
        
        {/* Genres */}
        {user.genres?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">MUSIC GENRES</h3>
            <div className="flex flex-wrap gap-2">
              {user.genres.map((genre: string) => (
                <span
                  key={genre}
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 px-3 py-1 text-sm text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
                >
                  <Music className="mr-1 h-3 w-3" />
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-400/20">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-purple-400 mr-1" />
            </div>
            <p className="text-2xl font-bold text-white">{followerCount.toLocaleString()}</p>
            <p className="text-sm text-purple-300">Followers</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-400/20">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-pink-400 mr-1" />
            </div>
            <p className="text-2xl font-bold text-white">{user.following?.toLocaleString() || 0}</p>
            <p className="text-sm text-pink-300">Following</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-400/20">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-blue-400 mr-1" />
            </div>
            <p className="text-2xl font-bold text-white">{user.events?.length || 0}</p>
            <p className="text-sm text-blue-300">Events</p>
          </div>
        </div>
      </div>
    </div>
  );
}
