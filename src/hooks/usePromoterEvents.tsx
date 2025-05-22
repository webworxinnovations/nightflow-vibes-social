
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getEventsByPromoter } from "@/lib/mock-data";

export const usePromoterEvents = () => {
  const { currentUser } = useAuth();
  const promoterId = currentUser?.id || "6"; // Default to mock promoter if not logged in
  const promoterEvents = getEventsByPromoter(promoterId);
  
  return { promoterEvents, promoterId };
};
