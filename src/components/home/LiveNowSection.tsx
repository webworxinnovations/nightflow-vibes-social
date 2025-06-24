
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { Event } from "@/hooks/useEvents";

interface LiveNowSectionProps {
  liveEvents: any[];
  liveDjs: any[];
  transformedLiveEvents: Event[];
}

export const LiveNowSection = ({ liveEvents, liveDjs, transformedLiveEvents }: LiveNowSectionProps) => {
  if (liveEvents.length === 0 && liveDjs.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <div className="mb-4 flex items-center">
        <div className="mr-2 h-3 w-3 rounded-full bg-red-500 animate-pulse" style={{
          boxShadow: '0 0 8px rgba(239, 68, 68, 0.8), 0 0 16px rgba(239, 68, 68, 0.6), 0 0 24px rgba(239, 68, 68, 0.4)'
        }}></div>
        <h2 className="text-xl font-semibold text-white drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]">Live Now</h2>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-4">
          {liveEvents.map((event) => (
            <div key={event.id} className="w-80 flex-none">
              <div className="relative h-40 overflow-hidden rounded-xl">
                <img
                  src={event.image}
                  alt={event.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-lg font-bold text-white">{event.title}</h3>
                  <p className="text-sm text-white/80">{event.venue}</p>
                  
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Flame
                        key={i}
                        className={`h-5 w-5 ${i < event.vibe! ? "text-orange-500" : "text-gray-400"}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-white/80">
                      {event.ticketsSold}/{event.maxCapacity} attendees
                    </span>
                  </div>
                </div>
                
                <Link 
                  to={`/events/${event.id}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all hover:bg-black/40 hover:opacity-100"
                >
                  <Button>View Event</Button>
                </Link>
              </div>
            </div>
          ))}
          
          {liveDjs.map((dj) => (
            <div key={dj.id} className="w-60 flex-none">
              <div className="h-40 overflow-hidden rounded-xl">
                <div className="relative h-full">
                  <img
                    src={dj.coverImage}
                    alt={dj.name}
                    className="h-full w-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4 text-center w-full">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full border-2 border-red-500" style={{
                          animation: 'pulse 2s infinite',
                          boxShadow: '0 0 8px rgba(239, 68, 68, 0.8), 0 0 16px rgba(239, 68, 68, 0.6)'
                        }}></div>
                        <div className="relative z-10">
                          <img
                            src={dj.avatar}
                            alt={dj.name}
                            className="h-16 w-16 rounded-full border-2 border-white object-cover"
                          />
                        </div>
                      </div>
                      <h3 className="mt-1 text-lg font-bold text-white">{dj.name}</h3>
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white" style={{
                        boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)'
                      }}>
                        LIVE
                      </span>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/profile/${dj.id}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all hover:bg-black/40 hover:opacity-100"
                  >
                    <Button>View Profile</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
