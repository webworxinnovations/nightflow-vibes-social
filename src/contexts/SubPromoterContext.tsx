
import React, { createContext, useContext, useState, useEffect } from "react";
import { SubPromoter, users } from "@/lib/mock-data";
import { v4 as uuidv4 } from "uuid";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

// Define the context type
type SubPromoterContextType = {
  subPromoters: SubPromoter[];
  addSubPromoter: (subPromoter: Omit<SubPromoter, "id" | "uniqueCode" | "ticketsSold">) => void;
  getSubPromotersForPromoter: (promoterId: string) => SubPromoter[];
};

// Create the context
const SubPromoterContext = createContext<SubPromoterContextType | undefined>(undefined);

// Create a provider component
export const SubPromoterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with sub-promoters from mock data
  const [subPromoters, setSubPromoters] = useState<SubPromoter[]>([]);
  const { user } = useSupabaseAuth();

  // Load existing sub-promoters from localStorage on mount
  useEffect(() => {
    const storedSubPromoters = localStorage.getItem('subPromoters');
    if (storedSubPromoters) {
      setSubPromoters(JSON.parse(storedSubPromoters));
    }
  }, []);

  // Save sub-promoters to localStorage whenever they change
  useEffect(() => {
    if (subPromoters.length > 0) {
      localStorage.setItem('subPromoters', JSON.stringify(subPromoters));
    }
  }, [subPromoters]);

  // Generate a unique 6-character code
  const generateUniqueCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Add a new sub-promoter
  const addSubPromoter = (newPromoter: Omit<SubPromoter, "id" | "uniqueCode" | "ticketsSold">) => {
    // Use parentPromoterId from the newPromoter object, this is now required
    const promoterId = newPromoter.parentPromoterId;
    
    // Create a full sub-promoter object with generated ID and code
    const fullPromoter: SubPromoter = {
      id: uuidv4(),
      uniqueCode: generateUniqueCode(),
      ticketsSold: 0,
      ...newPromoter
    };
    
    setSubPromoters(prev => [...prev, fullPromoter]);
    
    console.log("Added new sub-promoter:", fullPromoter);
    return fullPromoter;
  };

  // Get sub-promoters for a specific promoter
  const getSubPromotersForPromoter = (promoterId: string): SubPromoter[] => {
    return subPromoters.filter(promoter => promoter.parentPromoterId === promoterId);
  };

  return (
    <SubPromoterContext.Provider 
      value={{ 
        subPromoters,
        addSubPromoter,
        getSubPromotersForPromoter
      }}
    >
      {children}
    </SubPromoterContext.Provider>
  );
};

// Custom hook to use the sub-promoter context
export const useSubPromoters = () => {
  const context = useContext(SubPromoterContext);
  if (context === undefined) {
    throw new Error('useSubPromoters must be used within a SubPromoterProvider');
  }
  return context;
};
