
import { useState } from "react";
import { EventCard } from "@/components/cards/event-card";
import { Calendar, List, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { events, formatDate } from "@/lib/mock-data";

export default function Events() {
  const [view, setView] = useState("grid");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const prevMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(date);
  };
  
  const nextMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(date);
  };
  
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Get days in current month
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  
  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, typeof events>);
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setView("grid")}>
            <List className={view === "grid" ? "text-primary" : ""} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setView("calendar")}>
            <Calendar className={view === "calendar" ? "text-primary" : ""} />
          </Button>
        </div>
      </div>
      
      <div className="mb-6 flex justify-between">
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past Events</SelectItem>
          </SelectContent>
        </Select>
        
        <Select defaultValue="date">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date: Newest First</SelectItem>
            <SelectItem value="date-asc">Date: Oldest First</SelectItem>
            <SelectItem value="price">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="live">Live Now</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="glassmorphism rounded-lg p-4">
              <div className="mb-4 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold">{monthName}</h2>
                <Button variant="ghost" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                
                {blanks.map((blank) => (
                  <div key={`blank-${blank}`} className="h-24 p-1"></div>
                ))}
                
                {days.map((day) => {
                  const date = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const hasEvents = eventsByDate[date]?.length > 0;
                  
                  return (
                    <div 
                      key={day} 
                      className={`relative h-24 border border-white/10 p-1 transition-all hover:bg-white/5 ${
                        hasEvents ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="text-sm">{day}</div>
                      {hasEvents && (
                        <div className="mt-1 space-y-1">
                          {eventsByDate[date].map((event) => (
                            <div 
                              key={event.id}
                              className="rounded bg-primary/20 p-1 text-xs"
                            >
                              {event.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="live">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events
              .filter((event) => event.isLive)
              .map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            
            {events.filter((event) => event.isLive).length === 0 && (
              <div className="col-span-full py-12 text-center">
                <h3 className="text-lg font-semibold">No live events right now</h3>
                <p className="text-muted-foreground">
                  Check back later or browse upcoming events
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="past">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
