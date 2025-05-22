
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, ExternalLink } from "lucide-react";
import { format, isPast } from "date-fns";

interface Event {
  id: string;
  name: string;
  date: string;
  ticketsSold: number;
  totalTickets: number;
  commission: string;
}

interface SubPromoterEventsTableProps {
  events: Event[];
  onShowQrCode: (eventId: string) => void;
}

export const SubPromoterEventsTable = ({ events, onShowQrCode }: SubPromoterEventsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Commission</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => {
          const eventDate = new Date(event.date);
          const isEventPast = isPast(eventDate);
          const progress = Math.round((event.ticketsSold / event.totalTickets) * 100);
          
          return (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.name}</TableCell>
              <TableCell>
                {format(eventDate, "MMM dd, yyyy")}
                <div className="mt-1">
                  <Badge variant={isEventPast ? "outline" : "secondary"}>
                    {isEventPast ? "Past" : "Upcoming"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mr-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <span className="text-xs whitespace-nowrap">{event.ticketsSold}/{event.totalTickets}</span>
                </div>
              </TableCell>
              <TableCell>{event.commission}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onShowQrCode(event.id)}>
                  <QrCode className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={`/events/${event.id}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
