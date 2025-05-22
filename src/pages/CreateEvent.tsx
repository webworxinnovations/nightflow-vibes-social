
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/events/EventForm";

export default function CreateEvent() {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create New Event</h1>
      </div>
      
      <EventForm />
    </div>
  );
}
