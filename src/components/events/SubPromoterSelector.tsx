import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { users } from "@/lib/mock-data";
import { Control } from "react-hook-form";
import { EventFormValues } from "./EventForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface SubPromoterSelectorProps {
  control: Control<EventFormValues>;
}

export const SubPromoterSelector = ({ control }: SubPromoterSelectorProps) => {
  // Filter users who can be sub-promoters (could be refined based on your app's logic)
  const potentialSubPromoters = users.filter(user => 
    user.role === "promoter" || user.role === "dj" || user.role === "fan"
  );
  
  // Track selected promoters for visual feedback
  const [selectedPromoteres, setSelectedPromoters] = useState<string[]>([]);
  
  // Get selected promoter names for display
  const getSelectedPromoterNames = () => {
    return users
      .filter(user => selectedPromoteres.includes(user.id))
      .map(user => user.name);
  };
  
  console.log("Sub promoters available:", potentialSubPromoters.length);
  
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
