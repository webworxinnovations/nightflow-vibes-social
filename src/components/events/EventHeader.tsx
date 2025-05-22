
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/mock-data";
import { Calendar, Clock, MapPin, Users, ArrowLeft } from "lucide-react";

interface EventHeaderProps {
  image: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  ticketsSold: number;
  maxCapacity: number;
  isLive: boolean;
}

export function EventHeader({
  image,
  title,
  date,
  time,
  venue,
  ticketsSold,
  maxCapacity,
  isLive,
}: EventHeaderProps) {
  return (
    <>
      <Button variant="ghost" className="mb-4" asChild>
        <Link to="/events">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Link>
      </Button>
      
      <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 md:h-96">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        {isLive && (
          <div className="absolute top-4 left-4 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
            LIVE NOW
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-3xl font-bold text-white md:text-4xl">{title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-white">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              {formatDate(date)}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              {time}
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              {venue}
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              {ticketsSold}/{maxCapacity}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
