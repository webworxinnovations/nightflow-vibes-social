
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MapPin, DollarSign } from "lucide-react";
import { Control } from "react-hook-form";
import { EventFormValues } from "./EventForm";

interface EventVenueFieldsProps {
  control: Control<EventFormValues>;
}

export const EventVenueFields = ({ control }: EventVenueFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="venue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Venue</FormLabel>
            <FormControl>
              <Input placeholder="Enter venue name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="123 Main St, City, State" className="pl-9" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ticket Price ($)</FormLabel>
            <FormControl>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="number" className="pl-9" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="maxCapacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Capacity</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
