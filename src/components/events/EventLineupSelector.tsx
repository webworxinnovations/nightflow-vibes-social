
import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { users } from "@/lib/mock-data";
import { Control } from "react-hook-form";
import { EventFormValues } from "./EventForm";

interface EventLineupSelectorProps {
  control: Control<EventFormValues>;
}

export const EventLineupSelector = ({ control }: EventLineupSelectorProps) => {
  const djs = users.filter(user => user.role === "dj");
  
  return (
    <FormField
      control={control}
      name="lineup"
      render={({ field }) => (
        <FormItem>
          <FormLabel>DJ Lineup</FormLabel>
          <FormDescription>
            Select DJs that will perform at this event
          </FormDescription>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {djs.map((dj) => (
              <div 
                key={dj.id}
                className={`
                  flex items-center p-2 rounded-md cursor-pointer border
                  ${field.value.includes(dj.id) 
                    ? 'border-primary bg-primary/10' 
                    : 'border-white/10 hover:bg-primary/5'}
                `}
                onClick={() => {
                  const newValue = field.value.includes(dj.id)
                    ? field.value.filter(id => id !== dj.id)
                    : [...field.value, dj.id];
                  field.onChange(newValue);
                }}
              >
                <img 
                  src={dj.avatar} 
                  alt={dj.name} 
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{dj.name}</span>
              </div>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
