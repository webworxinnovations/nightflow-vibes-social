import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { EventDetailsFields } from "./EventDetailsFields";
import { EventVenueFields } from "./EventVenueFields";
import { EventLineupSelector } from "./EventLineupSelector";
import { SubPromoterSelector } from "./SubPromoterSelector";
import { users } from "@/lib/mock-data";

// Define form schema
export const eventFormSchema = z.object({
  title: z.string().min(3, {
    message: "Event title must be at least 3 characters."
  }),
  date: z.date({
    required_error: "A date is required."
  }),
  startTime: z.string({
    required_error: "Start time is required."
  }),
  endTime: z.string({
    required_error: "End time is required."
  }),
  venue: z.string().min(3, {
    message: "Venue name is required."
  }),
  address: z.string().min(8, {
    message: "Please enter a complete address."
  }),
  price: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Price must be a number."
  }),
  maxCapacity: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Capacity must be a number."
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters."
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL for the image."
  }),
  lineup: z.array(z.string()).nonempty({
    message: "Please select at least one DJ for the lineup."
  }),
  subPromoters: z.array(z.string()).optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const EventForm = () => {
  const navigate = useNavigate();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      venue: "",
      address: "",
      price: "",
      maxCapacity: "",
      description: "",
      imageUrl: "",
      startTime: "",
      endTime: "",
      lineup: [],
      subPromoters: [],
    }
  });

  function onSubmit(values: EventFormValues) {
    // In a real app, we would send this data to a backend
    console.log("Event submission:", values);
    
    // Get sub-promoter names for the toast message
    const subPromoterNames = values.subPromoters && values.subPromoters.length > 0 
      ? users.filter(u => values.subPromoters?.includes(u.id)).map(u => u.name)
      : [];
    
    // Show success toast with sub-promoter information
    toast({
      title: "Event created successfully!",
      description: `Your event has been posted and is now visible in the Discover page.${
        subPromoterNames.length > 0 
          ? ` ${subPromoterNames.length} sub-promoters added: ${subPromoterNames.join(', ')}`
          : ''
      }`,
    });
    
    // Navigate to the events page
    setTimeout(() => {
      navigate('/events');
    }, 1500);
  }

  console.log("Form rendering, current values:", form.watch());

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EventDetailsFields control={form.control} />
          <EventVenueFields control={form.control} />
        </div>
        
        <div className="bg-muted/30 p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Event Lineup & Promoters</h2>
          <EventLineupSelector control={form.control} />
          
          <div className="mt-6">
            <SubPromoterSelector control={form.control} />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Create Event</Button>
        </div>
      </form>
    </Form>
  );
};
