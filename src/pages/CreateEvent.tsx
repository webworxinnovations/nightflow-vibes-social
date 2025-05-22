
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft, MapPin, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { users } from "@/lib/mock-data";
import { toast } from "@/components/ui/use-toast";

// Define form schema
const formSchema = z.object({
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
  })
});

export default function CreateEvent() {
  const navigate = useNavigate();
  const [selectedDJs, setSelectedDJs] = useState<string[]>([]);
  
  const djs = users.filter(user => user.role === "dj");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
      lineup: []
    }
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, we would send this data to a backend
    console.log("Event submission:", values);
    
    // Show success toast
    toast({
      title: "Event created successfully!",
      description: "Your event has been posted and is now visible in the Discover page.",
    });
    
    // Navigate to the events page
    setTimeout(() => {
      navigate('/events');
    }, 1500);
  }
  
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create New Event</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a URL for your event flyer or image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="time" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="time" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
          </div>
          
          <FormField
            control={form.control}
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
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your event..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
