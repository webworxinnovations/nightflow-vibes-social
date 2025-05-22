
import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { users } from "@/lib/mock-data";
import { Control } from "react-hook-form";
import { EventFormValues } from "./EventForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SubPromoterSelectorProps {
  control: Control<EventFormValues>;
}

export const SubPromoterSelector = ({ control }: SubPromoterSelectorProps) => {
  // Filter users who can be sub-promoters (could be refined based on your app's logic)
  const potentialSubPromoters = users.filter(user => 
    user.role === "promoter" || user.role === "dj" || user.role === "fan"
  );
  
  return (
    <FormField
      control={control}
      name="subPromoters"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Sub-Promoters</FormLabel>
          <FormDescription>
            Select individuals who will help promote this event and sell tickets
          </FormDescription>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {potentialSubPromoters.map((promoter) => (
              <div 
                key={promoter.id}
                className={`
                  flex items-center p-2 rounded-md cursor-pointer border
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
                }}
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={promoter.avatar} alt={promoter.name} />
                  <AvatarFallback>{promoter.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{promoter.name}</span>
              </div>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
