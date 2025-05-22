
import { useState } from "react";
import { usePromoterEvents } from "./usePromoterEvents";

export const useSelectedEvent = () => {
  const { promoterEvents } = usePromoterEvents();
  const [selectedEventId, setSelectedEventId] = useState<string>(promoterEvents[0]?.id || "");
  
  return { selectedEventId, setSelectedEventId };
};
