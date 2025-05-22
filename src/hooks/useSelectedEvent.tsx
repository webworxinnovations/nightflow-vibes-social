
import { useState } from "react";
import { events } from "@/lib/mock-data";

export const useSelectedEvent = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id);
  
  return { selectedEventId, setSelectedEventId };
};
