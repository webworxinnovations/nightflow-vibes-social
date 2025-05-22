
import React from "react";
import { usePromoterEvents } from "@/hooks/usePromoterEvents";

interface EventSelectorProps {
  selectedEventId: string;
  onChange: (eventId: string) => void;
}

export const EventSelector = ({ selectedEventId, onChange }: EventSelectorProps) => {
  const { promoterEvents } = usePromoterEvents();
  
  return (
    <select 
      className="rounded-md border border-white/10 bg-background px-3 py-1 text-sm"
      value={selectedEventId}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>Select event</option>
      {promoterEvents.map(event => (
        <option key={event.id} value={event.id}>
          {event.title}
        </option>
      ))}
    </select>
  );
};
