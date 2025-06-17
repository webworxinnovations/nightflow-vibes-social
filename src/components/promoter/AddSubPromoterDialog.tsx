
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useSubPromoters } from "@/contexts/SubPromoterContext";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface AddSubPromoterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddSubPromoterDialog = ({ isOpen, onOpenChange }: AddSubPromoterDialogProps) => {
  const [newPromoter, setNewPromoter] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: ""
  });
  
  const { addSubPromoter } = useSubPromoters();
  const { user } = useSupabaseAuth();

  const handleAddSubPromoter = () => {
    if (!newPromoter.name || !newPromoter.email) {
      toast({
        title: "Missing information",
        description: "Please provide at least a name and email for the sub-promoter.",
        variant: "destructive"
      });
      return;
    }

    // Get the current promoter ID
    const promoterId = user?.id || "6"; // Default to mock promoter if not logged in

    // Use our context to add the new sub-promoter - including parentPromoterId
    addSubPromoter({
      name: newPromoter.name,
      email: newPromoter.email,
      phone: newPromoter.phone || "",
      avatar: newPromoter.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newPromoter.name)}&background=random`,
      parentPromoterId: promoterId
    });

    toast({
      title: "Sub-promoter added",
      description: `${newPromoter.name} has been added as a sub-promoter.`,
    });
    
    setNewPromoter({ name: "", email: "", phone: "", avatar: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Sub-Promoter</DialogTitle>
          <DialogDescription>
            Add someone who will help promote your events and sell tickets
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input
              id="name"
              value={newPromoter.name}
              onChange={(e) => setNewPromoter({...newPromoter, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              value={newPromoter.email}
              onChange={(e) => setNewPromoter({...newPromoter, email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Phone (optional)</label>
            <Input
              id="phone"
              value={newPromoter.phone}
              onChange={(e) => setNewPromoter({...newPromoter, phone: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAddSubPromoter}>Add Sub-Promoter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
