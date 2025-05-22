
import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { users } from "@/lib/mock-data";
import { Control } from "react-hook-form";
import { EventFormValues } from "./EventForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useSubPromoters } from "@/contexts/SubPromoterContext";
import { useAuth } from "@/contexts/AuthContext";

interface SubPromoterSelectorProps {
  control: Control<EventFormValues>;
}

export const SubPromoterSelector = ({ control }: SubPromoterSelectorProps) => {
  const { currentUser } = useAuth();
  const { subPromoters, getSubPromotersForPromoter } = useSubPromoters();
  const [selectedPromoters, setSelectedPromoters] = useState<string[]>([]);
  
  const promoterId = currentUser?.id || "6"; // Default to mock promoter if not logged in
  
  // Get all sub-promoters for this promoter
  const mySubPromoters = getSubPromotersForPromoter(promoterId);
  
  // Combine system users who can be sub-promoters with custom added sub-promoters
  const potentialSubPromoters = [
    ...users.filter(user => 
      user.role === "promoter" || user.role === "dj" || user.role === "fan"
    ),
    ...mySubPromoters.filter(sp => 
      // Filter out any duplicates that might exist in both arrays
      !users.some(u => u.id === sp.id)
    )
  ];
  
  // Get selected promoter names for display
  const getSelectedPromoterNames = () => {
    return potentialSubPromoters
      .filter(promoter => selectedPromoters.includes(promoter.id))
      .map(promoter => promoter.name);
  };
  
  console.log("Sub promoters available:", potentialSubPromoters.length);
  console.log("Custom sub promoters:", mySubPromoters.length);
  
  return (
    <FormField
      control={control}
      name="subPromoters"
      render={({ field }) => {
        // Keep local state in sync with form field value
        useEffect(() => {
          if (field.value) {
            setSelectedPromoters(field.value);
          }
        }, [field.value]);
        
        return (
          <FormItem className="border p-4 rounded-md bg-card/50 mt-6">
            <FormLabel className="text-lg font-semibold">Sub-Promoters</FormLabel>
            <FormDescription>
              Select individuals who will help promote this event and sell tickets
            </FormDescription>
            
            {/* Show selected sub-promoters */}
            {field.value?.length > 0 && (
              <div className="flex flex-wrap gap-2 my-3">
                {getSelectedPromoterNames().map((name, index) => (
                  <Badge key={index} variant="secondary">{name}</Badge>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {potentialSubPromoters.map((promoter) => (
                <div 
                  key={promoter.id}
                  role="button"
                  tabIndex={0}
                  className={`
                    flex items-center p-3 rounded-md cursor-pointer border
                    ${field.value?.includes(promoter.id) 
                      ? 'border-primary bg-primary/10' 
                      : 'border-white/10 hover:bg-primary/5'}
                    ${mySubPromoters.some(sp => sp.id === promoter.id) ? 'ring-1 ring-primary/30' : ''}
                  `}
                  onClick={() => {
                    const currentValue = field.value || [];
                    const newValue = currentValue.includes(promoter.id)
                      ? currentValue.filter(id => id !== promoter.id)
                      : [...currentValue, promoter.id];
                    field.onChange(newValue);
                    setSelectedPromoters(newValue);
                    console.log("Selected sub-promoters:", newValue);
                  }}
                >
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={promoter.avatar} alt={promoter.name} />
                    <AvatarFallback>{promoter.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{promoter.name}</span>
                  {mySubPromoters.some(sp => sp.id === promoter.id) && (
                    <Badge variant="outline" className="ml-auto text-xs">Custom</Badge>
                  )}
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
