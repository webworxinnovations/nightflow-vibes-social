
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/events/EventForm";

export default function CreateEvent() {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create New Event</h1>
      </div>
      
      <div className="bg-card/40 p-6 rounded-xl border">
        <EventForm />
      </div>
    </div>
  );
}
