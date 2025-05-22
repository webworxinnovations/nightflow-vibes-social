
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { SubPromoter, generateTicketLink } from "@/lib/mock-data";
import { toast } from "@/components/ui/use-toast";

interface QrCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPromoter: SubPromoter | null;
  eventId: string;
}

export const QrCodeDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedPromoter, 
  eventId 
}: QrCodeDialogProps) => {
  const copyLink = () => {
    if (!selectedPromoter) return;
    
    const link = generateTicketLink(eventId, selectedPromoter.uniqueCode);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "The ticket link has been copied to your clipboard.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ticket Link QR Code</DialogTitle>
          <DialogDescription>
            Share this QR code with your sub-promoter
          </DialogDescription>
        </DialogHeader>
        {selectedPromoter && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="mb-4 p-4 bg-white rounded-md">
              {/* In a real implementation, this would be an actual QR code */}
              <div className="w-64 h-64 grid grid-cols-8 grid-rows-8 gap-1">
                {Array(64).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className={`
                      ${Math.random() > 0.7 ? "bg-black" : "bg-transparent"}
                      ${(i < 8 || i >= 56 || i % 8 === 0 || i % 8 === 7) ? "bg-black" : ""}
                    `}
                  />
                ))}
              </div>
            </div>
            <p className="text-center text-sm">
              {generateTicketLink(eventId, selectedPromoter.uniqueCode)}
            </p>
            <Button className="mt-4" onClick={copyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
